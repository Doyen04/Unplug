'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Receipt, AlertTriangle, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

import { useDashboardData } from '@/hooks/useDashboardData';
import { formatCurrency } from '@/lib/utils/format';
import { providerCurrency } from '@/lib/utils/provider';
import type { DashboardProvider } from '@/types/subscription';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

const providerLabel = (provider: DashboardProvider): string =>
    provider === 'plaid' ? 'Plaid' : 'Mono';

interface PlaidTransaction {
    transaction_id: string;
    name: string;
    amount: number;
    date: string;
    merchant_name: string | null;
    iso_currency_code: string | null;
    category: string[] | null;
}

interface TransactionsResponse {
    provider: DashboardProvider;
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    transactions: PlaidTransaction[];
}

const fetchTransactions = async (
    days: number,
    page: number,
    pageSize: number,
    provider?: DashboardProvider
): Promise<TransactionsResponse> => {
    const params = new URLSearchParams({
        days: String(days),
        page: String(page),
        pageSize: String(pageSize),
    });
    if (provider) params.set('provider', provider);
    const response = await fetch(`/api/connect/plaid/transactions?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load transactions');
    return response.json();
};

export default function TransactionsPage() {
    const searchParams = useSearchParams();
    const [days, setDays] = useState(90);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const pageSize = 20;

    const initialProviderParam = searchParams.get('provider');
    const initialProvider = initialProviderParam === 'plaid' || initialProviderParam === 'mono' ? initialProviderParam : undefined;
    const [selectedProvider, setSelectedProvider] = useState<DashboardProvider | undefined>(initialProvider);

    const { providers, isLoading: isDashboardLoading } = useDashboardData({
        initialFilter: 'all', initialPage: 1, pageSize: 1, includeDebrief: false, provider: selectedProvider,
    });

    useEffect(() => {
        if (providers.connected.length === 0) {
            if (!isDashboardLoading && selectedProvider) setSelectedProvider(undefined);
            return;
        }
        if (!selectedProvider || !providers.connected.includes(selectedProvider)) {
            setSelectedProvider(providers.active ?? providers.connected[0]);
        }
    }, [isDashboardLoading, providers.active, providers.connected, selectedProvider]);

    useEffect(() => {
        const currentProviderParam = searchParams.get('provider');
        const currentProvider = currentProviderParam === 'plaid' || currentProviderParam === 'mono' ? currentProviderParam : undefined;
        if (currentProvider === selectedProvider) return;
        const params = new URLSearchParams(searchParams.toString());
        if (selectedProvider) params.set('provider', selectedProvider);
        else params.delete('provider');
        window.history.replaceState(null, '', `/dashboard/transactions?${params.toString()}`);
    }, [searchParams, selectedProvider]);

    const { data, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ['transactions-page', days, page, pageSize, selectedProvider ?? 'auto'],
        queryFn: () => fetchTransactions(days, page, pageSize, selectedProvider),
        retry: false,
        enabled: Boolean(selectedProvider),
    });

    const filteredTransactions = useMemo(() => {
        const list = data?.transactions ?? [];
        const normalized = search.trim().toLowerCase();
        if (!normalized) return list;
        return list.filter((item: PlaidTransaction) => {
            const merchant = (item.merchant_name ?? item.name).toLowerCase();
            const category = (item.category ?? []).join(' ').toLowerCase();
            return merchant.includes(normalized) || category.includes(normalized);
        });
    }, [data?.transactions, search]);

    if (isLoading) return (
        <div className="space-y-6 animate-shimmer">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2"><div className="h-8 w-48 bg-bg-muted rounded-pill" /><div className="h-4 w-72 bg-bg-muted/60 rounded" /></div>
                <div className="h-8 w-48 bg-bg-muted rounded-pill" />
            </header>
            <Card className="h-96 border-dashed bg-bg-surface/50" />
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Transactions</h1>
                    <p className="text-sm text-text-secondary">Real transaction feed from your linked bank account.</p>
                </div>
                <div className="flex items-center gap-2 bg-bg-muted p-1 rounded-pill">
                    {[30, 60, 90].map((window: number) => (
                        <Button
                            key={window}
                            variant={days === window ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => { setDays(window); setPage(1); }}
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
                            {providers.connected.map((p: DashboardProvider) => (
                                <Button
                                    key={p}
                                    variant={selectedProvider === p ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => { setSelectedProvider(p); setPage(1); }}
                                    className="rounded-pill"
                                >
                                    {providerLabel(p)}
                                </Button>
                            ))}
                        </div>
                    )}
                    {!providers.hasBoth && providers.active && (
                        <Badge variant="secondary">Using {providerLabel(providers.active)} data</Badge>
                    )}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-3 text-text-muted transition-colors group-focus-within:text-brand" />
                    <Input
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        placeholder="Search transactions"
                        className="pl-10"
                    />
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-bg-muted/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    <span>{data?.total ?? 0} transactions</span>
                    <span>Page {data?.page ?? 1} / {data?.pageCount ?? 1}</span>
                </div>

                {isError ? (
                    <div className="p-12 text-center">
                        <AlertTriangle size={32} className="mx-auto mb-4 text-danger opacity-20" />
                        <p className="font-semibold text-text-primary">Failed to load transactions</p>
                        <p className="text-sm text-text-secondary mt-1 mb-6">There was a problem connecting to your bank feed.</p>
                        <Button variant="secondary" onClick={() => refetch()} className="mx-auto">
                            <RefreshCcw size={14} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            Try again
                        </Button>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center text-text-secondary">
                        <Receipt size={32} className="mx-auto mb-4 opacity-20" />
                        <p className="font-semibold">No transactions found</p>
                        <p className="text-sm mt-1">Try a different search or date range.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredTransactions.map((transaction: PlaidTransaction) => (
                            <article key={transaction.transaction_id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-bg-base/50 transition-colors group">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-text-primary text-white">
                                        <Receipt size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-text-primary">
                                            {transaction.merchant_name ?? transaction.name}
                                        </p>
                                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                            {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {transaction.category?.length ? ` · ${transaction.category[0]}` : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right tabular-nums">
                                    <p className="text-sm font-bold text-text-primary">
                                        {formatCurrency(Math.abs(transaction.amount), transaction.iso_currency_code ?? providerCurrency(selectedProvider))}
                                    </p>
                                    <Badge variant={transaction.amount > 0 ? 'warning' : 'success'} className="mt-1">
                                        {transaction.amount > 0 ? 'Outflow' : 'Inflow'}
                                    </Badge>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!isLoading && !isError && (data?.pageCount ?? 1) > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-5 py-4 bg-bg-muted/30">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            Showing {(data!.page - 1) * data!.pageSize + 1}-{Math.min(data!.page * data!.pageSize, data!.total)} of {data!.total}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-9 w-9 rounded-full">
                                <ChevronLeft size={18} className="text-text-primary" />
                            </Button>
                            <Button variant="secondary" size="icon" onClick={() => setPage(p => Math.min(data!.pageCount, p + 1))} disabled={page >= data!.pageCount} className="h-9 w-9 rounded-full">
                                <ChevronRight size={18} className="text-text-primary" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
