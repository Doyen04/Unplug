/**
 * Migration Failure Detection
 *
 * Detects when a user claimed they switched their subscription payment method
 * but their old card was still charged by the merchant.
 *
 * HOW IT'S TRIGGERED:
 * The Paystack webhook receives charge.success for every successful payment.
 * After saving the authorization code, the webhook calls this function with:
 *   - userId: who was charged
 *   - merchantName: the business name from the Paystack transaction (e.g. "NETFLIX")
 *
 * MATCHING LOGIC:
 * We do a case-insensitive fuzzy match between the merchantName and our subscription
 * service names (e.g. "NETFLIX.COM" matches "netflix"). If we find a card in
 * 'user_done' or 'pending' status for that service, it means:
 *   - The user has a virtual card issued for this service (or was supposed to set it up)
 *   - But the old card was just charged — so the switch didn't happen
 *   → Migration failed
 *
 * STATUS TRANSITION:
 *   pending | user_done → failed
 *
 * Already-confirmed cards are NOT touched — a confirmed card means Sudo
 * successfully processed a charge, so the card is working correctly.
 * The Paystack charge could be a legitimate retry or a different payment method.
 *
 * NEXT STEPS (after failure is detected):
 * The UI should show a "Migration failed" banner prompting the user to retry.
 * A TODO below marks where to add the failure notification email.
 */

import { db } from '@/lib/server/db';

/**
 * Checks if a user's subscription migration has failed based on an unexpected charge
 * on their old payment method by a merchant they should have migrated to a virtual card.
 *
 * @param userId       The user whose subscriptions to check.
 * @param merchantName The merchant name from the charge event (e.g. "NETFLIX", "SPOTIFY").
 */
export async function detectMigrationFailure(
  userId:       string,
  merchantName: string,
): Promise<void> {
  // Fuzzy match: 'NETFLIX.COM INTERNATIONAL' will match subscription service_name 'netflix'
  const card = await db
    .selectFrom('subscription_cards as sc')
    .innerJoin('user_subscriptions as s', 's.id', 'sc.subscription_id')
    .select(['sc.id', 'sc.migration_status'])
    .where('s.user_id', '=', userId)
    .where('s.service_name', 'ilike', `%${merchantName.toLowerCase()}%`)
    .where('sc.status', '=', 'active')
    .executeTakeFirst();

  if (!card) return;  // No card found for this merchant — not a migration we're tracking

  // Only mark as failed if the migration hasn't been confirmed yet.
  // 'confirmed' = Sudo already processed a successful charge → card is working correctly.
  if (card.migration_status === 'user_done' || card.migration_status === 'pending') {
    await db
      .updateTable('subscription_cards')
      .set({ migration_status: 'failed', updated_at: new Date() })
      .where('id', '=', card.id)
      .execute();

    console.log(`[migration] Failure detected for ${merchantName}, user ${userId}`);

    // TODO: send "Migration failed" email notification to the user
    // await sendMigrationFailureEmail(userId, merchantName);
  }
}
