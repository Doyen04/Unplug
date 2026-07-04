import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server/db";
import { sql } from "kysely";

/**
 * GET /api/user/wallet
 *
 * Returns the user's available wallet balance.
 *
 * HOW BALANCE IS CALCULATED:
 * Unplug doesn't hold a separate wallet ledger table. Instead:
 *   - `user.wallet_credit_kobo` stores admin-credited / top-up funds.
 *   - `card_transactions` records every approved virtual card charge against
 *     the user's subscriptions.
 *
 * Available balance = credits - total spend from approved card transactions.
 *
 * Note: Only "approved" transactions are counted as spent. Declined/failed
 * authorizations are not deducted so the displayed balance stays accurate.
 */
export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch the user's credited funds
    const user = await db
        .selectFrom("user")
        .select(["wallet_credit_kobo"])
        .where("id", "=", session.user.id)
        .executeTakeFirst();

    const creditKobo = Number(user?.wallet_credit_kobo ?? 0);

    // 2. Sum all approved virtual card charges for this user
    const spendRow = await db
        .selectFrom("card_transactions as ct")
        .innerJoin("subscription_cards as sc", "sc.sudo_card_id", "ct.sudo_card_id")
        .innerJoin("user_subscriptions as us", "us.id", "sc.subscription_id")
        .select(sql<string>`COALESCE(SUM(ct.amount_kobo), 0)`.as("total_spent_kobo"))
        .where("us.user_id", "=", session.user.id)
        .where("ct.status", "=", "approved")
        .executeTakeFirst();

    const spentKobo = Number(spendRow?.total_spent_kobo ?? 0);
    const balanceKobo = Math.max(0, creditKobo - spentKobo);

    return NextResponse.json({
        wallet: {
            creditKobo,
            spentKobo,
            balanceKobo,
            balanceLabel: `₦${(balanceKobo / 100).toLocaleString("en-US")}`,
        },
    });
}
