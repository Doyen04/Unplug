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
import { providerLabel } from "@/lib/utils/provider";

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
                    asTable
                    tableHead={
                        <tr className="border-b border-border bg-bg-muted/40">
                            <th className="py-3 pl-6 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Merchant</th>
                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Date</th>
                            <th className="hidden lg:table-cell py-3 px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Category</th>
                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Type</th>
                            <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Amount</th>
                            <th className="py-3 pl-4 pr-6 sr-only">Action</th>
                        </tr>
                    }
                    renderItem={(tx: Transaction, i: number, viewMode?: 'table' | 'list') => (
                        <TransactionRow
                            key={tx.transaction_id}
                            transaction={tx}
                            currency={currencyForTransaction(tx)}
                            index={i}
                            viewMode={viewMode}
                        />
                    )}
                    showDivider
                    isLoading={isLoading || isFetching}
                    isError={isError}
                    onRetry={refetch}
                    errorTitle="Failed to load transactions"
                    errorMessage="There was a problem connecting to your bank feed."
                    emptyIcon={<Receipt size={32} />}
                    emptyTitle="No transactions found"
                    emptyMessage="Try a different search or date range."
                    header={
                        <div className="px-4 sm:px-6 py-3 border-b border-border bg-bg-muted/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            <span>{data?.total ?? 0} transactions</span>
                            <span>Page {data?.page ?? 1} / {data?.pageCount ?? 1}</span>
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
                <DataTable
                    data={cardTxs}
                    asTable
                    isLoading={cardTxLoading}
                    emptyIcon={<CreditCard size={32} />}
                    emptyTitle="No card transactions yet"
                    emptyMessage="Transactions will appear here once a virtual card is used."
                    header={
                        <div className="px-4 sm:px-6 py-3 border-b border-border bg-bg-muted/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            <span>{cardTxLoading ? 'Loading…' : `${cardTxs.length} card transactions`}</span>
                            <CreditCard size={14} className="text-brand" />
                        </div>
                    }
                    tableHead={
                        <tr className="border-b border-border bg-bg-muted/40">
                            <th className="py-3 pl-6 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Merchant</th>
                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Date</th>
                            <th className="hidden lg:table-cell py-3 px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Category</th>
                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Status</th>
                            <th className="py-3 px-4 pr-6 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Amount</th>
                        </tr>
                    }
                    renderItem={(tx: any, i: number, viewMode?: 'table' | 'list') => {
                        const statusColor: Record<string, string> = {
                            approved: 'text-success bg-success-light border-success/20',
                            pending: 'text-warning bg-warning-light border-warning/20',
                            declined: 'text-danger bg-danger-light border-danger/20',
                            failed: 'text-danger bg-danger-light border-danger/20',
                        };
                        const color = statusColor[tx.status] ?? 'text-text-secondary bg-bg-muted border-border';
                        const dateFormatted = tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                        const amountFormatted = `${tx.currency === 'NGN' ? '₦' : '$'}${((tx.amount_kobo ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                        if (viewMode === 'table') {
                            return (
                                <tr key={tx.id ?? i} className="group hover:bg-bg-muted/40 transition-colors">
                                    <td className="py-3.5 pl-6 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light">
                                                <CreditCard size={16} className="text-brand" />
                                            </div>
                                            <p className="truncate text-sm font-bold text-text-primary max-w-[180px]">
                                                {tx.merchant_name ?? tx.service_name ?? 'Virtual Card'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{dateFormatted}</span>
                                    </td>
                                    <td className="hidden lg:table-cell py-3.5 px-4">
                                        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider capitalize">{tx.merchant_category ?? '—'}</span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 pr-6 text-right tabular-nums">
                                        <span className="text-sm font-bold text-text-primary">{amountFormatted}</span>
                                    </td>
                                </tr>
                            );
                        }

                        return (
                            <div key={tx.id ?? i} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-bg-muted/40 active:bg-bg-muted/60 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light/80 text-brand shadow-xs border border-brand/10">
                                        <CreditCard size={18} className="text-brand" />
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="truncate text-sm font-bold text-text-primary">
                                            {tx.merchant_name ?? tx.service_name ?? 'Virtual Card'}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                            {dateFormatted}{tx.merchant_category && ` · ${tx.merchant_category}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 tabular-nums">
                                    <span className="text-sm font-bold text-text-primary">{amountFormatted}</span>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${color}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        );
                    }}
                />
            )}
        </div>
    );
}
