"use client";

/**
 * SubscriptionCardPanel
 *
 * The entry point for the virtual card UI on each subscription detail view.
 *
 * This component handles the full card lifecycle in one place:
 *  1. Loading: Shows a skeleton while checking if a card exists.
 *  2. No card: Renders IssueCardPrompt (with Pro upgrade gate if needed).
 *  3. Has card: Renders the VirtualCard component with freeze/reveal controls.
 *
 * POLLING AFTER ISSUANCE:
 * When a user requests a card, the API issues it directly and returns once the
 * card is created. IssueCardPrompt calls onIssued() immediately to refresh the
 * card state without waiting for a background worker.
 *
 * STATE MACHINE:
 *   loading → no-card → [user requests card] → loading → has-card
 *         └──────────────────────────────────────────────────────┘
 *                           (on card status change, re-fetch)
 *
 * PROPS:
 *  - subscriptionId: The user_subscriptions.id — used to query the right card.
 *  - serviceName:    Display name (e.g. "Netflix") — shown on the card face.
 *  - isPro:          Whether user is on Pro plan — gates both viewing an existing
 *                    card and issuing a new one. If a user cancels Pro, this flips
 *                    to false and they fall back to the upgrade prompt instead of
 *                    ever seeing their (still-existing) card details.
 */

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { VirtualCard } from "@/components/cards/VirtualCard";
import { IssueCardPrompt } from "@/components/cards/IssueCardPrompt";
import { useState } from "react";

interface SubscriptionCardPanelProps {
    subscriptionId: string;
    serviceName: string;
    isPro: boolean;
    onCardStateChange?: (
        subscriptionId: string,
        cardStatus: string | null,
    ) => void;
}

type CardState =
    | { state: "loading" }
    | { state: "no-card" }
    | { state: "has-card"; card: any }; // card shape matches GET /api/cards/[subscriptionId] response

export function SubscriptionCardPanel({
    subscriptionId,
    serviceName,
    isPro,
    onCardStateChange,
}: SubscriptionCardPanelProps) {
    const [cardState, setCardState] = useState<CardState>({ state: "loading" });


    /**
     * Fetches the current card state from the API.
     * - 404 → card doesn't exist yet (no-card state)
     * - 200 → card found (has-card state)
     * - network error → fall back to no-card to avoid a broken loading spinner
     *
     * Wrapped in useCallback so it can be passed as `onIssued` to IssueCardPrompt
     * without causing infinite re-renders in the useEffect dependency array.
     */
    const fetchCard = useCallback(async () => {
        // Non-Pro users (including those who have since cancelled) must never see or
        // create a card, so skip the fetch entirely and fall back to the upgrade prompt.
        if (!isPro) {
            setCardState({ state: "no-card" });
            return;
        }

        setCardState({ state: "loading" });
        try {
            const res = await fetch(`/api/cards/${subscriptionId}`);
            if (res.status === 404 || res.status === 403) {
                setCardState({ state: "no-card" });
            } else if (res.ok) {
                const data = await res.json();
                setCardState({ state: "has-card", card: data.card });
            } else {
                toast.error("Could not load your virtual card. Try again.");
                setCardState({ state: "no-card" });
            }
        } catch {
            toast.error("Could not load your virtual card. Try again.");
            setCardState({ state: "no-card" });
        }
    }, [subscriptionId, isPro]);

    // Fetch on mount and whenever subscriptionId changes (user navigated to a different subscription)
    useEffect(() => {
        fetchCard();
    }, [fetchCard]);

    // Skeleton placeholder — matches the approximate aspect ratio of the VirtualCard face
    if (cardState.state === "loading") {
        return (
            <div className="mx-auto w-full max-w-sm animate-pulse space-y-3">
                <div className="aspect-[1.586/1] w-full rounded-2xl bg-bg-muted" />
                <div className="h-10 w-full rounded-btn bg-bg-muted" />
            </div>
        );
    }

    if (cardState.state === "no-card") {
        return (
            <IssueCardPrompt
                subscriptionId={subscriptionId}
                serviceName={serviceName}
                onIssued={() => {
                    onCardStateChange?.(subscriptionId, "active");
                    fetchCard();
                }}
                isPro={isPro}
            />
        );
    }

    return (
        <div className="space-y-3">
            <VirtualCard
                subscriptionId={subscriptionId}
                serviceName={serviceName}
                card={cardState.card}
                onStatusChange={(newStatus) => {
                    onCardStateChange?.(subscriptionId, newStatus);
                    setCardState((prev) =>
                        prev.state === "has-card"
                            ? { ...prev, card: { ...prev.card, status: newStatus } }
                            : prev,
                    );
                }}
            />
        </div>
    );
}
