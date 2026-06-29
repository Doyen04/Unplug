/**
 * Background Job Payload Types
 *
 * These interfaces define the shape of JSON payloads sent through QStash.
 * Every job handler (route.ts in /api/jobs/) must validate the `type` field
 * before processing — this prevents routing mismatches if payloads are
 * accidentally sent to the wrong endpoint.
 *
 * Adding a new job type:
 *  1. Define the payload interface here with a unique string literal `type`.
 *  2. Create the handler in src/app/api/jobs/<job-name>/route.ts.
 *  3. Create an enqueue helper in src/lib/jobs/enqueue-<job-name>.ts.
 *  4. Register the QStash cron or trigger in the Upstash dashboard.
 */

/**
 * Triggers Paystack wallet funding for a group of subscriptions billing on the same date.
 * Fired by the midnight billing scan cron for each user+billingDate group.
 * Processed by POST /api/jobs/collect-user-funding (QStash worker).
 *
 * subscriptionIds is an array because one user may have multiple subscriptions
 * billing on the same day — they're collected in a single Paystack charge.
 */
export interface CollectUserFundingJobPayload {
    type: 'COLLECT_USER_FUNDING';
    userId: string;
    billingDate: string;      // ISO date string (YYYY-MM-DD)
    subscriptionIds: string[];    // all subscriptions in this billing-date group
    totalKobo: number;      // sum of all subscription amounts in kobo
}

/**
 * Triggers surplus reconciliation after a billing cycle completes.
 * Compares what was collected vs what was actually charged and credits the difference.
 */
export interface ReconcileSurplusJobPayload {
    type: 'RECONCILE_SURPLUS';
    userId: string;
    cycleRef: string;   // paystack_ref of the original collection — used as idempotency key
}
