/**
 * GET /api/cards/[subscriptionId]
 *
 * Returns safe virtual card metadata for a subscription's card.
 *
 * SAFE vs SENSITIVE:
 * This endpoint returns ONLY safe fields: last4, expiry, status, migration_status.
 * It does NOT return PAN or CVV. To reveal the full card number, the user must
 * explicitly trigger GET /api/cards/[subscriptionId]/pan (separate flow with
 * its own security checks).
 *
 * USE CASES:
 * - Frontend polling after POST /api/cards/issue to know when the card is ready
 * - Rendering the SubscriptionCardPanel and VirtualCard components
 * - Checking migration_status to show the user what step they're on
 *
 * OWNERSHIP CHECK:
 * The JOIN with user_subscriptions ensures the card belongs to the authenticated user.
 * A user cannot read another user's card details.
 *
 * PRO GATE:
 * Virtual cards are a Pro-only feature. If the user has since cancelled their
 * Pro subscription, they should no longer be able to view a previously-issued
 * card's details, even though the card record still exists in our DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server/db';
import { isProUser } from '@/lib/server/plan';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ subscriptionId: string }> | { subscriptionId: string } }
) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15: route params are async — must be awaited before destructuring
    const resolvedParams = await params;
    const { subscriptionId } = resolvedParams;

    // Pro gate: a cancelled Pro user must not be able to view card details anymore,
    // even though the underlying card record still exists from when they were Pro.
    if (!(await isProUser(session.user.id))) {
        return NextResponse.json(
            { error: 'Virtual cards require a Pro plan' },
            { status: 403 }
        );
    }

    // JOIN with user_subscriptions is the ownership check.
    // If the subscription belongs to a different user, the WHERE clause returns no rows.
    const card = await db
        .selectFrom('subscription_cards as sc')
        .innerJoin('user_subscriptions as s', 's.id', 'sc.subscription_id')
        .select([
            'sc.id',
            'sc.sudo_card_id',
            'sc.currency',
            'sc.last_four',
            'sc.expiry_month',
            'sc.expiry_year',
            'sc.status',
            'sc.spend_limit_kobo',
            'sc.migration_status',   // pending | user_done | confirmed | failed
            'sc.created_at',
        ])
        .where('sc.subscription_id', '=', subscriptionId)
        .where('s.user_id', '=', session.user.id)  // ownership enforcement
        .executeTakeFirst();

    if (!card) {
        // 404 can mean: card doesn't exist yet (issuance pending) OR wrong subscriptionId
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ card });
}
