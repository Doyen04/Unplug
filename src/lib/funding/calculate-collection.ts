/**
 * Collection Breakdown & Calculation Logic
 * 
 * When funding virtual cards before a billing cycle, Unplug adds a 7.5% buffer:
 * - 5.0% FX Fluctuation Risk: Protects against sudden shifts in USD/NGN exchange rates.
 * - 2.5% Cost Recovery: Absorbs Paystack's processing fees (1.5% + ₦100 flat fee).
 * 
 * Any unused buffer surplus is not lost; it automatically rolls into the user's wallet credit balance.
 */

const FX_BUFFER       = 0.05;   // 5%: absorbs USD/NGN rate moves
const COST_RECOVERY   = 0.025;  // 2.5%: absorbs Paystack 1.5% + ₦100 flat
const TOTAL_BUFFER    = FX_BUFFER + COST_RECOVERY; // 7.5%

const PAYSTACK_PCT    = 0.015;  // 1.5%
const PAYSTACK_FLAT   = 10000; // ₦100 in kobo
const PAYSTACK_CAP    = 200000; // ₦2,000 cap in kobo

export interface CollectionBreakdown {
  subscriptionTotal:  number;  // raw subscription amount in kobo
  collectionAmount:   number;  // what to charge user (with buffer), in kobo
  paystackFee:        number;  // what Paystack will take, in kobo
  safeHavenReceived:  number;  // what lands in Safe Haven, in kobo
  sudoAllocation:     number;  // what to send Sudo pool, in kobo
  expectedSurplus:    number;  // goes to wallet_credit, in kobo
}

/**
 * Calculates the exact breakdown of charges, fees, and allocations for wallet funding.
 * 
 * @param subscriptionTotalKobo The base cost of the subscription(s) in smallest currency unit (kobo/cents).
 * @returns Comprehensive CollectionBreakdown object.
 */
export function calculateCollectionAmount(
  subscriptionTotalKobo: number
): CollectionBreakdown {
  const withBuffer        = Math.round(subscriptionTotalKobo * (1 + TOTAL_BUFFER));
  const paystackFee       = Math.min(
    Math.round(withBuffer * PAYSTACK_PCT) + PAYSTACK_FLAT,
    PAYSTACK_CAP
  );
  const safeHavenReceived = withBuffer - paystackFee;
  const sudoAllocation    = subscriptionTotalKobo;
  const expectedSurplus   = safeHavenReceived - sudoAllocation;

  return {
    subscriptionTotal:  subscriptionTotalKobo,
    collectionAmount:   withBuffer,
    paystackFee,
    safeHavenReceived,
    sudoAllocation,
    expectedSurplus:    Math.max(0, expectedSurplus),
  };
}
