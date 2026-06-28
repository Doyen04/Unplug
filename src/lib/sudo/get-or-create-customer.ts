/**
 * Sudo Customer Management
 *
 * In Sudo Africa's system, every cardholder must have a "customer" record
 * before any cards can be issued to them. This customer acts as the KYC anchor
 * for all virtual cards under that user's account.
 *
 * Unplug's model: ONE Sudo customer per Unplug user.
 * All virtual cards (Netflix, Spotify, Notion…) are issued under that single customer.
 *
 * This function is idempotent — safe to call multiple times.
 * If a customer already exists in our DB, it returns the existing ID immediately.
 * If not, it creates one in Sudo Africa and saves the mapping locally.
 */

import { db } from '../server/db';
import { createSudoCustomer } from './client';

interface UserForCard {
    id: string;
    name: string;       // full display name — split into first/last if needed
    firstName?: string;      // optional explicit first name
    lastName?: string;      // optional explicit last name
}

/**
 * Returns the Sudo customer ID for a user, creating one if it doesn't exist.
 *
 * Why this approach:
 * - We never want two Sudo customers for the same Unplug user.
 * - The DB has a UNIQUE index on user_id in sudo_customers, so even if two
 *   concurrent requests race here, only one insert will succeed.
 * - The billing address is a placeholder — Sudo requires it but
 *   does not use it for virtual card transactions.
 *
 * @param user Minimal user data needed to create a cardholder in Sudo.
 * @returns The Sudo customer ID string (e.g. "64a1b2c3d4e5f6…").
 */
export async function getOrCreateSudoCustomer(
    user: UserForCard
): Promise<string> {
    // Check local DB first — avoids an unnecessary Sudo API call on every card issuance
    const existing = await db
        .selectFrom('sudo_customers')
        .select('sudo_customer_id')
        .where('user_id', '=', user.id)
        .executeTakeFirst();

    if (existing) return existing.sudo_customer_id;

    // Parse first/last from the full display name if not provided explicitly
    const nameParts = (user.name ?? 'User Unknown').split(' ');
    const firstName = user.firstName ?? nameParts[0] ?? 'User';
    const lastName = (user.lastName ?? nameParts.slice(1).join(' ')) || 'Unknown';

    // Create the cardholder record in Sudo Africa
    const customer = await createSudoCustomer({
        type: 'individual',
        name: user.name,
        status: 'active',
        individual: { firstName, lastName },
        billingAddress: {
            // Placeholder address — required by Sudo but not used for virtual card authorizations
            line1: '1 Main Street',
            city: 'Lagos',
            state: 'LA',
            country: 'NG',
            postalCode: '100001',
        },
    });

    // Persist the mapping so future calls skip the Sudo API entirely
    await db
        .insertInto('sudo_customers')
        .values({
            user_id: user.id,
            sudo_customer_id: customer._id,
            status: 'active',
            updated_at: new Date(),
        })
        .execute();

    return customer._id;
}
