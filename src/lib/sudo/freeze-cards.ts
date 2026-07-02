import { db } from "@/lib/server/db";
import { updateSudoCardStatus, type SudoCardStatus } from "./client";

/**
 * Freezes, unfreezes, or closes a single virtual card: Sudo Africa first,
 * then mirrors the new status in our local DB.
 *
 * UPDATE ORDER — always Sudo first, then our DB:
 * Sudo is the source of truth for card status. If we update our DB first and
 * the Sudo call fails, our DB would say "inactive" but Sudo would still be
 * "active", meaning the card accepts charges despite appearing frozen in the UI.
 */
export async function setCardStatus(
    cardId: string,
    sudoCardId: string,
    status: SudoCardStatus,
): Promise<void> {
    await updateSudoCardStatus(sudoCardId, status);

    await db
        .updateTable("subscription_cards")
        .set({ status, updated_at: new Date() })
        .where("id", "=", cardId)
        .execute();
}

/**
 * Shared bulk-update: moves every one of a user's cards currently in one of
 * `fromStatuses` to `targetStatus`. A failure on one card is logged but does
 * not block updating the rest — used by both the Pro-cancellation freeze
 * and the account-deletion close flows below.
 */
async function updateStatusForUserCards(
    userId: string,
    targetStatus: SudoCardStatus,
    fromStatuses: SudoCardStatus[],
): Promise<void> {
    const cards = await db
        .selectFrom("subscription_cards as sc")
        .innerJoin("user_subscriptions as s", "s.id", "sc.subscription_id")
        .select(["sc.id", "sc.sudo_card_id"])
        .where("s.user_id", "=", userId)
        .where("sc.status", "in", fromStatuses)
        .execute();

    for (const card of cards) {
        try {
            await setCardStatus(card.id, card.sudo_card_id, targetStatus);
        } catch (err) {
            console.error(
                `[updateStatusForUserCards] failed to set card ${card.id} to "${targetStatus}"`,
                err,
            );
        }
    }
}

/**
 * Freezes every currently-active virtual card belonging to a user.
 *
 * Called when a user's Pro subscription is cancelled — virtual cards are a
 * Pro-only feature, so existing cards must stop accepting charges immediately
 * rather than lingering active until the user notices (or worse, until the
 * next billing attempt silently succeeds on a plan they no longer pay for).
 */
export async function freezeAllCardsForUser(userId: string): Promise<void> {
    await updateStatusForUserCards(userId, "inactive", ["active"]);
}

/**
 * Permanently closes every non-closed virtual card belonging to a user.
 *
 * Called when a user deletes their account — cards must stop working in
 * Sudo Africa immediately, not just get orphaned by deleting our local rows.
 * Unlike freezing, closing is terminal and applies to active AND already
 * frozen cards, since the account (and its DB rows) is about to be removed.
 */
export async function closeAllCardsForUser(userId: string): Promise<void> {
    await updateStatusForUserCards(userId, "closed", ["active", "inactive"]);
}
