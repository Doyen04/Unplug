"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function OnboardingClient() {
    const [isPending, startTransition] = useTransition();

    const handleContinue = () => {
        startTransition(async () => {
            try {
                const res = await fetch("/api/user/settings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ onboarding_completed: true }),
                });

                if (res.ok) {
                    // Hard-navigate so the server-side dashboard layout re-runs its
                    // DB check fresh and doesn't redirect back to /onboarding.
                    window.location.href = "/dashboard/connect";
                } else if (res.status === 401) {
                    window.location.href = "/login";
                } else {
                    toast.error("Could not start your audit. Try again.");
                }
            } catch (error) {
                console.error("Failed to complete onboarding:", error);
                toast.error("Could not start your audit. Try again.");
            }
        });
    };

    return (
        <main className="relative flex h-screen w-screen overflow-hidden items-center justify-center p-4 bg-linear-to-b from-bg-base via-bg-base to-brand-light/10">
            {/* Ambient background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
                <Card className="p-8 border border-border bg-bg-surface/85 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
                    {/* Welcome Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light border border-brand/20 text-brand text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Welcome to Unplug
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-3">
                        Stop paying for
                        <br />
                        <span className="text-brand">forgotten services</span>
                    </h1>

                    {/* Value Prop */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-6">
                        The average person wastes{" "}
                        <span className="font-semibold text-brand">
                            $156/month
                        </span>{" "}
                        on forgotten subscriptions. Unplug analyzes your
                        spending to identify unused accounts and money you can
                        reclaim.
                    </p>

                    {/* CTAs */}
                    <Button
                        onClick={handleContinue}
                        disabled={isPending}
                        className="w-full h-12 rounded-xl shadow-lg shadow-brand/10 gap-2 text-xs font-bold uppercase tracking-wider mb-4 transition-transform active:scale-[0.98]"
                    >
                        {isPending ? "Starting..." : "Start Your Audit"}
                        <ArrowRight className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <ShieldCheck className="w-4 h-4 text-brand" />
                        Secure bank-level data encryption
                    </div>
                </Card>
            </div>
        </main>
    );
}
