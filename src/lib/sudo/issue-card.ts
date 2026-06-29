/**
 * Virtual Card Issuance
 *
 * Core logic for creating a Sudo Africa virtual card tied to a specific subscription.
 *
 * DESIGN DECISIONS:
 * - One card per subscription. If a card already exists, the function returns early (idempotent).
 * - The card's spend limit is set 10% above the subscription amount as a buffer against
 *   minor price increases (e.g. when a service adds tax or slightly adjusts pricing).
 * - Card channels are restricted to web + mobile only. ATM and POS are disabled
 *   because subscription services never charge via physical terminals.
 * - MCC codes whitelist restricts which merchants can charge the card.
 *   A Netflix card cannot be used at a grocery store.
 * - SECURITY: PAN and CVV are never stored. Only last4, expiry, and status are persisted.
 */

import { db } from '../server/db';
import { createSudoCard } from './client';
import { getMCCsForService } from './mcc-map';

interface IssueCardParams {
    subscriptionId: string;
    sudoCustomerId: string;
    serviceName: string;
    billingAmount: number;   // human-readable decimal (e.g. 4500 = ₦4,500 or 9.99 = $9.99)
    currency: 'NGN' | 'USD';
    billingDay: number;
}

/**
 * Issues a new virtual card for a subscription and saves safe metadata to the DB.
 *
 * This function may be called directly by API routes. It will silently skip if a
 * card already exists for the subscription.
 *
 * @param params Card issuance parameters including subscription ID, user's Sudo customer ID,
 *               service name (for MCC lookup), billing amount, and currency.
 */
export async function issueCardForSubscription(
    params: IssueCardParams
): Promise<void> {
    const { subscriptionId, sudoCustomerId, serviceName, billingAmount, currency, billingDay } = params;

    // Guard: never issue a second card for the same subscription.
    // The DB also has a UNIQUE index on subscription_id for extra safety.
    const alreadyExists = await db
        .selectFrom('subscription_cards')
        .select('id')
        .where('subscription_id', '=', subscriptionId)
        .executeTakeFirst();

    if (alreadyExists) {
        console.log(`[issue-card] Card exists for subscription ${subscriptionId}. Skipping.`);
        return;
    }

    // Get the MCC codes for this service — used to lock the card to specific merchant types
    const mccs = getMCCsForService(serviceName);

    // Convert to smallest unit (kobo/cents) then add a 10% buffer.
    // The buffer accounts for minor price increases without requiring a new card.
    const amountSmallestUnit = Math.round(billingAmount * 100);
    const spendLimitWithBuffer = Math.round(amountSmallestUnit * 1.1);

    // Create the virtual card in Sudo Africa
    const card = await createSudoCard({
        customerId: sudoCustomerId,
        type: 'virtual',
        currency,
        brand: "Verve",
        status: 'active',
        debitAccountId: process.env.SUDO_POOL_ACCOUNT_ID!,
        amount: spendLimitWithBuffer, //what if there is no money at the time of creation
        spendingControls: {
            spendingLimits: [{ amount: spendLimitWithBuffer, interval: 'monthly', billing_day: billingDay }],
            allowedCategories: mccs,   // whitelist: only these MCCs can charge this card
            blockedCategories: [],   // blacklist: these MCCs cannot charge this card
            channels: {
                atm: false,   // subscriptions never use ATMs
                pos: false,   // subscriptions never use physical POS terminals
                web: true,    // most subscription billing is web-based
                mobile: true,    // some services bill through mobile payment endpoints
            },
        },
    });

    // console.log('[issue-card] sudo response:', JSON.stringify(card));
    // Persist ONLY safe metadata — PAN and CVV from the Sudo response are intentionally discarded.
    // The `card` object returned by createSudoCard does not include the PAN anyway.
    const insertResult = await db
        .insertInto('subscription_cards')
        .values({
            subscription_id: subscriptionId,
            sudo_card_id: card._id,
            sudo_customer_id: sudoCustomerId,
            currency: card.currency,
            last_four: card.last4 ?? card.maskedPan.slice(-4),         // safe to store — not a secret
            expiry_month: card.expiryMonth,   // safe to store
            expiry_year: card.expiryYear,    // safe to store
            status: 'active',
            spend_limit_kobo: spendLimitWithBuffer,
            migration_status: 'pending',          // user hasn't switched payment method yet
            updated_at: new Date(),
        })
        .returning('id')
        .executeTakeFirstOrThrow();

    // For manual subscriptions, transition from 'pending_card' → 'active'
    // For Mono-detected subscriptions, keep the existing migration state machine
    await db
        .updateTable('user_subscriptions')
        .set({
            card_id: insertResult.id,
            status: 'active',    // both manual and Mono subscriptions are active once card is ready
            updated_at: new Date(),
        })
        .where('id', '=', subscriptionId)
        .execute();

    console.log(`[issue-card] Card ${card._id} issued for subscription ${subscriptionId}`);
}
