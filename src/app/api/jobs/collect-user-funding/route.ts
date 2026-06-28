/**
 * QStash Worker: User Wallet Funding via Paystack
 * POST /api/jobs/collect-user-funding
 *
 * WHAT IT DOES:
 * Charges the user's saved Paystack authorization code to fund their virtual card
 * wallet before their subscription billing date arrives.
 *
 * COLLECTION AMOUNT = subscription total + 7.5% buffer
 * (See src/lib/funding/calculate-collection.ts for the full breakdown)
 *
 * WALLET CREDIT:
 * If the user has accumulated wallet credit from a previous billing cycle's surplus,
 * it is deducted FIRST before calculating how much to charge Paystack.
 * This means a user with enough credit may pay ₦0 in a given month.
 *
 * FAILURE HANDLING:
 * If the Paystack charge fails (insufficient funds, card blocked, etc.) this
 * handler throws an error, causing QStash to retry the job up to 3 times automatically.
 * After 3 failures, the job is marked dead — the user should be notified separately.
 *
 * DATA WRITTEN:
 * On success, one card_funding_transactions row is created per subscription in the group.
 * These rows are later picked up by the nightly treasury sweep.
 */

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { calculateCollectionAmount } from '@/lib/funding/calculate-collection';
import type { CollectUserFundingJobPayload } from '@/lib/jobs/types';

async function handler(req: NextRequest): Promise<NextResponse> {
    const body = (await req.json()) as CollectUserFundingJobPayload;

    if (body.type !== 'COLLECT_USER_FUNDING') {
        return NextResponse.json({ error: 'Unknown job type' }, { status: 400 });
    }

    const { userId, billingDate, subscriptionIds, totalKobo } = body;

    // Step 1: Look up the Paystack authorization code saved from the user's first Pro payment.
    // This is what enables merchant-initiated charges (no user action required).
    const fundingSource = await db
        .selectFrom('user_funding_sources')
        .select(['paystack_authorization_code', 'paystack_email'])
        .where('user_id', '=', userId)
        .where('status', '=', 'active')
        .executeTakeFirst();

    if (!fundingSource) {
        // No saved card — cannot collect. Log and skip without failing.
        // TODO: send push notification / email: "Add a card to keep your subscriptions running"
        console.warn(`[collect] No funding source for user ${userId}`);
        return NextResponse.json({ skipped: 'no_funding_source' });
    }

    // Step 2: Check if user has wallet credit from a previous cycle's surplus
    const user = await db
        .selectFrom('user')
        .select(['wallet_credit_kobo'])
        .where('id', '=', userId)
        .executeTakeFirstOrThrow();

    const walletCredit = Number(user.wallet_credit_kobo ?? 0);
    const breakdown = calculateCollectionAmount(totalKobo);

    // Net amount to charge = (subscription + buffer) minus any accumulated wallet credit
    const netCollect = Math.max(0, breakdown.collectionAmount - walletCredit);

    // Step 3: Consume the wallet credit that will be applied
    if (walletCredit > 0) {
        const creditUsed = Math.min(walletCredit, breakdown.collectionAmount);
        await db
            .updateTable('user')
            .set({ wallet_credit_kobo: walletCredit - creditUsed })
            .where('id', '=', userId)
            .execute();
    }

    // Step 4: If credit covered the entire amount, skip the Paystack charge entirely
    if (netCollect === 0) {
        await db.insertInto('card_funding_transactions')
            .values(
                subscriptionIds.map((subId) => ({
                    user_id: userId,
                    subscription_id: subId,
                    amount_kobo: 0,
                    subscription_kobo: Math.round(totalKobo / subscriptionIds.length),
                    currency: 'NGN',
                    billing_date: new Date(billingDate),
                    paystack_ref: `wallet_credit_${userId}_${billingDate}`,
                    status: 'collected',
                    updated_at: new Date(),
                }))
            )
            .execute();

        return NextResponse.json({ status: 'covered_by_credit' });
    }

    // Step 5: Charge the user's saved card via Paystack merchant-initiated transaction.
    // The reference is unique per user+date+timestamp to prevent duplicate charges.
    const chargeRes = await fetch('https://api.paystack.co/transaction/charge_authorization', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: fundingSource.paystack_email,
            amount: netCollect,    // in kobo (smallest unit)
            authorization_code: fundingSource.paystack_authorization_code,
            reference: `unplug_fund_${userId}_${billingDate}_${Date.now()}`,
            metadata: {
                userId,
                billingDate,
                subscriptionIds,
                purpose: 'virtual_card_funding',
            },
        }),
    });

    const charge = await chargeRes.json();

    if (charge.data?.status === 'success') {
        // Log one row per subscription in the group, splitting the charge amount evenly.
        // Treasury sweep will later sum these rows to determine how much to transfer to Sudo.
        await db.insertInto('card_funding_transactions')
            .values(
                subscriptionIds.map((subId) => ({
                    user_id: userId,
                    subscription_id: subId,
                    amount_kobo: Math.round(netCollect / subscriptionIds.length),
                    subscription_kobo: Math.round(totalKobo / subscriptionIds.length),
                    currency: 'NGN',
                    billing_date: new Date(billingDate),
                    paystack_ref: charge.data.reference,
                    status: 'collected',
                    updated_at: new Date(),
                }))
            )
            .execute();

        return NextResponse.json({ status: 'success', ref: charge.data.reference });
    }

    // Charge failed — throw so QStash retries this job automatically (up to 3 attempts)
    console.error(`[collect] Paystack charge failed for user ${userId}:`, charge);
    throw new Error(`Paystack charge failed: ${charge.message}`);
}

export const POST = verifySignatureAppRouter(handler);
