/**
 * Collection Date Calculator
 *
 * Determines the safe date to charge a user's card before their subscription billing date.
 *
 * RULE: Collect on D-3 (3 days before billing).
 * WHY: Paystack settles to Safe Haven on T+1 (next business day).
 *      Collecting D-3 means funds arrive in Safe Haven on D-2 at the latest,
 *      giving a one-day buffer before the subscription actually charges.
 *
 * WEEKEND ADJUSTMENT:
 *  - If D-3 falls on Friday → collect Thursday (D-4).
 *    Reason: Friday T+1 = Monday, which may be D-0 or D+1. Too late.
 *  - If D-3 falls on Saturday → collect Thursday (D-4). Same reason.
 *  - If D-3 falls on Sunday → collect Friday (D-5).
 *    Reason: Sunday T+1 = Monday. If billing is on Monday that's already too late.
 */

/**
 * Returns the date on which to charge the user's funding source,
 * adjusting for Paystack's T+1 settlement and weekends.
 *
 * @param billingDate The date the subscription service will charge the virtual card.
 * @returns The adjusted date on which Unplug should charge the user's bank card.
 */
export function getCollectionDate(billingDate: Date): Date {
  const threeDaysBefore = new Date(billingDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  const dow = threeDaysBefore.getDay();   // 0=Sunday, 1=Monday … 5=Friday, 6=Saturday

  // Friday: T+1 = Monday = D-0 or later. Collect Thursday instead.
  if (dow === 5) {
    const d = new Date(threeDaysBefore);
    d.setDate(d.getDate() - 1);
    return d;
  }

  // Saturday: same problem as Friday. Collect Thursday.
  if (dow === 6) {
    const d = new Date(threeDaysBefore);
    d.setDate(d.getDate() - 2);
    return d;
  }

  // Sunday: T+1 = Monday. If billing is Monday we'd be late. Collect Friday.
  if (dow === 0) {
    const d = new Date(threeDaysBefore);
    d.setDate(d.getDate() - 2);
    return d;
  }

  // Monday–Thursday: T+1 is a business day, no adjustment needed.
  return threeDaysBefore;
}
