/**
 * POST /api/cards/[subscriptionId]/freeze
 *
 * Freezes or unfreezes a virtual card instantly by updating its status in Sudo Africa.
 *
 * WHY USERS FREEZE CARDS:
 *  - Pause a subscription for a month (frozen card → Sudo declines the charge → subscription lapses)
 *  - Protect against a compromised card number while staying in control
 *  - "Try before you cancel" — freeze instead of cancelling to see if they miss the service
 *
 * STATUS MAPPING:
 *  - action = 'freeze'   → Sudo status: 'inactive'  (all charges declined)
 *  - action = 'unfreeze' → Sudo status: 'active'    (charges allowed again)
 *
 * UPDATE ORDER — always Sudo first, then our DB:
 * Sudo is the source of truth for card status. If we update our DB first and the
 * Sudo call fails, our DB would say "inactive" but Sudo would still be "active",
 * meaning the card accepts charges despite appearing frozen in the UI.
 * Updating Sudo first prevents this inconsistency.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server/db";
import { setCardStatus } from "@/lib/sudo/freeze-cards";

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params:
            Promise<{ subscriptionId: string }> | { subscriptionId: string };
    },
) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { subscriptionId } = resolvedParams;

    const { action } = await req.json();
    if (action !== "freeze" && action !== "unfreeze") {
        return NextResponse.json(
            { error: "action must be freeze or unfreeze" },
            { status: 400 },
        );
    }

    // Ownership check: JOIN ensures the card belongs to the requesting user
    const card = await db
        .selectFrom("subscription_cards as sc")
        .innerJoin("user_subscriptions as s", "s.id", "sc.subscription_id")
        .select(["sc.id", "sc.sudo_card_id", "sc.status"])
        .where("sc.subscription_id", "=", subscriptionId)
        .where("s.user_id", "=", session.user.id)
        .executeTakeFirst();

    if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const newStatus = action === "freeze" ? "inactive" : "active";

    // Shared helper: updates Sudo Africa first (source of truth), then mirrors
    // the new status in our local DB.
    await setCardStatus(card.id, card.sudo_card_id, newStatus);

    return NextResponse.json({ status: newStatus });
}
