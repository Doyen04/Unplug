/**
 * PUT /api/cards/[subscriptionId]/pin
 *
 * Changes the PIN for a virtual card using the Sudo Africa pin endpoint.
 * This matches the curl request:
 *   PUT https://api.sandbox.sudo.cards/cards/{id}/pin
 *   { oldPin, newPin }
 *
 * SECURITY:
 *  - Must be authenticated
 *  - Must own the subscription
 *  - Must still be a Pro user with access to virtual cards
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server/db";
import { isProUser } from "@/lib/server/plan";
import { changeSudoCardPin } from "@/lib/sudo/client";

export async function PUT(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ subscriptionId: string }> | { subscriptionId: string };
    },
) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isProUser(session.user.id))) {
        return NextResponse.json(
            { error: "Virtual cards require a Pro plan" },
            { status: 403 },
        );
    }

    const { subscriptionId } = await params;
    const body = await req.json().catch(() => ({}));
    const { oldPin, newPin } = body as { oldPin?: string; newPin?: string };

    if (!oldPin || !newPin) {
        return NextResponse.json(
            { error: "oldPin and newPin are required" },
            { status: 400 },
        );
    }

    const card = await db
        .selectFrom("subscription_cards as sc")
        .innerJoin("user_subscriptions as s", "s.id", "sc.subscription_id")
        .select(["sc.id", "sc.sudo_card_id"])
        .where("sc.subscription_id", "=", subscriptionId)
        .where("s.user_id", "=", session.user.id)
        .executeTakeFirst();

    if (!card || !card.sudo_card_id) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    try {
        await changeSudoCardPin(card.sudo_card_id, { oldPin, newPin });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[cards/pin] Sudo pin change failed:", error);
        return NextResponse.json(
            { error: error.message ?? "Failed to change PIN" },
            { status: 502 },
        );
    }
}
