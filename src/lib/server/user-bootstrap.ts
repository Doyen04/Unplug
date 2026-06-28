import { db } from './db';

export async function ensureUserBootstrap(userId: string): Promise<void> {
    const now = new Date();

    await db
        .insertInto('user_settings')
        .values({
            user_id: userId,
            new_subscriptions_alerts: true,
            monthly_summary: true,
            price_increase_alert: false,
            onboarding_completed: false,
            created_at: now,
            updated_at: now,
        })
        .onConflict((oc) =>
            oc.column('user_id').doUpdateSet({
                updated_at: now,
            })
        )
        .execute();
}
