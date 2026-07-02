"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SubscriptionCardPanel } from "@/components/subscriptions/SubscriptionCardPanel";

interface BillingSubscription {
    id: string;
    serviceName: string;
    amountMonthly: number;
    frequencyLabel: "monthly" | "weekly" | "yearly";
    status: string;
    confidence: string;
    usageScore: number;
    verdict: string;
    cardStatus?: string | null;
    cardId?: string | null;
    currency: string;
}

interface BillingPageClientProps {
    subscriptions: BillingSubscription[];
    isPro: boolean;
}

export default function BillingPageClient({
    subscriptions: initialSubscriptions,
    isPro,
}: BillingPageClientProps) {
    const [subs, setSubs] =
        useState<BillingSubscription[]>(initialSubscriptions);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedSub, setExpandedSub] = useState<string | null>(null);

    const totalMonthly = useMemo(
        () => subs.reduce((sum, sub) => sum + sub.amountMonthly, 0),
        [subs],
    );

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            const res = await fetch("/api/billing/initialize", {
                method: "POST",
            });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error ?? "Unable to start checkout.");
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
                return;
            }

            throw new Error("Checkout link was not returned.");
        } catch (error: any) {
            toast.error(error.message ?? "Unable to start checkout.");
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleGetVirtualCard = async (subscriptionId: string) => {
        if (!isPro) {
            window.location.href = "/dashboard/billing";
            return;
        }

        setActionLoading(subscriptionId);
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
            toast.success("Virtual card issued successfully.");
            setSubs((prev) =>
                prev.map((s) =>
                    s.id === subscriptionId
                        ? { ...s, cardStatus: "active" }
                        : s,
                ),
            );
        } catch (err: any) {
            toast.error(err.message ?? "Could not issue card. Try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleFreeze = async (
        subscriptionId: string,
        isFrozen: boolean,
    ) => {
        setActionLoading(subscriptionId);
        const action = isFrozen ? "unfreeze" : "freeze";
        try {
            const res = await fetch(`/api/cards/${subscriptionId}/freeze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            toast.success(
                action === "freeze"
                    ? "Card frozen — no charges will go through"
                    : "Card unfrozen",
            );
            setSubs((prev) =>
                prev.map((s) =>
                    s.id === subscriptionId
                        ? { ...s, cardStatus: data.status }
                        : s,
                ),
            );
        } catch {
            toast.error("Could not update card. Try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const protectedCount = subs.filter(
        (s) => s.cardStatus && s.cardStatus !== "closed",
    ).length;
    const unprotectedCount = subs.filter(
        (s) => !s.cardStatus || s.cardStatus === "closed",
    ).length;

    const percentProtected = useMemo(() => {
        const total = subs.length;
        return total > 0 ? Math.round((protectedCount / total) * 100) : 0;
    }, [subs.length, protectedCount]);

    return (
        <div className="max-w-[960px] mx-auto pt-6 px-6 max-sm:px-4 space-y-4">
            <header className="mb-5">
                <h1 className="text-[28px] font-semibold leading-tight text-[var(--color-text-primary)] font-display">
                    Billing & Cards
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-ui">
                    Manage billing and virtual cards.
                </p>
            </header>

            {/* Plan and Protection Grid */}
            <div className="font-ui">
                {isPro ? (
                    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-4">
                        {/* Plan Card (Pro) */}
                        <Card className="p-5 bg-[var(--color-brand-light)] border-[var(--color-brand)]/20 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div>
                                    <Badge
                                        variant="default"
                                        className="bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]"
                                    >
                                        Pro active
                                    </Badge>
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Current plan
                                    </h2>
                                    <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                                        You have access to virtual cards
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)]">
                                    Monthly spend
                                </span>
                                <span className="text-[36px] font-semibold leading-tight text-[var(--color-text-primary)] font-display tabular-nums">
                                    ₦
                                    {totalMonthly.toLocaleString("en-US", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    })}
                                </span>
                            </div>
                        </Card>

                        {/* Protection Card */}
                        <Card className="p-5 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex gap-4">
                                    <div>
                                        <div className="text-[20px] font-semibold text-[var(--color-brand)]">
                                            {protectedCount}
                                        </div>
                                        <div className="text-[12px] text-[var(--color-text-secondary)]">
                                            protected
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[20px] font-semibold text-[var(--color-text-secondary)]">
                                            {unprotectedCount}
                                        </div>
                                        <div className="text-[12px] text-[var(--color-text-secondary)]">
                                            unprotected
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-[6px] rounded-[var(--radius-pill)] bg-[var(--color-bg-muted)] overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--color-brand)] rounded-[var(--radius-pill)] transition-all duration-300"
                                        style={{
                                            width: `${percentProtected}%`,
                                        }}
                                    />
                                </div>

                                <p className="text-[13px] text-[var(--color-text-secondary)]">
                                    {percentProtected}% of spend protected
                                </p>
                            </div>
                            <div className="mt-4">
                                <Link
                                    href="/dashboard/subscriptions"
                                    className="text-xs font-semibold text-[var(--color-brand)] hover:underline inline-flex items-center gap-1"
                                >
                                    View all subscriptions &rarr;
                                </Link>
                            </div>
                        </Card>
                    </div>
                ) : (
                    /* Plan Card (Free - Full Width) */
                    <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                Upgrade to Pro
                            </h2>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
                                Upgrade to Pro to issue dedicated virtual cards
                                for your subscriptions and keep every renewal
                                protected.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                            className="shrink-0"
                        >
                            {isUpgrading
                                ? "Starting checkout…"
                                : "Upgrade to Pro"}
                        </Button>
                    </Card>
                )}
            </div>

            {/* Subscriptions ready for cards */}
            <Card className="p-5 font-ui">
                <div className="flex justify-between items-start gap-4 mb-3.5">
                    <div>
                        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                            Subscriptions ready for cards
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            Issue a dedicated card or review the current setup
                            for each service.
                        </p>
                    </div>
                </div>

                {subs.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--color-text-secondary)]">
                        No subscriptions are available yet. Connect your
                        accounts to start managing billing and card coverage.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--color-border)]/30">
                        {subs.map((sub) => {
                            const isFrozen = sub.cardStatus === "inactive";
                            const isExpanded = expandedSub === sub.id;
                            return (
                                <div
                                    key={sub.id}
                                    className="border-b border-[var(--color-border)]/20 last:border-b-0"
                                >
                                    {/* Desktop View */}
                                    <div
                                        onClick={() =>
                                            setExpandedSub(
                                                isExpanded ? null : sub.id,
                                            )
                                        }
                                        className="hidden sm:grid grid-cols-[minmax(140px,2fr)_100px_90px_120px] items-center gap-3 py-3.5 cursor-pointer hover:bg-[var(--color-bg-muted)]/20 px-2 rounded-lg transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                                {sub.serviceName}
                                                <span className="text-[10px] text-[var(--color-text-muted)] font-normal border border-[var(--color-border)] px-1.5 py-0.5 rounded-md bg-[var(--color-bg-base)]">
                                                    {isExpanded
                                                        ? "Hide Card"
                                                        : "View Card"}
                                                </span>
                                            </span>
                                            <span className="text-[12px] text-[var(--color-text-secondary)]">
                                                monthly
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-right tabular-nums text-[var(--color-text-primary)]">
                                            {sub.currency === "USD" ? "$" : "₦"}
                                            {sub.amountMonthly.toFixed(2)}
                                        </div>
                                        <div>
                                            {sub.cardStatus &&
                                            sub.cardStatus !== "closed" ? (
                                                <Badge
                                                    variant={
                                                        isFrozen
                                                            ? "secondary"
                                                            : "success"
                                                    }
                                                >
                                                    {isFrozen
                                                        ? "Frozen"
                                                        : "Active"}
                                                </Badge>
                                            ) : null}
                                        </div>
                                        <div className="text-right">
                                            {sub.cardStatus &&
                                            sub.cardStatus !== "closed" ? (
                                                isPro ? (
                                                    <Button
                                                        size="sm"
                                                        disabled={
                                                            actionLoading ===
                                                            sub.id
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleFreeze(
                                                                sub.id,
                                                                isFrozen,
                                                            );
                                                        }}
                                                        className="w-full text-xs h-[30px] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]"
                                                    >
                                                        {actionLoading ===
                                                        sub.id
                                                            ? isFrozen
                                                                ? "..."
                                                                : "..."
                                                            : isFrozen
                                                              ? "Unfreeze"
                                                              : "Freeze"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        disabled={isUpgrading}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUpgrade();
                                                        }}
                                                        className="w-full text-xs h-[30px]"
                                                    >
                                                        {isUpgrading
                                                            ? "..."
                                                            : "Upgrade to manage"}
                                                    </Button>
                                                )
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={
                                                        actionLoading === sub.id
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleGetVirtualCard(
                                                            sub.id,
                                                        );
                                                    }}
                                                    className="w-full text-xs h-[30px]"
                                                >
                                                    {actionLoading === sub.id
                                                        ? "..."
                                                        : "Get card"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div
                                        onClick={() =>
                                            setExpandedSub(
                                                isExpanded ? null : sub.id,
                                            )
                                        }
                                        className="flex sm:hidden flex-col gap-2 py-3.5 cursor-pointer hover:bg-[var(--color-bg-muted)]/20 px-2 rounded-lg transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                                    {sub.serviceName}
                                                    <span className="text-[10px] text-[var(--color-text-muted)] font-normal border border-[var(--color-border)] px-1 rounded-md bg-[var(--color-bg-base)]">
                                                        {isExpanded
                                                            ? "Hide"
                                                            : "View"}
                                                    </span>
                                                </span>
                                                <span className="text-[12px] text-[var(--color-text-secondary)]">
                                                    monthly
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium tabular-nums text-[var(--color-text-primary)]">
                                                {sub.currency === "USD"
                                                    ? "$"
                                                    : "₦"}
                                                {sub.amountMonthly.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                {sub.cardStatus &&
                                                sub.cardStatus !== "closed" ? (
                                                    <Badge
                                                        variant={
                                                            isFrozen
                                                                ? "secondary"
                                                                : "success"
                                                        }
                                                    >
                                                        {isFrozen
                                                            ? "Frozen"
                                                            : "Active"}
                                                    </Badge>
                                                ) : (
                                                    <div />
                                                )}
                                            </div>
                                            <div>
                                                {sub.cardStatus &&
                                                sub.cardStatus !== "closed" ? (
                                                    isPro ? (
                                                        <Button
                                                            size="sm"
                                                            disabled={
                                                                actionLoading ===
                                                                sub.id
                                                            }
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleFreeze(
                                                                    sub.id,
                                                                    isFrozen,
                                                                );
                                                            }}
                                                            className="text-xs h-[30px] px-3 border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]"
                                                        >
                                                            {actionLoading ===
                                                            sub.id
                                                                ? "..."
                                                                : isFrozen
                                                                  ? "Unfreeze"
                                                                  : "Freeze"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            disabled={
                                                                isUpgrading
                                                            }
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpgrade();
                                                            }}
                                                            className="text-xs h-[30px] px-3"
                                                        >
                                                            {isUpgrading
                                                                ? "..."
                                                                : "Upgrade"}
                                                        </Button>
                                                    )
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        disabled={
                                                            actionLoading ===
                                                            sub.id
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleGetVirtualCard(
                                                                sub.id,
                                                            );
                                                        }}
                                                        className="text-xs h-[30px] px-3"
                                                    >
                                                        {actionLoading ===
                                                        sub.id
                                                            ? "..."
                                                            : "Get card"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Virtual Card Details (SubscriptionCardPanel) */}
                                    {isExpanded && (
                                        <div className="p-4 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)] rounded-b-lg mb-3 mt-1">
                                            <SubscriptionCardPanel
                                                subscriptionId={sub.id}
                                                serviceName={sub.serviceName}
                                                isPro={isPro}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
