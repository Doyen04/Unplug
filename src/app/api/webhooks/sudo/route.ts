/**
 * Sudo Africa Webhook Handler
 * POST /api/webhooks/sudo
 *
 * Receives real-time card events from Sudo Africa and keeps our local
 * card_transactions table in sync with what Sudo sees.
 *
 * EVENTS HANDLED:
 *  - authorization.request   → A merchant is attempting to charge the card.
 *                               We record it with status 'pending'.
 *  - authorization.updated   → Sudo finalized the authorization (approved/declined).
 *                               We upsert the row with the new status.
 *  - transaction.created     → A settled transaction (debit or refund) was recorded.
 *                               We insert it for ledger completeness.
 *
 * PAYLOAD SHAPE:
 * All events nest the actual object under body.data.object — not body.data directly.
 * On transaction.created, body.data.object.card is a plain string card ID.
 * On authorization events, body.data.object.card is a nested card object with ._id.
 *
 * MIGRATION CONFIRMATION:
 * When an authorization is APPROVED, it means the user has successfully updated their
 * subscription payment method to the Unplug virtual card. We mark migration_status = 'confirmed'
 * so the user sees a ✓ confirmation in the UI.
 *
 * AUTHENTICATION:
 * Sudo sends the Authorization Token you configured on the webhook (plain Bearer token,
 * no HMAC signing). We compare it directly against SUDO_AFRICA_WEBHOOK_SECRET.
 * Unverified requests get a 401.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

/**
 * Validates that the webhook payload came from Sudo Africa and wasn't tampered with.
 * Uses timing-safe comparison to prevent timing-oracle attacks.
 *
 * @param rawBody The raw request body string (must be read before any parsing).
 * @param signature The value of the x-sudo-signature header.
 */

export async function POST(req: NextRequest) {
    // IMPORTANT: Read rawBody first as a string before any JSON.parse().
    // Once we parse, we can't reconstruct the exact bytes for HMAC verification.
    // Sudo sends the token you configured as: Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.SUDO_AFRICA_WEBHOOK_SECRET!;

    const token = authHeader?.startsWith('Bearer ')
    ? authHeader?.slice(7)
    : authHeader;

    if (!token || token !== expectedToken) {
        console.warn('[sudo-webhook] Unauthorized - invalid or missing Authorization header');
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, data } = body;

    const obj = data.object;

    // card is a string ID on transaction.created, an object on authorization events
    const sudoCardId =
        typeof obj.card === 'string'
            ? obj.card
            : obj.card?._id ?? obj.cardId ?? null;
    if (!sudoCardId) {
        console.warn('[sudo-webhook] Could not extract sudoCardId from event:', type, obj._id);
        return NextResponse.json({ received: true }); // ack so Sudo doesn't retry forever
    }


    // Look up which subscription this card belongs to (for linking transactions to subscriptions)
    const cardRecord = await db
        .selectFrom('subscription_cards')
        .select('subscription_id')
        .where('sudo_card_id', '=', sudoCardId)
        .executeTakeFirst();

    const subscriptionId = cardRecord?.subscription_id ?? null;

    // ── authorization.request / authorization.updated ────────────────────────────
    // An authorization is Sudo asking: "Can this merchant charge this card?"
    // We record/update it so the user can see pending or declined charges in their history.
    if (type === 'authorization.request' || type === 'authorization.updated') {
        await db
            .insertInto('card_transactions')
            .values({
                sudo_card_id: sudoCardId,
                subscription_id: subscriptionId,
                sudo_transaction_id: obj._id,
                type: 'authorization',
                status: obj.status,
                amount_kobo: obj.amount,
                currency: obj.currency,
                merchant_name: obj.merchant?.name ?? null,
                merchant_category: obj.merchant?.category ?? null,
                channel: obj.transactionMetadata?.channel ?? null,
            })
            // If we've already seen this transaction ID (duplicate delivery), just update the status.
            // Sudo can deliver the same event more than once — this is normal webhook behavior.
            .onConflict((oc) =>
                oc.column('sudo_transaction_id').doUpdateSet({ status: obj.status })
            )
            .execute();

        // MIGRATION CONFIRMATION: First approved charge on this card = user successfully
        // switched their payment method. Mark the card as 'confirmed' in migration_status.
        // We only update if NOT already confirmed to avoid redundant writes.
        if (obj.status === 'approved' && subscriptionId) {
            await db
                .updateTable('subscription_cards')
                .set({
                    migration_status: 'confirmed',
                    migration_confirmed_at: new Date(),
                    updated_at: new Date(),
                })
                .where('subscription_id', '=', subscriptionId)
                .where('migration_status', '!=', 'confirmed')  // idempotent guard
                .execute();
        }
    }

    // ── transaction.created ──────────────────────────────────────────────────────
    // A settled transaction (actual debit or refund) was recorded by Sudo.
    // We insert it for completeness; the user can see it in their card history.
    if (type === 'transaction.created') {
        await db
            .insertInto('card_transactions')
            .values({
                sudo_card_id: sudoCardId,
                subscription_id: subscriptionId,
                sudo_transaction_id: obj._id,
                type: obj.type === 'refund' ? 'refund' : 'transaction',
                status: 'closed',         // settled transactions are always 'closed'
                amount_kobo: obj.amount,
                currency: obj.currency,
                merchant_name: obj.merchant?.name ?? null,
                merchant_category: obj.merchant?.category ?? null,
                channel: obj.channel ?? null,
            })
            // If already inserted (duplicate delivery), silently skip
            .onConflict((oc) => oc.column('sudo_transaction_id').doNothing())
            .execute();
    }

    // Always return 200 to acknowledge receipt.
    // If we return non-200, Sudo will keep retrying (correct behavior for hard errors,
    // but we want to prevent infinite retries for known events we don't handle).
    return NextResponse.json({ received: true });
}
