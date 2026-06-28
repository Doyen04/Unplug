/**
 * POST /api/cards/issue
 *
 * User-facing endpoint to request a virtual card for a subscription.
 *
 * This endpoint is intentionally lightweight — it does NOT create the card itself.
 * Instead it validates all preconditions and fires an async background job via QStash.
 * The actual Sudo Africa API call happens in the /api/jobs/issue-card worker.
 *
 * WHY ASYNC:
 * Card creation in Sudo takes 1–3 seconds. Returning 202 immediately gives a
 * responsive UX. The frontend should poll GET /api/cards/[subscriptionId] to detect
 * when the card appears.
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
import { enqueueCardIssuance } from '@/lib/jobs/enqueue-card-issuance';
import { resolveCardCurrency } from '@/lib/sudo/currency';

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
    const user = await db
        .selectFrom('user')
        .select(['plan'])
        .where('id', '=', session.user.id)
        .executeTakeFirstOrThrow();

    if (user.plan !== 'pro') {
        return NextResponse.json(
            { error: 'Virtual cards require a Pro plan' },
            { status: 403 }
        );
    }

    // All checks passed — enqueue the actual card creation as a background job.
    // resolveCardCurrency determines if this subscription needs a USD or NGN card.
    await enqueueCardIssuance({
        subscriptionId: subscription.id,
        userId: session.user.id,
        serviceName: subscription.service_name,
        billingAmount: Number(subscription.amount_monthly),
        currency: resolveCardCurrency(subscription.currency),
        billingDay: Number(subscription.billing_day),
    });

    // 202 Accepted: job is queued but not yet complete.
    // Frontend should poll GET /api/cards/[subscriptionId] until the card appears.
    return NextResponse.json(
        { message: 'Card issuance queued. Ready in a few seconds.' },
        { status: 202 }
    );
}
