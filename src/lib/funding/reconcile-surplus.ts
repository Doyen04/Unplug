/**
 * Post-Billing Surplus Reconciliation
 *
 * After a subscription billing cycle completes, the amount Paystack collected
 * (with the 7.5% buffer) almost always exceeds what Sudo actually charged the
 * virtual card. This surplus must be credited back to the user rather than
 * pocketed by Unplug.
 *
 * HOW IT WORKS:
 *  1. Sum everything Paystack collected for the user on a given billing date
 *     (status = 'transferred', meaning the money already reached Safe Haven).
 *  2. Sum everything Sudo actually charged on the user's virtual cards after
 *     that billing date (approved card_transactions from card_transactions table).
 *  3. Credit = collected − charged.
 *  4. Surplus is added to `wallet_credit_kobo` on the `user` row.
 *
 * On the NEXT billing cycle, the collect-user-funding job reads this credit and
 * deducts it from the new charge amount. Users effectively get a discount.
 *
 * This function should be called from the Sudo `transaction.created` webhook handler
 * after a subscription charge settles, or from a nightly QStash job at D+1.
 */

import { sql } from 'kysely';
import { db } from '../server/db';

/**
 * Computes how much surplus the user accumulated in the last billing cycle and
 * adds it to their wallet credit balance.
 *
 * @param userId   The user whose wallet credit should be updated.
 * @param billingDate The billing date of the cycle being reconciled.
 */
export async function reconcileUserSurplus(
  userId: string,
  billingDate: Date
): Promise<void> {
  // Step 1: Total collected from the user's bank card for this billing date group
  const collected = await db
    .selectFrom('card_funding_transactions')
    .select(db.fn.sum('amount_kobo').as('total'))
    .where('user_id', '=', userId)
    .where('billing_date', '=', billingDate)
    .where('status', '=', 'transferred') // only rows confirmed to have reached Safe Haven
    .executeTakeFirst();

  // Step 2: Total Sudo actually charged on the virtual cards for this user
  const charged = await db
    .selectFrom('card_transactions as ct')
    .innerJoin('subscription_cards as sc', 'sc.sudo_card_id', 'ct.sudo_card_id')
    .innerJoin('user_subscriptions as s', 's.id', 'sc.subscription_id')
    .select(db.fn.sum('ct.amount_kobo' as any).as('total'))
    .where('s.user_id', '=', userId)
    .where('ct.status', '=', 'approved')
    .where('ct.created_at', '>=', billingDate)
    .executeTakeFirst();

  const collectedTotal = Number(collected?.total ?? 0);
  const chargedTotal   = Number(charged?.total ?? 0);
  const surplus        = collectedTotal - chargedTotal;

  if (surplus > 0) {
    // Increment the user's wallet credit using a SQL expression to avoid
    // a read-then-write race condition (two concurrent reconciliations overwriting each other).
    await db
      .updateTable('user')
      .set({
        wallet_credit_kobo: sql<number>`wallet_credit_kobo + ${surplus}`,
      })
      .where('id', '=', userId)
      .execute();

    console.log(
      `[reconcile] User ${userId}: surplus ₦${(surplus / 100).toFixed(2)} added to wallet credit`
    );
  }
}
