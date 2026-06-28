/**
 * Card Issuance Job Enqueuer
 *
 * Publishes a card issuance job to QStash so the actual Sudo Africa API call
 * happens asynchronously in the background — not in the user's request/response cycle.
 *
 * WHY ASYNC:
 * - Sudo Africa card creation can take 1–3 seconds.
 * - The user should not wait for this. The API returns 202 immediately and the
 *   card appears in the UI shortly after the worker completes.
 * - QStash automatically retries up to 3 times if the worker endpoint fails,
 *   giving resilience against transient Sudo API errors.
 *
 * The worker endpoint that processes this job is:
 *   POST /api/jobs/issue-card
 */

import { Client } from '@upstash/qstash';
import type { IssueVirtualCardJobPayload } from './types';

// QStash client — authenticated with the token from .env.local
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

/**
 * Enqueues a virtual card issuance job for background processing.
 * Returns once QStash has accepted the job — does not wait for card creation.
 *
 * @param payload All data the worker needs: subscriptionId, userId, serviceName, billing details.
 *                The 'type' discriminator is added automatically.
 */
export async function enqueueCardIssuance(
    payload: Omit<IssueVirtualCardJobPayload, 'type'>
): Promise<void> {
    await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/issue-card`,
        body: { type: 'ISSUE_VIRTUAL_CARD', ...payload },
        retries: 3,   // QStash retries the worker up to 3 times on failure
    });
}
