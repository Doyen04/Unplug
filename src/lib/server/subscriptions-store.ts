import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { z } from 'zod';

import type { Subscription, SubscriptionStatus } from '../../types/subscription';

export interface StoredSubscription extends Subscription {
    previousStatus?: Exclude<SubscriptionStatus, 'cancelled'>;
}

const dataFilePath = join(process.cwd(), 'data', 'subscriptions.json');

const storedSubscriptionSchema: z.ZodType<StoredSubscription> = z.object({
    id: z.string(),
    serviceName: z.string(),
    amountMonthly: z.number(),
    frequencyLabel: z.enum(['monthly', 'weekly', 'yearly']),
    status: z.enum(['unused', 'trial-ending', 'price-hike', 'healthy', 'cancelled']),
    confidence: z.enum(['high', 'medium', 'low']),
    usageScore: z.number(),
    verdict: z.enum(['active', 'likely_unused', 'unused', 'unknown']),
    alert: z
        .object({
            type: z.enum(['unused', 'trial-ending', 'price-hike', 'dormant']),
            message: z.string(),
        })
        .optional(),
    previousStatus: z.enum(['unused', 'trial-ending', 'price-hike', 'healthy']).optional(),
});

const storedSubscriptionsSchema = z.array(storedSubscriptionSchema);

const seededSubscriptions: StoredSubscription[] = [
    {
        id: 's-1',
        serviceName: 'Netflix',
        amountMonthly: 19,
        frequencyLabel: 'monthly',
        status: 'unused',
        confidence: 'high',
        usageScore: 18,
        verdict: 'unused',
        alert: { type: 'unused', message: 'No usage signals in 45 days' },
    },
    {
        id: 's-2',
        serviceName: 'Spotify',
        amountMonthly: 12,
        frequencyLabel: 'monthly',
        status: 'healthy',
        confidence: 'high',
        usageScore: 84,
        verdict: 'active',
    },
    {
        id: 's-3',
        serviceName: 'Notion',
        amountMonthly: 15,
        frequencyLabel: 'monthly',
        status: 'price-hike',
        confidence: 'medium',
        usageScore: 62,
        verdict: 'likely_unused',
        alert: { type: 'price-hike', message: 'Up $2.00 vs last month' },
    },
    {
        id: 's-4',
        serviceName: 'Duolingo',
        amountMonthly: 13,
        frequencyLabel: 'monthly',
        status: 'trial-ending',
        confidence: 'medium',
        usageScore: 50,
        verdict: 'likely_unused',
        alert: { type: 'trial-ending', message: 'Trial converts in 2 days' },
    },
    {
        id: 's-5',
        serviceName: 'YouTube Premium',
        amountMonthly: 14,
        frequencyLabel: 'monthly',
        status: 'healthy',
        confidence: 'high',
        usageScore: 76,
        verdict: 'active',
    },
    {
        id: 's-6',
        serviceName: 'Adobe CC',
        amountMonthly: 61,
        frequencyLabel: 'monthly',
        status: 'unused',
        confidence: 'medium',
        usageScore: 28,
        verdict: 'unused',
        alert: { type: 'dormant', message: 'Likely unused based on recent signals' },
    },
];

const ensureDataFile = async (): Promise<void> => {
    await mkdir(dirname(dataFilePath), { recursive: true });

    try {
        await readFile(dataFilePath, 'utf-8');
    } catch {
        await writeFile(dataFilePath, JSON.stringify(seededSubscriptions, null, 2), 'utf-8');
    }
};

export const readStoredSubscriptions = async (): Promise<StoredSubscription[]> => {
    await ensureDataFile();
    const raw = await readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    const validated = storedSubscriptionsSchema.safeParse(parsed);

    if (!validated.success) {
        await writeFile(dataFilePath, JSON.stringify(seededSubscriptions, null, 2), 'utf-8');
        return seededSubscriptions;
    }

    return validated.data;
};

export const writeStoredSubscriptions = async (
    subscriptions: StoredSubscription[]
): Promise<void> => {
    await ensureDataFile();
    await writeFile(dataFilePath, JSON.stringify(subscriptions, null, 2), 'utf-8');
};
