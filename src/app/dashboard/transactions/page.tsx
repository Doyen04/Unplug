"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Search,
    Receipt,
    AlertTriangle,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/lib/utils/format";
import type { DashboardProvider } from "@/types/subscription";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import { TransactionRow } from "@/components/features/transactions/TransactionRow";
import type { Transaction } from "@/lib/client/dashboard-api";

const providerLabel = (provider: DashboardProvider): string =>
    provider === "plaid" ? "Plaid" : "Mono";

const currencyForTransaction = (transaction: Transaction): string =>
    transaction.iso_currency_code ??
    (transaction.transaction_id.startsWith("mono-") ? "NGN" : "USD");

interface TransactionsResponse {
    provider: DashboardProvider | "all";
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    transactions: Transaction[];
}

const fetchTransactions = async (
    days: number,
    page: number,
    pageSize: number,
    provider?: DashboardProvider,
    search?: string,
): Promise<TransactionsResponse> => {
    const params = new URLSearchParams({
        days: String(days),
        page: String(page),
        pageSize: String(pageSize),
    });
    if (provider) params.set("provider", provider);
    if (search) params.set("q", search);
    const response = await fetch(
        `/api/connect/plaid/transactions?${params.toString()}`,
        { cache: "no-store" },
    );
    if (!response.ok) throw new Error("Failed to load transactions");
    return response.json();
};

export default function TransactionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [days, setDays] = useState(90);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const pageSize = 20;

    const initialProviderParam = searchParams.get("provider");
    const initialProvider =
        initialProviderParam === "plaid" || initialProviderParam === "mono"
            ? initialProviderParam
            : undefined;
    const [selectedProvider, setSelectedProvider] = useState<
        DashboardProvider | undefined
    >(initialProvider);

    const { providers, isLoading: isDashboardLoading } = useDashboardData({
        initialFilter: "all",
        initialPage: 1,
        pageSize: 1,
        includeDebrief: false,
        provider: selectedProvider,
    });

    useEffect(() => {
        if (
            selectedProvider &&
            !providers.connected.includes(selectedProvider)
        ) {
            setSelectedProvider(undefined);
        }
    }, [providers.connected, selectedProvider]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        const currentProvider = searchParams.get("provider") || undefined;
        if (currentProvider === selectedProvider) return;

        const params = new URLSearchParams(searchParams.toString());
        if (selectedProvider) params.set("provider", selectedProvider);
        else params.delete("provider");
        router.replace(`/dashboard/transactions?${params.toString()}`, {
            scroll: false,
        });
    }, [selectedProvider, router]);

    const { data, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: [
            "transactions-page",
            days,
            page,
            pageSize,
            selectedProvider ?? "all",
            debouncedSearch,
        ],
        queryFn: () =>
            fetchTransactions(
                days,
                page,
                pageSize,
                selectedProvider,
                debouncedSearch,
            ),
        retry: false,
        enabled: providers.connected.length > 0,
    });

    useEffect(() => {
        if (isError) {
            toast.error("Could not load transactions. Try again.");
        }
    }, [isError]);

    if (isDashboardLoading && !selectedProvider)
        return (
            <div className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-bg-muted rounded-pill animate-pulse" />
                        <div className="h-4 w-72 bg-bg-muted/60 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-48 bg-bg-muted rounded-pill animate-pulse" />
                </header>
                <Card className="h-96 border-dashed bg-bg-surface/50 animate-pulse" />
            </div>
        );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        Transactions
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Real transaction feed from your linked bank account.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-bg-muted p-1 rounded-pill">
                    {[30, 60, 90].map((window: number) => (
                        <Button
                            key={window}
                            variant={days === window ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setDays(window);
                                setPage(1);
                            }}
                            className="rounded-pill px-4"
                        >
                            {window}d
                        </Button>
                    ))}
                </div>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {providers.hasBoth && (
                        <div className="flex items-center gap-1 rounded-pill bg-bg-muted p-1">
                            <Button
                                variant={
                                    !selectedProvider ? "primary" : "ghost"
                                }
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
                                        selectedProvider === p
                                            ? "primary"
                                            : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => {
                                        setSelectedProvider(
                                            selectedProvider === p
                                                ? undefined
                                                : p,
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
                    {!providers.hasBoth && providers.active && (
                        <Badge variant="secondary">
                            Using {providerLabel(providers.active)} data
                        </Badge>
                    )}
                </div>

                <div className="relative w-full sm:w-72 h-10 group">
                    <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none z-10">
                        <Search
                            size={16}
                            className="text-text-muted transition-colors group-focus-within:text-brand"
                        />
                    </div>
                    <Input
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search transactions"
                        className="pl-10 h-full w-full"
                    />
                </div>
            </div>

            <DataTable
                data={data?.transactions ?? []}
                renderItem={(tx: Transaction, i: number) => (
                    <TransactionRow
                        key={tx.transaction_id}
                        transaction={tx}
                        currency={currencyForTransaction(tx)}
                        index={i}
                    />
                )}
                isLoading={isLoading || isFetching}
                isError={isError}
                onRetry={refetch}
                errorTitle="Failed to load transactions"
                errorMessage="There was a problem connecting to your bank feed."
                emptyIcon={<Receipt size={32} />}
                emptyTitle="No transactions found"
                emptyMessage="Try a different search or date range."
                header={
                    <div className="px-5 py-3 border-b border-border bg-bg-muted/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <span>{data?.total ?? 0} transactions</span>
                        <span>
                            Page {data?.page ?? 1} / {data?.pageCount ?? 1}
                        </span>
                    </div>
                }
                pagination={{
                    page: data?.page ?? 1,
                    pageCount: data?.pageCount ?? 1,
                    total: data?.total ?? 0,
                    pageSize: data?.pageSize ?? 20,
                    onPageChange: (p) => setPage(p),
                }}
            />
        </div>
    );
}
