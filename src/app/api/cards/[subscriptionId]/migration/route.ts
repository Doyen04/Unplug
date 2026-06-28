/**
 * POST /api/cards/[subscriptionId]/migration
 *
 * Called by the user (via SubscriptionCardPanel UI) when they declare they've
 * finished updating their subscription payment method to the Unplug virtual card.
 *
 * MIGRATION STATUS STATE MACHINE:
 *
 *   'pending'   → Card was issued, user hasn't started switching yet
 *       ↓
 *   'user_done' → User tapped "I've updated my payment method" (THIS endpoint)
 *       ↓
 *   'confirmed' → Sudo Africa sent an approved authorization for this card
 *                 (handled automatically by the Sudo webhook)
 *       ↓
 *   'failed'    → detectMigrationFailure() found the old card was still charged
 *                 (handled by the Paystack webhook when the old card fires a charge.success
 *                  for a merchant we know the user has a virtual card for)
 *
 * HOW CONFIRMATION WORKS:
 * We don't take the user's word for it alone. After they tap "Done", we wait for Sudo
 * to fire an authorization.request/updated event for this card. Only a real merchant
 * charge can trigger that — confirming the subscription payment method was truly switched.
 *
 * This endpoint transitions: pending/failed → user_done
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> | { subscriptionId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const { subscriptionId } = resolvedParams;

  // Ownership check via JOIN
  const card = await db
    .selectFrom('subscription_cards as sc')
    .innerJoin('user_subscriptions as s', 's.id', 'sc.subscription_id')
    .select(['sc.id', 'sc.migration_status'])
    .where('sc.subscription_id', '=', subscriptionId)
    .where('s.user_id', '=', session.user.id)
    .executeTakeFirst();

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // If already confirmed by Sudo webhook, this is a no-op — don't roll status back
  if (card.migration_status === 'confirmed') {
    return NextResponse.json({ message: 'Already confirmed' });
  }

  // Mark as user_done — UI shows "Waiting for confirmation..." state.
  // Confirmation is completed automatically when the next billing charge comes through.
  await db
    .updateTable('subscription_cards')
    .set({ migration_status: 'user_done', updated_at: new Date() })
    .where('id', '=', card.id)
    .execute();

  return NextResponse.json({ migration_status: 'user_done' });
}
