/**
 * QStash Cron Job: Daily Treasury Sweep
 * POST /api/jobs/daily-treasury-sweep
 * Schedule: "0 23 * * *" (11pm every day)
 *
 * WHAT IT DOES:
 * Sums all Paystack collections from today that haven't yet been transferred
 * to Sudo's Safe Haven pool, then executes ONE intra-bank transfer to move the funds.
 *
 * WHY ONE TRANSFER PER DAY (not per user):
 * - Safe Haven transfers between accounts in the same institution are free (no NIP fee).
 * - Batching into a single daily transfer maximises this cost saving.
 * - Doing one transfer per user would incur a NIP fee per user even within the same bank.
 *
 * TIMING:
 * - Paystack collections happen throughout the day (D-3 from billing).
 * - By 11pm all same-day settlements from Paystack should have arrived in Safe Haven.
 * - The sweep runs at 11pm to catch all of today's collections.
 *
 * WHAT GETS MARKED:
 * After a successful transfer, all matching card_funding_transactions rows are
 * updated to status='transferred' with a treasury_ref (Safe Haven transfer reference).
 * The reconcile-surplus logic uses these 'transferred' rows to compute surplus credits.
 */

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

async function handler(_req: NextRequest): Promise<NextResponse> {
    const now = new Date();
    // Define the start and end of the current calendar day for the WHERE filter
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    // Fetch all pending rows and the aggregate total in one query.
    const pendingRows = await db
        .selectFrom('card_funding_transactions')
        .select(['id', (eb) => eb.fn.sum<number>('amount_kobo').over().as('total')])
        .where('status', '=', 'collected')         // successfully charged by Paystack
        .where('transferred_at', 'is', null)       // not yet included in a treasury sweep
        .where('created_at', '>=', start)
        .where('created_at', '<=', end)
        .execute();

    const totalKobo = Number(pendingRows[0]?.total ?? 0);

    if (totalKobo === 0 || pendingRows.length === 0) {
        console.log('[treasury-sweep] No pending collections today. Skipping.');
        return NextResponse.json({ skipped: true });
    }

    // Build a unique, idempotent reference for this sweep — one per calendar day.
    // If Safe Haven's API is called twice with the same reference, the second call is a no-op.
    const transferRef = `unplug_sweep_${now.toISOString().split('T')[0]}`;

    // Execute the intra-bank transfer: Unplug's Safe Haven account → Sudo's Safe Haven pool.
    // Intra-bank = both accounts at Safe Haven MFB → zero NIP fee.
    const transferRes = await fetch('https://api.safehavenmfb.com/transfers', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.SAFE_HAVEN_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: totalKobo,
            debitAccountNumber: process.env.UNPLUG_SAFE_HAVEN_ACCOUNT,    // Unplug's Safe Haven account
            beneficiaryBankCode: '51229',                                  // Safe Haven MFB CBN bank code
            beneficiaryAccountNumber: process.env.SUDO_SAFE_HAVEN_ACCOUNT, // Sudo Africa's pool account
            narration: `Unplug Sudo pool funding ${transferRef}`,
            reference: transferRef,   // idempotency key
        }),
    });

    if (!transferRes.ok) {
        const err = await transferRes.json().catch(() => ({}));
        console.error('[treasury-sweep] Safe Haven transfer failed:', err);
        // Throw so QStash retries the sweep job
        throw new Error(`Safe Haven transfer failed: ${JSON.stringify(err)}`);
    }

    const transfer = await transferRes.json();

    // Mark all today's collected rows as transferred in a single UPDATE.
    // Uses the same date window as the SELECT above to avoid marking tomorrow's rows.
    const ids = pendingRows.map((row) => row.id);
    await db
        .updateTable('card_funding_transactions')
        .set({
            status: 'transferred',
            transferred_at: now,
            treasury_ref: transfer.data?.reference ?? transferRef,
            updated_at: now,
        })
        .where('status', '=', 'collected')
        .where('transferred_at', 'is', null)
        .where('created_at', '>=', start)
        .where('created_at', '<=', end)
        .where('id', 'in', ids)  // ← pinned to the IDs from the SELECT
        .execute();

    console.log(`[treasury-sweep] Transferred ₦${(totalKobo / 100).toLocaleString()} to Sudo pool.`);
    return NextResponse.json({ transferred: totalKobo });
}

export const POST = verifySignatureAppRouter(handler);
