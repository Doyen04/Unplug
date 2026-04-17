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

const isProviderScopedId = (id: string): boolean => id.startsWith('plaid-') || id.startsWith('mono-');

const ensureDataFile = async (): Promise<void> => {
    await mkdir(dirname(dataFilePath), { recursive: true });

    try {
        await readFile(dataFilePath, 'utf-8');
    } catch {
        await writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
};

export const readStoredSubscriptions = async (): Promise<StoredSubscription[]> => {
    await ensureDataFile();
    const raw = await readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    const validated = storedSubscriptionsSchema.safeParse(parsed);

    if (!validated.success) {
        await writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
        return [];
    }

    const providerScoped = validated.data.filter((item) => isProviderScopedId(item.id));

    if (providerScoped.length !== validated.data.length) {
        await writeFile(dataFilePath, JSON.stringify(providerScoped, null, 2), 'utf-8');
    }

    return providerScoped;
};

export const writeStoredSubscriptions = async (
    subscriptions: StoredSubscription[]
): Promise<void> => {
    await ensureDataFile();
    await writeFile(dataFilePath, JSON.stringify(subscriptions, null, 2), 'utf-8');
};
