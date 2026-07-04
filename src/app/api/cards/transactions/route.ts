import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server/db";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200", 10), 500);

    const transactions = await db
        .selectFrom("card_transactions as ct")
        .innerJoin("subscription_cards as sc", "sc.sudo_card_id", "ct.sudo_card_id")
        .innerJoin("user_subscriptions as us", "us.id", "sc.subscription_id")
        .select([
            "ct.id",
            "ct.sudo_card_id",
            "ct.subscription_id",
            "ct.sudo_transaction_id",
            "ct.type",
            "ct.status",
            "ct.amount_kobo",
            "ct.currency",
            "ct.merchant_name",
            "ct.merchant_category",
            "ct.channel",
            "ct.created_at",
            "us.service_name",
        ])
        .where("us.user_id", "=", session.user.id)
        .orderBy("ct.created_at", "desc")
        .limit(limit)
        .execute();

    return NextResponse.json({
        transactions: transactions.map((tx) => ({
            id: tx.id,
            sudo_card_id: tx.sudo_card_id,
            subscription_id: tx.subscription_id,
            sudo_transaction_id: tx.sudo_transaction_id,
            type: tx.type,
            status: tx.status,
            amount_kobo: Number(tx.amount_kobo),
            currency: tx.currency,
            merchant_name: tx.merchant_name,
            merchant_category: tx.merchant_category,
            channel: tx.channel,
            service_name: tx.service_name,
            created_at: tx.created_at instanceof Date
                ? tx.created_at.toISOString()
                : tx.created_at,
        })),
    });
}
