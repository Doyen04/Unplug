/**
 * QStash Failure Callback: Funding Job Exhausted All Retries
 * POST /api/jobs/funding-failed
 *
 * QStash calls this endpoint automatically after a COLLECT_USER_FUNDING job
 * has been retried 3 times and still failed (all 3 attempts returned non-2xx).
 *
 * HOW IT'S WIRED:
 * In daily-billing-scan/route.ts, each publishJSON call includes:
 *   failureCallback: `${NEXT_PUBLIC_APP_URL}/api/jobs/funding-failed`
 * QStash signs this callback with the same QSTASH signing keys.
 *
 * WHAT IT DOES:
 *  1. Parses the original failed COLLECT_USER_FUNDING payload from the base64-encoded body.
 *  2. Fetches the user's name and email from our DB.
 *  3. Sends a transactional email via Nodemailer (mailer.ts) notifying the user to update their card.
 *
 * QStash failure callback body structure:
 * {
 *   sourceMessageId: string,    // original job message ID
 *   topicName: string | null,
 *   url: string,                // the original job URL that failed
 *   method: string,
 *   header: Record<string, string[]>,
 *   body: string,               // base64-encoded original job body
 *   maxRetries: number,
 *   retried: number,
 *   dlqId: string               // dead-letter queue ID for Upstash dashboard lookup
 * }
 *
 * SECURITY:
 * verifySignatureAppRouter ensures only QStash (with valid signing keys) can call this.
 * Without this, anyone could fake a failure callback to trigger emails for arbitrary users.
 */

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { sendFundingFailedEmail } from '@/lib/server/mailer';
import type { CollectUserFundingJobPayload } from '@/lib/jobs/types';

async function handler(req: NextRequest): Promise<NextResponse> {
    const callbackBody = await req.json() as {
        body?: string;   // base64-encoded original job payload
        sourceMessageId?: string;
        retried?: number;
    };

    // Decode the original COLLECT_USER_FUNDING payload from QStash's base64 body field
    let originalPayload: CollectUserFundingJobPayload | null = null;

    if (callbackBody.body) {
        try {
            const decoded = Buffer.from(callbackBody.body, 'base64').toString('utf-8');
            originalPayload = JSON.parse(decoded) as CollectUserFundingJobPayload;
        } catch (e) {
            console.error('[funding-failed] Could not decode failure callback body:', e);
            // Return 200 so QStash doesn't retry the failure callback itself
            return NextResponse.json({ error: 'Unparseable body' }, { status: 200 });
        }
    }

    if (!originalPayload || originalPayload.type !== 'COLLECT_USER_FUNDING') {
        // Not a funding job failure — nothing for us to handle
        return NextResponse.json({ skipped: true });
    }

    const { userId, billingDate, subscriptionIds } = originalPayload;

    console.warn(
        `[funding-failed] All retries exhausted for user ${userId}, billingDate ${billingDate}.`,
        `Message ID: ${callbackBody.sourceMessageId ?? 'unknown'},`,
        `Retried: ${callbackBody.retried ?? '?'} times.`
    );

    // Fetch user's name and email for the notification
    const user = await db
        .selectFrom('user')
        .select(['name', 'email'])
        .where('id', '=', userId)
        .executeTakeFirst();

    if (!user?.email) {
        console.error(`[funding-failed] No email found for user ${userId}`);
        return NextResponse.json({ error: 'User not found' }, { status: 200 }); // 200 to stop QStash re-retrying
    }

    // Fetch service names for the affected subscriptions (for a human-readable email body)
    const subscriptions = await db
        .selectFrom('user_subscriptions')
        .select(['service_name'])
        .where('id', 'in', subscriptionIds)
        .execute();

    const serviceNames = subscriptions.map((s) => s.service_name);

    // Format billing date for display: "2025-07-15" → "July 15, 2025"
    const formattedDate = new Date(billingDate).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Send notification using the same Nodemailer transporter and layout as all other Unplug emails
    await sendFundingFailedEmail(user.email, user.name ?? '', formattedDate, serviceNames);

    return NextResponse.json({ notified: true });
}

export const POST = verifySignatureAppRouter(handler);
