import { sql } from 'kysely';
import { db } from './db';
import type { Subscription, SubscriptionStatus } from '../../types/subscription';

export interface StoredSubscription extends Subscription {
    previousStatus?: Exclude<SubscriptionStatus, 'cancelled'>;
}

const isProviderScopedId = (id: string): boolean => id.startsWith('plaid-') || id.startsWith('mono-');

export const readStoredSubscriptions = async (userId: string): Promise<StoredSubscription[]> => {
    // We use sql`` queries for dynamic Record<string, unknown> Kysely db
    const result = await sql`
        SELECT 
            subscription_id as id,
            service_name as "serviceName",
            amount_monthly as "amountMonthly",
            frequency_label as "frequencyLabel",
            status,
            confidence,
            usage_score as "usageScore",
            verdict,
            alert,
            previous_status as "previousStatus"
        FROM user_subscriptions
        WHERE user_id = ${userId}
    `.execute(db);

    const rows = result.rows as any[];
    
    return rows.map((row) => ({
        id: row.id,
        serviceName: row.serviceName,
        amountMonthly: Number(row.amountMonthly),
        frequencyLabel: row.frequencyLabel,
        status: row.status,
        confidence: row.confidence,
        usageScore: Number(row.usageScore),
        verdict: row.verdict,
        alert: row.alert ? (typeof row.alert === 'string' ? JSON.parse(row.alert) : row.alert) : undefined,
        previousStatus: row.previousStatus || undefined,
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

        await sql`
            INSERT INTO user_subscriptions (
                user_id, provider, subscription_id, service_name, amount_monthly,
                frequency_label, status, confidence, usage_score, verdict, alert, previous_status
            ) VALUES (
                ${userId}, ${provider}, ${sub.id}, ${sub.serviceName}, ${sub.amountMonthly},
                ${sub.frequencyLabel}, ${sub.status}, ${sub.confidence}, ${sub.usageScore},
                ${sub.verdict}, ${sub.alert ? JSON.stringify(sub.alert) : null}, ${sub.previousStatus ?? null}
            )
            ON CONFLICT (user_id, subscription_id) DO UPDATE SET
                service_name = EXCLUDED.service_name,
                amount_monthly = EXCLUDED.amount_monthly,
                frequency_label = EXCLUDED.frequency_label,
                status = EXCLUDED.status,
                confidence = EXCLUDED.confidence,
                usage_score = EXCLUDED.usage_score,
                verdict = EXCLUDED.verdict,
                alert = EXCLUDED.alert,
                previous_status = EXCLUDED.previous_status,
                updated_at = now()
        `.execute(db);
    }
};
