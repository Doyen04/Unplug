import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSudoCard } from "@/lib/sudo/client";

// ─── Response helpers ─────────────────────────────────────────────────────────

function buildApprovalResponse(reason?: string) {
    return NextResponse.json({
        statusCode: 200,
        responseCode: "00",
        data: {
            metadata: {
                source: "unplug-jit-gateway",
                ...(reason ? { reason } : {}),
            },
        },
    });
}

function buildDeclineResponse(reason: string) {
    return NextResponse.json({
        statusCode: 200,
        responseCode: "05",
        data: {
            metadata: {
                source: "unplug-jit-gateway",
                reason,
            },
        },
    });
}

// ─── Merchant name helpers ─────────────────────────────────────────────────────

/**
 * Strips punctuation, whitespace, and generic company suffixes from a name
 * so we can do a best-effort substring match between merchant descriptors
 * (which are often abbreviated or include domain suffixes) and service names.
 *
 * WHY NOT EXACT MATCH:
 *   A merchant can appear as "Netflix.com", "NETFLIX INT", "NFLX*NETFLIX"
 *   or even change names after an acquisition. Exact matching would generate
 *   too many false declines. A cleaned-token substring check is the same
 *   heuristic Privacy.com uses internally for its merchant lock feature.
 */
function normalizeMerchantToken(name: string): string {
    return name
        .toLowerCase()
        // strip all non-alphanumeric characters
        .replace(/[^a-z0-9]/g, "")
        // remove common generic suffixes that add noise
        .replace(/(com|net|org|inc|ltd|corp|co|cc|int|mktpl|store|payments|pay)$/g, "");
}

/**
 * Returns true if either the merchant descriptor contains the service name token
 * OR the service name token contains the merchant token (handles abbreviations).
 *
 * IMPORTANT: If the incoming descriptor is unknown (empty), we allow the
 * transaction through so Sudo's own MCC controls act as the primary gate.
 */
function isMerchantMatch(merchantName: string, serviceName: string): boolean {
    const normMerchant = normalizeMerchantToken(merchantName);
    const normService = normalizeMerchantToken(serviceName);
    if (!normMerchant || !normService) return true; // unknown descriptor → allow, let MCC gate it
    return normMerchant.includes(normService) || normService.includes(normMerchant);
}

/**
 * Returns the gap (in milliseconds) within which we block a second charge
 * for the same card. This is one billing-cycle minus a 5-day grace window.
 *
 * WHY: Subscription services sometimes retry a declined charge a few days
 * later. We give a 5-day grace window so legitimate retries are not blocked
 * while still preventing true double-billing within the same billing period.
 */
function billingWindowMs(frequencyLabel: string | null): number {
    switch (frequencyLabel?.toLowerCase()) {
        case "weekly":   return (7 - 5)   * 24 * 60 * 60 * 1000; // 2 days
        case "yearly":   return (365 - 5) * 24 * 60 * 60 * 1000; // 360 days
        case "monthly":
        default:         return (30 - 5)  * 24 * 60 * 60 * 1000; // 25 days
    }
}

// ─── Webhook handler ───────────────────────────────────────────────────────────

/**
 * Gateway-specific Sudo webhook handler.
 *
 * This route receives authorization lifecycle events for gateway funding sources,
 * records them in our local card transaction ledger, and returns the approval payload
 * expected by Sudo for real-time authorization requests.
 *
 * SECURITY LAYERS (in order):
 *  1. Bearer secret auth — rejects unsigned requests immediately.
 *  2. Card ownership check — declines cards not linked to any subscription.
 *  3. Idempotency — ignores duplicate delivery of the same authorization.request.
 *  4. Sudo MCC controls — Sudo already enforces allowedCategories on the card itself.
 *  5. Merchant match — soft check: if locked_merchant_name is set, incoming descriptor
 *     must fuzzy-match it; if not set, it fuzzy-checks against service_name.
 *  6. Spend limit — declines if charge exceeds card's configured limit.
 *  7. Double-billing window — declines if a non-failed charge already exists in the
 *     current billing period for this card.
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.SUDO_JIT_WEBHOOK_SECRET?.trim();

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const eventType = body?.type;
    const obj = body?.data?.object;

    const toKobo = (amount: number) => Math.round(Math.abs(amount) * 100);

    // ── card.balance event: return our virtual JIT balance ───────────────────
    if (eventType === "card.balance") {
        return NextResponse.json({
            statusCode: 200,
            responseCode: "00",
            data: {
                balance: Number(process.env.SUDO_JIT_GATEWAY_BALANCE ?? 0),
            },
        });
    }

    if (eventType === "authorization.request" || eventType === "authorization.updated") {
        const sudoCardId =
            typeof obj?.card === "string"
                ? obj.card
                : (obj?.card?._id ?? obj?.cardId ?? null);

        if (!sudoCardId) {
            return buildApprovalResponse("missing-card-id");
        }

        // ── 1. Look up the card and its associated subscription ───────────────
        const cardRecord = await db
            .selectFrom("subscription_cards as sc")
            .innerJoin("user_subscriptions as us", "us.id", "sc.subscription_id")
            .select([
                "sc.id",
                "sc.subscription_id",
                "sc.spend_limit_kobo",
                "sc.locked_merchant_name",
                "us.service_name",
                "us.frequency_label",
            ])
            .where("sc.sudo_card_id", "=", sudoCardId)
            .executeTakeFirst();

        if (!cardRecord) {
            return buildDeclineResponse("card-not-linked-to-subscription");
        }

        const subscriptionId = cardRecord.subscription_id;
        const serviceName = cardRecord.service_name;
        const frequencyLabel = cardRecord.frequency_label;

        // ── 2. Idempotency: ignore re-deliveries of the same authorization ────
        const existingAuthorization = await db
            .selectFrom("card_transactions")
            .select("id")
            .where("sudo_transaction_id", "=", obj._id)
            .executeTakeFirst();

        if (existingAuthorization && eventType === "authorization.request") {
            return buildApprovalResponse("duplicate-authorization-delivery");
        }

        // ── 3. Sudo MCC check (uses card's own spendingControls) ──────────────
        // We still fetch card details for the MCC allowedCategories enforcement.
        // Note: Sudo enforces these on the card level too — this is a belt-and-suspenders guard.
        let sudoCardDetails: Awaited<ReturnType<typeof getSudoCard>> | null = null;
        try {
            sudoCardDetails = await getSudoCard(sudoCardId);
        } catch (error) {
            console.warn("[jit-gateway] Unable to fetch Sudo card details", error);
        }

        const allowedCategories = sudoCardDetails?.spendingControls?.allowedCategories ?? [];
        const merchantCategory = obj?.merchant?.category?.toString();

        if (
            allowedCategories.length > 0 &&
            merchantCategory &&
            !allowedCategories.includes(merchantCategory)
        ) {
            return buildDeclineResponse("merchant-category-not-allowed");
        }

        // ── 4. Merchant name check ────────────────────────────────────────────
        // On first use the card has no locked_merchant_name yet, so we check
        // against the subscription's service_name as a soft signal.
        // On subsequent charges we check against the locked name that was saved
        // from the first approved transaction.
        //
        // If the descriptor is completely blank we skip the check and let through
        // (unknown descriptors are common for some processors).
        const incomingMerchantName = (obj?.merchant?.name ?? "").trim();
        const referenceForMatch = cardRecord.locked_merchant_name ?? serviceName;

        if (
            eventType === "authorization.request" &&
            incomingMerchantName &&
            !isMerchantMatch(incomingMerchantName, referenceForMatch)
        ) {
            console.warn(
                `[jit-gateway] Merchant mismatch for card ${sudoCardId}: ` +
                `incoming="${incomingMerchantName}" expected≈"${referenceForMatch}"`
            );
            return buildDeclineResponse("merchant-mismatch");
        }

        // ── 5. Spend limit ────────────────────────────────────────────────────
        const requestedAmountKobo = toKobo(Number(obj?.amount ?? 0));
        const spendLimitKobo = cardRecord.spend_limit_kobo ?? null;

        if (spendLimitKobo && requestedAmountKobo > spendLimitKobo) {
            return buildDeclineResponse("spend-limit-exceeded");
        }

        // ── 6. Double-billing window check ────────────────────────────────────
        // Block a second charge if a non-failed transaction already exists on
        // this card within the current billing window (e.g. 25 days for monthly).
        // This catches: same merchant retrying after a soft decline, billing bugs,
        // or fraudulent double-charges. Failed/declined past transactions are
        // explicitly excluded so legitimate retries are still allowed.
        if (eventType === "authorization.request") {
            const windowMs = billingWindowMs(frequencyLabel);
            const windowStart = new Date(Date.now() - windowMs);

            const recentCharge = await db
                .selectFrom("card_transactions")
                .select("id")
                .where("sudo_card_id", "=", sudoCardId)
                .where("status", "not in", ["declined", "failed"])
                .where("created_at", ">=", windowStart)
                // Exclude the current transaction ID in case this is an update
                .where("sudo_transaction_id", "!=", obj._id ?? "")
                .executeTakeFirst();

            if (recentCharge) {
                console.warn(
                    `[jit-gateway] Duplicate charge blocked for card ${sudoCardId} ` +
                    `within ${Math.round(windowMs / 86400000)}-day window`
                );
                return buildDeclineResponse("duplicate-charge-in-billing-window");
            }
        }

        // ── 7. Upsert the transaction record ──────────────────────────────────
        await db
            .insertInto("card_transactions")
            .values({
                sudo_card_id: sudoCardId,
                subscription_id: subscriptionId,
                sudo_transaction_id: obj._id,
                type: "authorization",
                status: obj.status ?? (eventType === "authorization.request" ? "pending" : "unknown"),
                amount_kobo: requestedAmountKobo,
                currency: obj.currency,
                merchant_name: incomingMerchantName || null,
                merchant_category: merchantCategory ?? null,
                channel: obj.transactionMetadata?.channel ?? null,
            })
            .onConflict((oc) =>
                oc
                    .column("sudo_transaction_id")
                    .doUpdateSet({
                        status: obj.status ?? "pending",
                        amount_kobo: requestedAmountKobo,
                        merchant_name: incomingMerchantName || null,
                        merchant_category: merchantCategory ?? null,
                        channel: obj.transactionMetadata?.channel ?? null,
                    }),
            )
            .execute();

        // ── 8. On first approved transaction: lock merchant descriptor ─────────
        // Save the real-world merchant name that the service uses so future
        // checks are based on what the merchant actually sends, not our
        // service_name guess.
        if (
            obj.status === "approved" &&
            !cardRecord.locked_merchant_name &&
            incomingMerchantName
        ) {
            await db
                .updateTable("subscription_cards")
                .set({
                    locked_merchant_name: incomingMerchantName,
                    updated_at: new Date(),
                })
                .where("id", "=", cardRecord.id)
                .execute();
        }

        // ── 9. Migration status update ────────────────────────────────────────
        if ((obj.status === "approved" || obj.status === "declined") && subscriptionId) {
            const migrationUpdate = await db
                .updateTable("subscription_cards")
                .set({
                    migration_status: obj.status === "approved" ? "confirmed" : "pending",
                    migration_confirmed_at: obj.status === "approved" ? new Date() : null,
                    updated_at: new Date(),
                })
                .where("subscription_id", "=", subscriptionId)
                .where("migration_status", "!=", "confirmed")
                .executeTakeFirst();

            if (obj.status === "approved" && migrationUpdate.numUpdatedRows > 0n) {
                await db
                    .updateTable("user_subscriptions")
                    .set({
                        billing_day: new Date().getDate(),
                        updated_at: new Date(),
                    })
                    .where("id", "=", subscriptionId)
                    .execute();
            }
        }

        if (eventType === "authorization.request") {
            return buildApprovalResponse("authorization-accepted");
        }

        return buildApprovalResponse("authorization-updated");
    }

    return NextResponse.json({
        statusCode: 400,
        responseCode: "96",
        message: "Unsupported event",
    }, { status: 400 });
}
