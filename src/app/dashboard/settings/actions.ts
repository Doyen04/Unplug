"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/auth-session";
import { auth } from "@/lib/auth";

import { cancelPaystackSubscriptionForUser } from "@/lib/paystack";
import {
    freezeAllCardsForUser,
    closeAllCardsForUser,
} from "@/lib/sudo/freeze-cards";
import { deactivateSudoCustomer } from "@/lib/sudo/client";

export async function serverSignOutAction() {
    await auth.api.signOut({ headers: await headers() });
    redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
    const session = await getServerSession();
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!name || !email) {
        redirect("/dashboard/settings?error=invalid_profile_input");
    }

    try {
        await db
            .updateTable("user")
            .set({ name, email })
            .where("id", "=", userId)
            .execute();
    } catch (error) {
        console.error("Failed to update profile:", error);
        redirect("/dashboard/settings?error=profile_update_failed");
    }
    redirect("/dashboard/settings?success=profile_updated");
}

export async function unsubscribeFromProAction() {
    const session = await getServerSession();
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = session.user.id;

    try {
        // Cancel the active subscription on Paystack
        await cancelPaystackSubscriptionForUser(userId);

        // Revert database plan to free
        await db
            .updateTable("user")
            .set({ plan: "free", plan_expires_at: null })
            .where("id", "=", userId)
            .execute();

        // Virtual cards are a Pro-only feature — freeze every card the user
        // still has so none of them can be charged on a plan they just cancelled.
        await freezeAllCardsForUser(userId);
    } catch (error) {
        console.error("Failed to unsubscribe:", error);
        redirect("/dashboard/settings?error=unsubscribe_failed");
    }
    redirect("/dashboard/settings?success=unsubscribed");
}

export async function deleteAccountAction() {
    const session = await getServerSession();
    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = session.user.id;

    try {
        // Stop any live billing before touching records — deleting rows doesn't
        // cancel the Paystack subscription, so it would keep renewing otherwise.
        await cancelPaystackSubscriptionForUser(userId);

        // Close every virtual card in Sudo Africa so they stop working immediately.
        // This must happen before we delete subscription_cards below, since we
        // still need the sudo_card_id / ownership join at this point.
        await closeAllCardsForUser(userId);

        // card_transactions has no user_id column and no FK to "user" — it's keyed
        // by sudo_card_id / subscription_id, so it survives deleting user_subscriptions
        // (subscription_id gets SET NULL, not cascaded). Delete it explicitly using
        // the user's card IDs before those cards are cascade-deleted.
        const userCardIds = await db
            .selectFrom("subscription_cards as sc")
            .innerJoin("user_subscriptions as s", "s.id", "sc.subscription_id")
            .select("sc.sudo_card_id")
            .where("s.user_id", "=", userId)
            .execute();

        if (userCardIds.length > 0) {
            await db
                .deleteFrom("card_transactions")
                .where(
                    "sudo_card_id",
                    "in",
                    userCardIds.map((c) => c.sudo_card_id),
                )
                .execute();
        }

        // Deactivate the Sudo customer profile on Sudo Africa's side.
        // Sudo has no DELETE /customers endpoint — setting status to 'inactive'
        // prevents any new cards being issued and disables the profile.
        // The local sudo_customers row is cleaned up automatically by
        // the ON DELETE CASCADE on user(id) when we delete the user below.
        const sudoCustomerRow = await db
            .selectFrom("sudo_customers")
            .select("sudo_customer_id")
            .where("user_id", "=", userId)
            .executeTakeFirst();

        if (sudoCustomerRow?.sudo_customer_id) {
            await deactivateSudoCustomer(sudoCustomerRow.sudo_customer_id);
        }

        // card_funding_transactions has a user_id column but no FK constraint at
        // all, so it's never cleaned up automatically — delete it explicitly.
        await db
            .deleteFrom("card_funding_transactions")
            .where("user_id", "=", userId)
            .execute();

        // Delete remaining app-level data (subscription_cards cascades from this),
        // then Better Auth's own tables.
        await db
            .deleteFrom("connected_accounts")
            .where("user_id", "=", userId)
            .execute();
        await db
            .deleteFrom("user_subscriptions")
            .where("user_id", "=", userId)
            .execute();
        await db
            .deleteFrom("user_settings")
            .where("user_id", "=", userId)
            .execute();
        // Better Auth tables (session → account → verification → user).
        // Deleting "user" cascades sudo_customers (ON DELETE CASCADE from user_id)
        // and user_funding_sources (ON DELETE CASCADE from user_id).
        await db.deleteFrom("session").where("userId", "=", userId).execute();
        await db.deleteFrom("account").where("userId", "=", userId).execute();
        await db
            .deleteFrom("verification")
            .where("identifier", "=", userId)
            .execute();
        await db.deleteFrom("user").where("id", "=", userId).execute();
    } catch (error) {
        console.error("Failed to delete account:", error);
        redirect("/login?error=delete_failed");
    }
    await auth.api.signOut({ headers: await headers() });
    redirect("/signup");
}
