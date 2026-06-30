/**
 * GET /api/cards/[subscriptionId]/pan
 *
 * ⚠️  SENSITIVE ENDPOINT — returns a one-time Sudo card token for SecureProxy.
 *
 * This endpoint intentionally separates token generation from regular card metadata
 * and only allows it when the requesting user owns the subscription.
 *
 * DATA FLOW:
 *   Sudo Africa API → this server handler → HTTPS → browser
 * The token is then used by SecureProxy to reveal PAN/CVV without storing them.
 *
 * SECURITY GUARDS:
 *  1. Session authentication — must be logged in
 *  2. Ownership check via JOIN — card must belong to the requesting user
 *  3. Frozen cards cannot generate a reveal token
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server/db';
import { generateSudoCardToken } from '@/lib/sudo/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { subscriptionId: string } }
) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = params;

    const subscription = await db
        .selectFrom('subscription_cards as sc')
        .innerJoin('user_subscriptions as us', 'us.id', 'sc.subscription_id')
        .select(['sc.sudo_card_id', 'sc.status'])
        .where('sc.subscription_id', '=', subscriptionId)
        .where('us.user_id', '=', session.user.id)
        .executeTakeFirst();

    if (!subscription?.sudo_card_id) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (subscription.status !== 'active') {
        return NextResponse.json(
            { error: 'Unfreeze the card first to reveal the number' },
            { status: 403 }
        );
    }

    try {
        const { token } = await generateSudoCardToken(subscription.sudo_card_id);

        return NextResponse.json({
            token,
            sudoCardId: subscription.sudo_card_id,
        });
    } catch (error) {
        console.error('[cards/pan] Sudo token error:', error);
        return NextResponse.json({ error: 'Failed to generate card token' }, { status: 502 });
    }
}
