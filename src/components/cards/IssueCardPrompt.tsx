"use client";

import { useState } from "react";
import { CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface IssueCardPromptProps {
    subscriptionId: string;
    serviceName: string;
    onIssued: () => void;
    isPro: boolean;
}

export function IssueCardPrompt({
    subscriptionId,
    serviceName,
    onIssued,
    isPro,
}: IssueCardPromptProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleIssueCard() {
        if (!isPro) {
            // Redirect to upgrade page
            window.location.href = "/dashboard/billing";
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/cards/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? "Failed to request card");
            }
            toast.success(`${serviceName} card issued successfully.`);
            onIssued();
        } catch (err: any) {
            toast.error(err.message ?? "Could not issue card. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border border-dashed border-border-strong bg-bg-muted/60 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-surface ring-1 ring-border">
                <CreditCard className="h-5 w-5 text-text-secondary" />
            </div>

            <div>
                <p className="text-sm font-semibold text-text-primary">
                    No virtual card for {serviceName}
                </p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-text-secondary">
                    {isPro
                        ? "Get a dedicated card. Freeze it anytime to stop the next billing cycle."
                        : "Upgrade to Pro to get a virtual card for each subscription."}
                </p>
            </div>

            <button
                onClick={handleIssueCard}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-btn bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
                {isLoading ? (
                    <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Requesting...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-3.5 w-3.5" />
                        {isPro ? "Get virtual card" : "Upgrade to Pro"}
                    </>
                )}
            </button>
        </div>
    );
}
