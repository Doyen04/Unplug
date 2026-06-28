/**
 * Paystack Webhook Handler
 * POST /api/webhooks/paystack
 *
 * Handles all events from Paystack, covering two distinct concerns:
 *
 * 1. PRO PLAN LIFECYCLE (subscription.create / subscription.disable / invoice.update)
 *    Keeps the user's plan status in sync with their Paystack subscription.
 *    - subscription.create  → user upgraded to Pro, set plan='pro' + expiry date
 *    - subscription.disable → user cancelled, set plan='free'
 *    - invoice.update (paid) → subscription renewed, extend plan expiry
 *
 * 2. CARD AUTHORIZATION SAVE (charge.success)
 *    When a user makes any successful Paystack payment, we save their
 *    authorization_code. This enables future merchant-initiated charges
 *    (wallet funding) WITHOUT the user needing to re-enter their card details.
 *
 *    This is how Unplug charges users at D-3 automatically:
 *      User pays once → Paystack sends charge.success → we save auth_code
 *      D-3 before billing → collect-user-funding job → charge auth_code
 *
 * SIGNATURE VERIFICATION:
 * Paystack signs payloads with HMAC-SHA512 using PAYSTACK_WEBHOOK_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/server/db';

/**
 * Verifies the webhook payload came from Paystack.
 * NOTE: Unlike Sudo, Paystack does NOT use timing-safe comparison in their official docs,
 * but we use === here (string comparison) which is acceptable because HMAC output
 * is not secret — only the secret key is.
 */
function verifyPaystackSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    console.log('[paystack-webhook] secret defined:', !!secret);
    console.log('[paystack-webhook] signature received:', !!signature);
    console.log('[paystack-webhook] signature expected:', !!expected);
    console.log('[paystack-webhook] raw body:', rawBody);
    console.log('[paystack-webhook] signature:', signature);
    console.log('[paystack-webhook] expected signature:', expected);
    console.log('[paystack-webhook] signature match:', expected === signature);
    return expected === signature;
}

export async function POST(req: NextRequest) {
    // Must read raw body string before parsing to preserve bytes for HMAC check
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') ?? '';

    if (!verifyPaystackSignature(rawBody, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as { event: string; data: Record<string, any> };
    const { event: type, data } = event;

    // ── Pro subscription events ────────────────────────────────────────────────

    if (type === 'subscription.create') {
        // Pro plan activated — user paid for first billing cycle
        const email = data.customer?.email;
        if (email) {
            await db
                .updateTable('user')
                .set({
                    plan: 'pro',
                    plan_expires_at: new Date(data.next_payment_date),
                    paystack_customer_code: data.customer?.customer_code ?? null,
                })
                .where('email', '=', email)
                .execute();
        }
    }

    if (type === 'subscription.disable') {
        // User cancelled — revert to free plan immediately
        const email = data.customer?.email;
        if (email) {
            await db
                .updateTable('user')
                .set({ plan: 'free', plan_expires_at: null })
                .where('email', '=', email)
                .execute();
        }
    }

    if (type === 'invoice.update' && data.paid) {
        // Subscription renewed automatically — extend expiry to next payment date
        const email = data.customer?.email;
        if (email) {
            await db
                .updateTable('user')
                .set({ plan_expires_at: new Date(data.next_payment_date) })
                .where('email', '=', email)
                .execute();
        }
    }

    // ── Charge authorization save ───────────────────────────────────────────────

    if (type === 'charge.success') {
        // Every successful charge includes an authorization_code.
        // We save (or update) it so we can charge the user again later without a UI prompt.
        // UNIQUE constraint on user_id: we only keep one active authorization per user.
        // If they change their bank card, the new auth_code overwrites the old one.
        const authCode = data.authorization?.authorization_code;
        const email = data.customer?.email;

        if (authCode && email) {
            const user = await db
                .selectFrom('user')
                .select('id')
                .where('email', '=', email)
                .executeTakeFirst();

            if (user) {
                await db
                    .insertInto('user_funding_sources')
                    .values({
                        user_id: user.id,
                        paystack_authorization_code: authCode,
                        paystack_email: email,
                        card_type: data.authorization?.card_type ?? null,
                        last_four: data.authorization?.last4 ?? null,
                        bank: data.authorization?.bank ?? null,
                        status: 'active',
                        updated_at: new Date(),
                    })
                    .onConflict((oc) =>
                        // Already have a funding source → update auth code (user may have changed cards)
                        oc.column('user_id').doUpdateSet({
                            paystack_authorization_code: authCode,
                            card_type: data.authorization?.card_type ?? null,
                            last_four: data.authorization?.last4 ?? null,
                            bank: data.authorization?.bank ?? null,
                            updated_at: new Date(),
                        })
                    )
                    .execute();
            }
        }
    }

    return NextResponse.json({ received: true });
}
