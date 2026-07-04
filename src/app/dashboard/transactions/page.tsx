"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Search,
    Receipt,
    CreditCard,
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
    const [ledgerTab, setLedgerTab] = useState<'bank' | 'card'>('bank');
    const [cardTxs, setCardTxs] = useState<any[]>([]);
    const [cardTxLoading, setCardTxLoading] = useState(false);
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

    // Fetch card transactions when the card tab is selected
    useEffect(() => {
        if (ledgerTab !== 'card') return;
        setCardTxLoading(true);
        fetch('/api/cards/transactions')
            .then((r) => r.json())
            .then((d) => setCardTxs(d.transactions ?? []))
            .catch(() => toast.error('Could not load card transactions.'))
            .finally(() => setCardTxLoading(false));
    }, [ledgerTab]);

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
                        Bank feed and virtual card transactions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Tab switcher */}
                    <div className="flex items-center gap-1 bg-bg-muted p-1 rounded-pill">
                        <Button
                            variant={ledgerTab === 'bank' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setLedgerTab('bank')}
                            className="rounded-pill gap-1.5"
                        >
                            <Receipt size={14} /> Bank
                        </Button>
                        <Button
                            variant={ledgerTab === 'card' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setLedgerTab('card')}
                            className="rounded-pill gap-1.5"
                        >
                            <CreditCard size={14} /> Virtual Cards
                        </Button>
                    </div>
                    {/* Day range filter — only relevant for bank tab */}
                    {ledgerTab === 'bank' && [30, 60, 90].map((window: number) => (
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

            {ledgerTab === 'bank' && (
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
            )}

            {ledgerTab === 'bank' ? (
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
            ) : (
                /* Virtual Card Transactions */
                <Card className="overflow-hidden">
                    <div className="px-5 py-3 border-b border-border bg-bg-muted/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        <span>{cardTxLoading ? 'Loading…' : `${cardTxs.length} card transactions`}</span>
                        <CreditCard size={14} className="text-brand" />
                    </div>

                    {cardTxLoading ? (
                        <div className="divide-y divide-border">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between px-5 py-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-bg-muted" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-32 rounded bg-bg-muted" />
                                            <div className="h-2.5 w-20 rounded bg-bg-muted" />
                                        </div>
                                    </div>
                                    <div className="h-3 w-16 rounded bg-bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : cardTxs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
                            <CreditCard size={32} className="opacity-30" />
                            <p className="text-sm font-medium">No card transactions yet</p>
                            <p className="text-xs">Transactions will appear here once a virtual card is used.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {cardTxs.map((tx: any) => {
                                const statusColor: Record<string, string> = {
                                    approved: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                                    pending:  'text-amber-600  bg-amber-50  dark:bg-amber-900/20',
                                    declined: 'text-red-600    bg-red-50    dark:bg-red-900/20',
                                    failed:   'text-red-600    bg-red-50    dark:bg-red-900/20',
                                };
                                const color = statusColor[tx.status] ?? 'text-text-secondary bg-bg-muted';
                                return (
                                    <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light">
                                                <CreditCard size={16} className="text-brand" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-text-primary">
                                                    {tx.merchant_name ?? tx.service_name ?? 'Virtual Card'}
                                                </p>
                                                <p className="text-xs text-text-secondary">
                                                    {tx.merchant_category && <span className="mr-2 capitalize">{tx.merchant_category}</span>}
                                                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                                {tx.status}
                                            </span>
                                            <p className="font-mono text-sm font-semibold text-text-primary tabular-nums">
                                                {tx.currency === 'NGN' ? '₦' : '$'}{((tx.amount_kobo ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
