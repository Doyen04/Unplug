/**
 * Currency Utilities
 *
 * Helper functions for currency conversion and card currency resolution.
 *
 * IMPORTANT CONTEXT:
 * - All monetary values in the database are stored in SMALLEST UNITS (kobo for NGN, cents for USD).
 *   e.g. ₦4,500 → 450000 kobo | $9.99 → 999 cents
 * - Subscription amounts from the user_subscriptions table are stored as human-readable decimals.
 *   These must always be converted before being sent to Sudo or Paystack.
 * - Card currency (NGN vs USD) determines which Sudo card type is issued.
 *   USD subscriptions (Netflix, Spotify, ChatGPT) require a USD virtual card because
 *   Sudo Africa handles the NGN→USD conversion at the time of the transaction.
 */

/**
 * Converts a human-readable amount to its smallest currency unit.
 *
 * @param amount e.g. 4500 (₦4,500) or 9.99 ($9.99)
 * @returns amount in kobo or cents: 450000 or 999
 */
export function toSmallestUnit(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Determines whether to issue an NGN or USD virtual card for a subscription.
 *
 * If the subscription currency is USD, a USD card must be issued so that
 * Sudo Africa can settle the international merchant charge correctly.
 * Everything else defaults to NGN.
 *
 * @param subscriptionCurrency The currency string from the subscription record (e.g. "USD", "NGN").
 * @returns 'USD' | 'NGN'
 */
export function resolveCardCurrency(
  subscriptionCurrency: string | null | undefined
): 'NGN' | 'USD' {
  return subscriptionCurrency?.toUpperCase() === 'USD' ? 'USD' : 'NGN';
}
