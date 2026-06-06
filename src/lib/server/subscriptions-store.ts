import { db } from './db';
import type { Subscription, SubscriptionStatus } from '@/types/subscription';

export interface StoredSubscription extends Subscription {
    previousStatus?: SubscriptionStatus;
}

const isProviderScopedId = (id: string): boolean => id.startsWith('plaid-') || id.startsWith('mono-');

export const readStoredSubscriptions = async (userId: string): Promise<StoredSubscription[]> => {
    const rows = await db
        .selectFrom('user_subscriptions')
        .select([
            'subscription_id as id',
            'service_name as serviceName',
            'amount_monthly as amountMonthly',
            'frequency_label as frequencyLabel',
            'status',
            'confidence',
            'usage_score as usageScore',
            'verdict',
            'alert',
            'previous_status as previousStatus',
        ])
        .where('user_id', '=', userId)
        .execute();

    return rows.map((row) => ({
        id: row.id as string,
        serviceName: row.serviceName,
        amountMonthly: Number(row.amountMonthly),
        frequencyLabel: row.frequencyLabel as StoredSubscription['frequencyLabel'],
        status: row.status as StoredSubscription['status'],
        confidence: row.confidence as StoredSubscription['confidence'],
        usageScore: Number(row.usageScore),
        verdict: row.verdict as StoredSubscription['verdict'],
        alert: row.alert ? (typeof row.alert === 'string' ? JSON.parse(row.alert) : row.alert) : undefined,
        previousStatus: (row.previousStatus as SubscriptionStatus | null) || undefined,
    }));
};

export const writeStoredSubscriptions = async (
    userId: string,
    subscriptions: StoredSubscription[]
): Promise<void> => {
    if (subscriptions.length === 0) return;

    for (const sub of subscriptions) {
        if (!isProviderScopedId(sub.id)) continue;

        const provider = sub.id.split('-')[0];

        await db
            .insertInto('user_subscriptions')
            .values({
                user_id: userId,
                provider,
                subscription_id: sub.id,
                service_name: sub.serviceName,
                amount_monthly: sub.amountMonthly,
                frequency_label: sub.frequencyLabel,
                status: sub.status,
                confidence: sub.confidence,
                usage_score: sub.usageScore,
                verdict: sub.verdict,
                alert: sub.alert ? JSON.stringify(sub.alert) : null,
                previous_status: sub.previousStatus ?? null,
            })
            .onConflict((oc) =>
                oc.columns(['user_id', 'subscription_id']).doUpdateSet((eb) => ({
                    service_name: eb.ref('excluded.service_name'),
                    amount_monthly: eb.ref('excluded.amount_monthly'),
                    frequency_label: eb.ref('excluded.frequency_label'),
                    status: eb.ref('excluded.status'),
                    confidence: eb.ref('excluded.confidence'),
                    usage_score: eb.ref('excluded.usage_score'),
                    verdict: eb.ref('excluded.verdict'),
                    alert: eb.ref('excluded.alert'),
                    previous_status: eb.ref('excluded.previous_status'),
                    updated_at: new Date(),
                }))
            )
            .execute();
    }
};
