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
 * Converts an amount as it arrives on a Sudo webhook payload into absolute kobo.
 *
 * Sudo reports transaction amounts as DECIMAL NAIRA and SIGNED — debits are
 * negative, credits positive. Our `card_transactions` / `card_funding_transactions`
 * columns are bigint kobo and store the magnitude only, so the sign is dropped
 * here. That is why this is not just toSmallestUnit(): passing a debit through
 * that would persist a negative bigint and quietly corrupt every downstream sum.
 *
 * The sign itself is currently discarded rather than recorded — see the TODO in
 * the sudo webhook route about adding a debit/refund direction column.
 *
 * @param amount signed decimal naira from Sudo, e.g. -4500 (a ₦4,500 debit)
 * @returns absolute kobo, e.g. 450000
 */
export function sudoAmountToKobo(amount: number): number {
  return Math.round(Math.abs(amount) * 100);
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
