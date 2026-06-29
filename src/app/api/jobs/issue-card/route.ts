/**
 * QStash Worker: Virtual Card Issuance
 * POST /api/jobs/issue-card
 *
 * This endpoint is called by QStash (not by users directly).
 * It performs the actual Sudo Africa card creation after the user's HTTP request
 * has already returned a 202 Accepted to the browser.
 *
 * FLOW:
 *  1. POST /api/cards/issue (user's request) → enqueues this job via QStash → returns 202
 *  2. QStash calls this endpoint asynchronously
 *  3. This handler fetches the user, gets/creates their Sudo customer, then issues the card
 *
 * SECURITY:
 *  - verifySignatureAppRouter ensures only QStash (with valid signing keys) can call this.
 *  - Without this check, anyone could trigger card issuance for arbitrary users.
 */

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { getOrCreateSudoCustomer } from '@/lib/sudo/get-or-create-customer';
import { issueCardForSubscription } from '@/lib/sudo/issue-card';
import { resolveCardCurrency } from '@/lib/sudo/currency';
import type { IssueVirtualCardJobPayload } from '@/lib/jobs/types';

async function handler(req: NextRequest): Promise<NextResponse> {
    const body = (await req.json()) as IssueVirtualCardJobPayload;

    // Validate the job type discriminator before processing
    if (body.type !== 'ISSUE_VIRTUAL_CARD') {
        return NextResponse.json({ error: 'Unknown job type' }, { status: 400 });
    }

    const { subscriptionId, userId, serviceName, billingAmount, currency, billingDay } = body;

    // Fetch minimal user data needed for the Sudo customer creation
    const user = await db
        .selectFrom('user')
        .select(['id', 'name', 'email as emailAddress', 'phone_number as phoneNumber'])
        .where('id', '=', userId)
        .executeTakeFirstOrThrow();

    // Get the user's Sudo customer ID, creating one if this is their first card
    const sudoCustomerId = await getOrCreateSudoCustomer(user);

    // Issue the card — this is idempotent; duplicate calls are safely ignored
    try {
        await issueCardForSubscription({
            subscriptionId,
            sudoCustomerId,
            serviceName,
            billingAmount,
            currency: resolveCardCurrency(currency),
            billingDay,
        });
    } catch (err) {
        console.error('[issue-card job] failed for', subscriptionId, err);
        // Mark subscription as card_failed so frontend can show retry UI
        try {
            await db
                .updateTable('user_subscriptions')
                .set({ status: 'card_failed', updated_at: new Date() })
                .where('id', '=', subscriptionId)
                .execute();
        } catch (uErr) {
            console.error('[issue-card job] failed to mark subscription card_failed', subscriptionId, uErr);
        }
        throw err;
    }

    return NextResponse.json({ success: true });
}

// Wrap with QStash signature verification — rejects any request not signed by QStash
export const POST = verifySignatureAppRouter(handler);
