import { db } from '@/lib/server/db';
import { updateSudoCardStatus, type SudoCardStatus } from './client';

/**
 * Freezes or unfreezes a single virtual card: Sudo Africa first, then mirrors
 * the new status in our local DB.
 *
 * UPDATE ORDER — always Sudo first, then our DB:
 * Sudo is the source of truth for card status. If we update our DB first and
 * the Sudo call fails, our DB would say "inactive" but Sudo would still be
 * "active", meaning the card accepts charges despite appearing frozen in the UI.
 */
export async function setCardStatus(
    cardId: string,
    sudoCardId: string,
    status: SudoCardStatus
): Promise<void> {
    await updateSudoCardStatus(sudoCardId, status);

    await db
        .updateTable('subscription_cards')
        .set({ status, updated_at: new Date() })
        .where('id', '=', cardId)
        .execute();
}

/**
 * Freezes every currently-active virtual card belonging to a user.
 *
 * Called when a user's Pro subscription is cancelled — virtual cards are a
 * Pro-only feature, so existing cards must stop accepting charges immediately
 * rather than lingering active until the user notices (or worse, until the
 * next billing attempt silently succeeds on a plan they no longer pay for).
 *
 * Cards that are already frozen/closed are left untouched. A failure freezing
 * one card is logged but does not block freezing the rest.
 */
export async function freezeAllCardsForUser(userId: string): Promise<void> {
    const cards = await db
        .selectFrom('subscription_cards as sc')
        .innerJoin('user_subscriptions as s', 's.id', 'sc.subscription_id')
        .select(['sc.id', 'sc.sudo_card_id'])
        .where('s.user_id', '=', userId)
        .where('sc.status', '=', 'active')
        .execute();

    for (const card of cards) {
        try {
            await setCardStatus(card.id, card.sudo_card_id, 'inactive');
        } catch (err) {
            console.error('[freezeAllCardsForUser] failed to freeze card', card.id, err);
        }
    }
}
