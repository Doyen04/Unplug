import { db } from './db';

/**
 * Checks whether a user currently has an active Unplug Pro subscription.
 *
 * This is the single source of truth for Pro-gating throughout the app.
 * Virtual card issuance, card viewing/reveal, and Pro-only UI should all
 * call this instead of re-querying `user.plan` inline, so the definition
 * of "Pro" only ever needs to change in one place.
 *
 * Plan status is kept up to date by the Paystack webhook
 * (`subscription.create` → 'pro', `subscription.disable` → 'free'), so a
 * fresh DB read here always reflects cancellations immediately.
 */
export const isProUser = async (userId: string): Promise<boolean> => {
    const user = await db
        .selectFrom('user')
        .select(['plan'])
        .where('id', '=', userId)
        .executeTakeFirst();

    return user?.plan === 'pro';
};
