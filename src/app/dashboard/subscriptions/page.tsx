"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { SubscriptionRow } from "@/components/features/subscriptions/SubscriptionRow";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DASHBOARD_FILTER_OPTIONS } from "@/lib/constants/dashboard";
import type { DashboardProvider, Subscription } from "@/types/subscription";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { CreateCardModal } from "@/components/features/subscriptions/CreateCardModal";

const providerLabel = (provider: DashboardProvider): string =>
    provider === "plaid" ? "Plaid" : "Mono";

const currencyForSubscription = (subscriptionId: string): string =>
    subscriptionId.startsWith("mono-") ? "NGN" : "USD";

export default function SubscriptionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");

    const initialProviderParam = searchParams.get("provider");
    const initialProvider =
        initialProviderParam === "plaid" || initialProviderParam === "mono"
            ? initialProviderParam
            : undefined;
    const [selectedProvider, setSelectedProvider] = useState<
        DashboardProvider | undefined
    >(initialProvider);

    const {
        subscriptions,
        totalSubscriptions,
        isLoading,
        isError,
        isFetching,
        filter,
        setFilter,
        page,
        pageCount,
        setPage,
        refetch,
        cancelSubscription,
        undoCancel,
        clearPendingUndo,
        pendingUndoId,
        isCancelling,
        providers,
        filterCounts,
        setSearch: setHookSearch,
    } = useDashboardData({
        initialFilter: "all",
        initialPage: 1,
        pageSize: 20,
        includeDebrief: false,
        provider: selectedProvider,
    });

    useEffect(() => {
        const timeout = setTimeout(() => setHookSearch(search), 300);
        return () => clearTimeout(timeout);
    }, [search, setHookSearch]);

    useEffect(() => {
        if (
            selectedProvider &&
            !providers.connected.includes(selectedProvider)
        ) {
            setSelectedProvider(undefined);
        }
    }, [providers.connected, selectedProvider]);

    useEffect(() => {
        const currentProvider = searchParams.get("provider") || undefined;
        if (currentProvider === selectedProvider) return;

        const params = new URLSearchParams(searchParams.toString());
        if (selectedProvider) params.set("provider", selectedProvider);
        else params.delete("provider");
        router.replace(`/dashboard/subscriptions?${params.toString()}`, {
            scroll: false,
        });
    }, [selectedProvider, router]);

    useEffect(() => {
        if (!pendingUndoId) return;
        const timeoutId = setTimeout(() => clearPendingUndo(), 5000);
        return () => clearTimeout(timeoutId);
    }, [pendingUndoId, clearPendingUndo]);

    if (isLoading && subscriptions.length === 0)
        return (
            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-bg-muted rounded-pill animate-pulse" />
                        <div className="h-4 w-72 bg-bg-muted/60 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full sm:w-72 bg-bg-muted rounded-btn animate-pulse" />
                </header>
                <div className="h-8 w-48 bg-bg-muted rounded-pill animate-pulse" />
                <Card className="h-96 border-dashed bg-bg-surface/50 animate-pulse" />
            </div>
        );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        Subscriptions
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Live subscription data inferred from your connected
                        transaction feed.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72 h-10 group">
                        <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none z-10">
                            <Search
                                size={16}
                                className="text-text-muted transition-colors group-focus-within:text-brand"
                            />
                        </div>
                        <Input
                            value={search}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setSearch(e.target.value)}
                            placeholder="Search subscriptions"
                            className="pl-10 h-full w-full"
                        />
                    </div>
                    <CreateCardModal
                        onSuccess={() => {
                            void refetch();
                        }}
                    />
                </div>
            </header>

            {providers.hasBoth && (
                <div className="flex items-center gap-1 rounded-pill bg-bg-muted p-1 w-max">
                    <Button
                        variant={!selectedProvider ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            setSelectedProvider(undefined);
                            setPage(1);
                        }}
                        className="rounded-pill"
                    >
                        All
                    </Button>
                    {providers.connected.map((p: DashboardProvider) => (
                        <Button
                            key={p}
                            variant={
                                selectedProvider === p ? "primary" : "ghost"
                            }
                            size="sm"
                            onClick={() => {
                                setSelectedProvider(
                                    selectedProvider === p ? undefined : p,
                                );
                                setPage(1);
                            }}
                            className="rounded-pill"
                        >
                            {providerLabel(p)}
                        </Button>
                    ))}
                </div>
            )}

            <DataTable
                data={subscriptions}
                renderItem={(s: Subscription, i: number) => (
                    <SubscriptionRow
                        key={s.id}
                        subscription={s}
                        index={i}
                        currency={currencyForSubscription(s.id)}
                        onCancel={cancelSubscription}
                    />
                )}
                showDivider={false}
                itemsClassName="p-6 space-y-4"
                isLoading={isLoading || isFetching}
                isError={isError}
                onRetry={refetch}
                emptyTitle="No subscriptions found"
                emptyMessage="Try broadening your search or adjusting filters."
                emptyAction={
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSearch("");
                            setFilter("all");
                        }}
                    >
                        Clear all filters
                    </Button>
                }
                header={
                    <div className="border-b border-border bg-bg-muted/30 px-6 h-14 flex items-center">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden w-full">
                            {DASHBOARD_FILTER_OPTIONS.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => {
                                        setFilter(item.key);
                                        setPage(1);
                                    }}
                                    className={`h-8 rounded-pill px-4 flex shrink-0 items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        item.key === filter
                                            ? "bg-brand text-white shadow-md"
                                            : "bg-bg-muted text-text-secondary hover:bg-bg-subtle border border-border"
                                    }`}
                                >
                                    {item.label} ({filterCounts[item.key]})
                                </button>
                            ))}
                        </div>
                    </div>
                }
                pagination={{
                    page,
                    pageCount,
                    total: totalSubscriptions,
                    onPageChange: (p) => setPage(p),
                }}
            />

            <AnimatePresence>
                {pendingUndoId && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 20, x: "-50%" }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="fixed bottom-6 left-1/2 z-50"
                    >
                        <Card className="bg-text-primary text-white border-none shadow-2xl p-4 flex items-center gap-6">
                            <span className="text-sm">
                                Subscription cancelled.
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white text-text-primary border-none"
                                onClick={undoCancel}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <span className="animate-pulse">
                                        Undoing...
                                    </span>
                                ) : (
                                    "Undo"
                                )}
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
