'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, AlertTriangle, RefreshCcw } from 'lucide-react';

import { SubscriptionRow } from '../../../components/features/subscriptions/SubscriptionRow';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { DASHBOARD_FILTER_OPTIONS } from '../../../lib/constants/dashboard';
import { providerCurrency } from '../../../lib/utils/provider';
import type { DashboardProvider } from '../../../types/subscription';

import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';

const providerLabel = (provider: DashboardProvider): string =>
    provider === 'plaid' ? 'Plaid' : 'Mono';

export default function SubscriptionsPage() {
    const searchParams = useSearchParams();
    const [search, setSearch] = useState('');

    const initialProviderParam = searchParams.get('provider');
    const initialProvider =
        initialProviderParam === 'plaid' || initialProviderParam === 'mono'
            ? initialProviderParam
            : undefined;
    const [selectedProvider, setSelectedProvider] = useState<DashboardProvider | undefined>(initialProvider);

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
    } = useDashboardData({
        initialFilter: 'all',
        initialPage: 1,
        pageSize: 20,
        includeDebrief: false,
        provider: selectedProvider,
    });

    const currency = providerCurrency(providers.active);

    useEffect(() => {
        if (providers.connected.length === 0) {
            if (!isLoading && selectedProvider) {
                setSelectedProvider(undefined);
            }
            return;
        }
        if (!selectedProvider || !providers.connected.includes(selectedProvider)) {
            setSelectedProvider(providers.active ?? providers.connected[0]);
        }
    }, [isLoading, providers.active, providers.connected, selectedProvider]);

    useEffect(() => {
        const currentProviderParam = searchParams.get('provider');
        const currentProvider = currentProviderParam === 'plaid' || currentProviderParam === 'mono' ? currentProviderParam : undefined;
        if (currentProvider === selectedProvider) return;

        const params = new URLSearchParams(searchParams.toString());
        if (selectedProvider) params.set('provider', selectedProvider);
        else params.delete('provider');

        window.history.replaceState(null, '', `/dashboard/subscriptions?${params.toString()}`);
    }, [searchParams, selectedProvider]);

    useEffect(() => {
        if (!pendingUndoId) return;
        const timeoutId = setTimeout(() => clearPendingUndo(), 5000);
        return () => clearTimeout(timeoutId);
    }, [pendingUndoId, clearPendingUndo]);

    const filteredBySearch = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) return subscriptions;
        return subscriptions.filter((item) => item.serviceName.toLowerCase().includes(normalizedSearch));
    }, [subscriptions, search]);

    if (isLoading) return (
        <div className="space-y-6 animate-shimmer">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-bg-muted rounded-pill" />
                    <div className="h-4 w-72 bg-bg-muted/60 rounded" />
                </div>
                <div className="h-10 w-full sm:w-72 bg-bg-muted rounded-btn" />
            </header>
            <div className="h-8 w-48 bg-bg-muted rounded-pill" />
            <Card className="h-96 border-dashed bg-bg-surface/50" />
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Subscriptions</h1>
                    <p className="text-sm text-text-secondary">Live subscription data inferred from your connected transaction feed.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-3 text-text-muted transition-colors group-focus-within:text-brand" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search subscriptions"
                        className="pl-10"
                    />
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-4">
                {providers.hasBoth && (
                    <div className="flex items-center gap-1 rounded-pill bg-bg-muted p-1 w-max">
                        {providers.connected.map((p) => (
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
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {DASHBOARD_FILTER_OPTIONS.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => { setFilter(item.key); setPage(1); }}
                            className={`rounded-pill px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${item.key === filter
                                ? 'bg-brand text-white shadow-md'
                                : 'bg-bg-muted text-text-secondary hover:bg-bg-subtle border border-border'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-6">
                {isError && (
                    <Badge variant="warning" className="w-full justify-center py-2 mb-4 h-auto">
                      Live refresh failed. Showing cached data.
                      <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-4 h-8 bg-white/20 hover:bg-white/40">
                        <RefreshCcw size={12} className={isFetching ? 'animate-spin' : ''} />
                      </Button>
                    </Badge>
                )}

                {filteredBySearch.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
                        <AlertTriangle size={32} className="mx-auto mb-4 opacity-20" />
                        <p className="font-semibold">No subscriptions found</p>
                        <p className="text-sm mt-1 mb-6">Try broadening your search or adjusting filters.</p>
                        <Button variant="secondary" onClick={() => { setSearch(''); setFilter('all'); }}>Clear all filters</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBySearch.map((s, i) => (
                            <SubscriptionRow key={s.id} subscription={s} index={i} currency={currency} onCancel={cancelSubscription} />
                        ))}
                    </div>
                )}
                </div>

                {totalSubscriptions > 0 && pageCount > 1 && (
                    <div className="flex items-center justify-between p-6 border-t border-border bg-bg-muted/30">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            Page {page} / {pageCount} · {totalSubscriptions} total
                        </span>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>Prev</Button>
                            <Button variant="secondary" size="sm" onClick={() => setPage(page + 1)} disabled={page >= pageCount}>Next</Button>
                        </div>
                    </div>
                )}
            </Card>

            {pendingUndoId && (
                <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white border-none shadow-2xl p-4 flex items-center gap-6 z-50">
                   <span className="text-sm">Subscription cancelled.</span>
                   <Button variant="secondary" size="sm" className="bg-white text-text-primary border-none" onClick={undoCancel} disabled={isCancelling}>Undo</Button>
                </Card>
            )}
        </div>
    );
}
