/**
 * Sudo Africa Webhook Handler
 * POST /api/webhooks/sudo
 *
 * Receives real-time card events from Sudo Africa and keeps our local
 * card_transactions table in sync with what Sudo sees.
 *
 * EVENTS HANDLED:
 *  - authorization.request   → A merchant is attempting to charge the card.
 *                               We record it immediately (status may still be 'pending').
 *  - authorization.updated   → Sudo finalized the authorization (approved/declined).
 *                               We upsert the row with the new status.
 *  - transaction.created     → A settled transaction (debit or refund) was recorded.
 *                               We insert it for ledger completeness.
 *
 * MIGRATION CONFIRMATION:
 * When an authorization is APPROVED, it means the user has successfully updated their
 * subscription payment method to the Unplug virtual card. We mark migration_status = 'confirmed'
 * so the user sees a ✓ confirmation in the UI.
 *
 * SIGNATURE VERIFICATION:
 * Sudo signs all webhook payloads with HMAC-SHA512 using SUDO_AFRICA_WEBHOOK_SECRET.
 * We verify this before processing. Unverified requests get a 401.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/server/db';

/**
 * Validates that the webhook payload came from Sudo Africa and wasn't tampered with.
 * Uses timing-safe comparison to prevent timing-oracle attacks.
 *
 * @param rawBody The raw request body string (must be read before any parsing).
 * @param signature The value of the x-sudo-signature header.
 */
function verifySudoSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.SUDO_AFRICA_WEBHOOK_SECRET!;
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    console.log('verifySudoSignature',secret,signature, expected,rawBody)
    try {
        // timingSafeEqual prevents attackers from guessing the signature byte-by-byte
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        // If buffers are different lengths, timingSafeEqual throws — treat as mismatch
        return false;
    }
}

export async function POST(req: NextRequest) {
    // IMPORTANT: Read rawBody first as a string before any JSON.parse().
    // Once we parse, we can't reconstruct the exact bytes for HMAC verification.
    const rawBody = await req.text();
    const signature = req.headers.get('x-sudo-signature') ?? '';

    if (!verifySudoSignature(rawBody, signature)) {
        console.warn('[sudo-webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as { type: string; data: Record<string, any> };
    const { type, data } = event;

    // Sudo sends card ID in different fields depending on event type — try all three
    const sudoCardId = data.card?._id ?? data.cardId ?? data._id;

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
                sudo_transaction_id: data._id,
                type: 'authorization',
                status: data.status,
                amount_kobo: data.amount,
                currency: data.currency,
                merchant_name: data.merchant?.name ?? null,
                merchant_category: data.merchant?.category ?? null,
                channel: data.channel ?? null,
            })
            // If we've already seen this transaction ID (duplicate delivery), just update the status.
            // Sudo can deliver the same event more than once — this is normal webhook behavior.
            .onConflict((oc) =>
                oc.column('sudo_transaction_id').doUpdateSet({ status: data.status })
            )
            .execute();

        // MIGRATION CONFIRMATION: First approved charge on this card = user successfully
        // switched their payment method. Mark the card as 'confirmed' in migration_status.
        // We only update if NOT already confirmed to avoid redundant writes.
        if (data.status === 'approved' && subscriptionId) {
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
                sudo_transaction_id: data._id,
                type: data.type === 'refund' ? 'refund' : 'transaction',
                status: 'closed',         // settled transactions are always 'closed'
                amount_kobo: data.amount,
                currency: data.currency,
                merchant_name: data.merchant?.name ?? null,
                merchant_category: data.merchant?.category ?? null,
                channel: data.channel ?? null,
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
