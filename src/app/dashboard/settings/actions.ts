"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/auth-session";
import { auth } from "@/lib/auth";

import { cancelPaystackSubscriptionForUser } from "@/lib/paystack";
import { freezeAllCardsForUser } from "@/lib/sudo/freeze-cards";

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
        // Delete app-level data first (FK children), then Better Auth's own tables.
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

        // Better Auth tables (session → account → verification → user)
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
