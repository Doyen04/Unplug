/**
 * GET /api/cards/[subscriptionId]/pan
 *
 * ⚠️  SENSITIVE ENDPOINT — Reveals full card number (PAN) and CVV.
 *
 * This is intentionally a separate endpoint from GET /api/cards/[subscriptionId]
 * to enforce a deliberate, auditable action before exposing card secrets.
 * The frontend should only call this when the user explicitly taps "Show Card Number".
 *
 * DATA FLOW (server-side only):
 *   Sudo Africa API → this server handler → HTTPS → browser (in-memory only)
 * The PAN NEVER touches our database. If logging is enabled, ensure this response
 * body is excluded from logs.
 *
 * SECURITY GUARDS:
 *  1. Session authentication — must be logged in
 *  2. Ownership check via JOIN — card must belong to the requesting user
 *  3. Active card check — frozen cards cannot reveal their PAN
 *     (prevents attackers from unfreezing-reading-refreezing without user noticing)
 *
 * The browser should show the PAN for a limited time (e.g. 30 seconds) and then blur it again.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server/db';
import { getSudoCardPAN } from '@/lib/sudo/client';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ subscriptionId: string }> | { subscriptionId: string } }
) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15: params can be a Promise
    const resolvedParams = await params;
    const { subscriptionId } = resolvedParams;

    // Ownership check: JOIN ensures this subscription belongs to the logged-in user
    const card = await db
        .selectFrom('subscription_cards as sc')
        .innerJoin('user_subscriptions as s', 's.id', 'sc.subscription_id')
        .select(['sc.sudo_card_id', 'sc.status'])
        .where('sc.subscription_id', '=', subscriptionId)
        .where('s.user_id', '=', session.user.id)
        .executeTakeFirst();

    if (!card) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Block PAN reveal for frozen cards — an extra friction layer in case of account compromise
    if (card.status !== 'active') {
        return NextResponse.json(
            { error: 'Unfreeze the card first to view details.' },
            { status: 403 }
        );
    }

    // Fetch PAN from Sudo Africa server-to-server — never stored, never logged
    const pan = await getSudoCardPAN(card.sudo_card_id);

    // Return in-full: this data lives only in the browser's memory until the component unmounts
    return NextResponse.json({
        pan: pan.pan,
        cvv: pan.cvv2,
        expiryMonth: pan.expiryMonth,
        expiryYear: pan.expiryYear,
    });
}
