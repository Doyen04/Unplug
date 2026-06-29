/**
 * POST /api/cards/issue
 *
 * User-facing endpoint to request a virtual card for a subscription.
 *
 * This endpoint validates preconditions and issues the card directly in the
 * request lifecycle. If issuance succeeds, the card exists immediately and the
 * frontend can refresh state right away.
 *
 * PRECONDITION CHECKS (in order):
 *  1. Authenticated session
 *  2. subscriptionId provided
 *  3. Subscription belongs to the requesting user (prevents IDOR)
 *  4. No card already exists for this subscription (idempotency)
 *  5. User is on the Pro plan (virtual cards are a Pro feature)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server/db';
import { resolveCardCurrency } from '@/lib/sudo/currency';
import { getOrCreateSudoCustomer } from '@/lib/sudo/get-or-create-customer';
import { issueCardForSubscription } from '@/lib/sudo/issue-card';

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
        return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 });
    }

    // Ownership check: user_id must match — prevents one user from requesting a card
    // for another user's subscription (IDOR vulnerability prevention)
    const subscription = await db
        .selectFrom('user_subscriptions')
        .select(['id', 'service_name', 'amount_monthly', 'currency', 'user_id', 'billing_day'])
        .where('id', '=', subscriptionId)
        .where('user_id', '=', session.user.id)
        .executeTakeFirst();

    if (!subscription) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Idempotency check: if a card was already issued (or is being issued), return 200 not an error.
    // The worker also has this guard, so duplicates are safely handled at both layers.
    const existingCard = await db
        .selectFrom('subscription_cards')
        .select('id')
        .where('subscription_id', '=', subscriptionId)
        .executeTakeFirst();

    if (existingCard) {
        return NextResponse.json({ message: 'Card already issued' }, { status: 200 });
    }

    // Virtual cards are a Pro-only feature — free users see an upgrade prompt instead
    const currentUser = await db
        .selectFrom('user')
        .select(['plan'])
        .where('id', '=', session.user.id)
        .executeTakeFirstOrThrow();

    if (currentUser.plan !== 'pro') {
        return NextResponse.json(
            { error: 'Virtual cards require a Pro plan' },
            { status: 403 }
        );
    }

    // All checks passed — create the card directly in the request lifecycle.
    const userForSudo = await db
        .selectFrom('user')
        .select(['id', 'name', 'email as emailAddress', 'phoneNumber'])
        .where('id', '=', session.user.id)
        .executeTakeFirstOrThrow();

    const sudoCustomerId = await getOrCreateSudoCustomer(userForSudo);

    try {
        await issueCardForSubscription({
            subscriptionId: subscription.id,
            sudoCustomerId,
            serviceName: subscription.service_name,
            billingAmount: Number(subscription.amount_monthly),
            currency: resolveCardCurrency(subscription.currency),
            billingDay: Number(subscription.billing_day),
        });
    } catch (err) {
        console.error('[cards/issue] failed to issue card for subscription', subscription.id, err);

        try {
            await db
                .updateTable('user_subscriptions')
                .set({ status: 'card_failed', updated_at: new Date() })
                .where('id', '=', subscription.id)
                .execute();
        } catch (updateErr) {
            console.error('[cards/issue] failed to mark subscription card_failed', subscription.id, updateErr);
        }

        return NextResponse.json({ error: 'Failed to issue card' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Card issued successfully.' }, { status: 200 });
}
