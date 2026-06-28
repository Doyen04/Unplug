/**
 * QStash Cron Job: Daily Billing Scan
 * POST /api/jobs/daily-billing-scan
 * Schedule: "0 0 * * *" (midnight every day)
 *
 * WHAT IT DOES:
 * Scans all active subscription cards and finds the ones whose collection date
 * falls today. For each matching group (user + billing date), it fires one
 * COLLECT_USER_FUNDING job via QStash.
 *
 * WHY D-3:
 * Paystack settles to Safe Haven on T+1 (next business day).
 * Collecting 3 days before billing gives enough runway:
 *   Day 0 (today): Paystack charges the user's card
 *   Day 1 (T+1):   Money settles in Unplug's Safe Haven account
 *   Day 2:         Treasury sweep moves funds to Sudo's Safe Haven pool
 *   Day 3:         Subscription billing day — Sudo has the funds ready
 *
 * GROUPING LOGIC:
 * If a user has 3 subscriptions all billing on the 15th, we group them into
 * ONE Paystack charge. This avoids multiple charges on the same day and
 * reduces Paystack's per-transaction flat fee impact.
 */

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import { db } from '@/lib/server/db';
import { getCollectionDate } from '@/lib/funding/collection-date';
import type { CollectUserFundingJobPayload } from '@/lib/jobs/types';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

async function handler(_req: NextRequest): Promise<NextResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all active subscription cards attached to healthy subscriptions
    // We don't filter by billing date in SQL because the collection date calculation
    // requires getCollectionDate() logic (including weekend adjustments) that
    // can't easily be expressed in a SQL WHERE clause.
    const candidates = await db
        .selectFrom('user_subscriptions as s')
        .innerJoin('subscription_cards as sc', 'sc.subscription_id', 's.id')
        .select([
            's.id',
            's.user_id',
            'sc.next_billing_date',
            's.amount_monthly',
            's.currency',
            'sc.sudo_card_id',
            'sc.status as card_status',
        ])
        .where('sc.status', '=', 'active')
        .where('s.status', '=', 'healthy')
        .execute();

    // Apply the D-3 weekend-adjusted collection date logic in JavaScript
    const dueToday = candidates.filter((sub) => {
        if (!sub.next_billing_date) return false;
        const collectionDate = getCollectionDate(new Date(sub.next_billing_date));
        collectionDate.setHours(0, 0, 0, 0);
        return collectionDate.getTime() === today.getTime();
    });

    if (dueToday.length === 0) {
        return NextResponse.json({ fired: 0 });
    }

    // Group subscriptions by user_id + billing_date so all subscriptions
    // billing on the same day for the same user are funded in one charge
    const groups = new Map<string, typeof dueToday>();

    for (const sub of dueToday) {
        const key = `${sub.user_id}::${sub.next_billing_date}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(sub);
    }

    let fired = 0;

    for (const [, groupSubs] of groups) {
        const { user_id, next_billing_date } = groupSubs[0];

        // Sum all subscription amounts in this group into one collection total (in kobo)
        const totalKobo = groupSubs.reduce(
            (sum, s) => sum + Math.round(Number(s.amount_monthly) * 100),
            0
        );

        const payload: CollectUserFundingJobPayload = {
            type: 'COLLECT_USER_FUNDING',
            userId: user_id,
            billingDate: next_billing_date!.toString(),
            subscriptionIds: groupSubs.map((s) => s.id),
            totalKobo,
        };

        // Fire one collection job per group — QStash retries 3 times on failure.
        // failureCallback: if all 3 retries fail, QStash calls our failure handler
        // which sends the user an email to update their payment card.
        await qstash.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/collect-user-funding`,
            body: payload,
            retries: 3,
            failureCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/funding-failed`,
        });

        fired++;
    }

    return NextResponse.json({ fired });
}

export const POST = verifySignatureAppRouter(handler);
