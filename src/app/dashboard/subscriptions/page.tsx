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
        const currentProvider =
            currentProviderParam === 'plaid' || currentProviderParam === 'mono'
                ? currentProviderParam
                : undefined;

        if (currentProvider === selectedProvider) return;

        const params = new URLSearchParams(searchParams.toString());
        if (selectedProvider) {
            params.set('provider', selectedProvider);
        } else {
            params.delete('provider');
        }

        window.history.replaceState(null, '', `/dashboard/subscriptions?${params.toString()}`);
    }, [searchParams, selectedProvider]);

    useEffect(() => {
        if (!pendingUndoId) return;
        const timeoutId = setTimeout(() => {
            clearPendingUndo();
        }, 5000);
        return () => clearTimeout(timeoutId);
    }, [pendingUndoId, clearPendingUndo]);

    const filteredBySearch = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) return subscriptions;
        return subscriptions.filter((item) => item.serviceName.toLowerCase().includes(normalizedSearch));
    }, [subscriptions, search]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Subscriptions</h1>
                    <p className="text-sm text-[#6B6960]">Live subscription data inferred from your connected transaction feed.</p>
                </div>
                <div className="flex w-full items-center gap-2 rounded-lg border border-[#D0CFC7] bg-white px-3 py-2 focus-within:border-[#FF5C35] sm:w-72">
                    <Search size={16} className="text-[#A9A79E]" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search subscriptions"
                        className="w-full border-none bg-transparent text-sm text-[#1A1A17] outline-none"
                    />
                </div>
            </header>

            {providers.hasBoth ? (
                <div className="flex items-center gap-2 rounded-full bg-[#F4F3EE] p-1 w-max">
                    {providers.connected.map((provider) => (
                        <button
                            key={provider}
                            type="button"
                            onClick={() => {
                                setSelectedProvider(provider);
                                setPage(1);
                            }}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] ${providers.active === provider
                                ? 'border-[#FF5C35] bg-[#FF5C35] text-white'
                                : 'border-[#D0CFC7] text-[#6B6960] hover:border-[#FF5C35] hover:text-[#C93A1A]'
                                }`}
                        >
                            {providerLabel(provider)}
                        </button>
                    ))}
                </div>
            ) : providers.active ? (
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Using {providerLabel(providers.active)} data</p>
            ) : null}

            <div className="flex gap-2 overflow-x-auto pb-1">
                {DASHBOARD_FILTER_OPTIONS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                            setFilter(item.key);
                            setPage(1);
                        }}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] ${item.key === filter
                            ? 'bg-[#FF5C35] text-white'
                            : 'bg-[#F4F3EE] text-[#6B6960] hover:bg-[#E8E7E0]'
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <section className="rounded-2xl border border-[#E8E7E0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
                {isError ? (
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#F3D8D8] bg-[#FEF6F6] px-3 py-2 text-xs text-[#8E5C5C]">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-[#E53434]" />
                            <span>Live refresh failed. Showing latest available data when possible.</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D0CFC7] bg-white px-2 py-1 text-[11px] font-medium text-[#1A1A17] hover:bg-[#F4F3EE]"
                        >
                            <RefreshCcw size={12} className={isFetching ? 'animate-spin' : ''} />
                            Retry
                        </button>
                    </div>
                ) : null}

                {isLoading ? (
                    <div className="space-y-3" aria-busy="true" aria-live="polite">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div key={`subscriptions-skeleton-${index}`} className="animate-pulse rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                                <div className="h-3 w-32 rounded bg-[#E8E7E0]" />
                                <div className="mt-3 h-5 w-40 rounded bg-[#EEEDE8]" />
                                <div className="mt-3 h-3 w-24 rounded bg-[#E8E7E0]" />
                            </div>
                        ))}
                    </div>
                ) : filteredBySearch.length === 0 ? (
                    isError ? (
                        <div className="rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4 text-sm text-[#6B6960]">
                            <p>We couldn’t load subscriptions right now.</p>
                            <Link href="/dashboard/connect" className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.06em] text-[#FF5C35] hover:text-[#C93A1A]">
                                Check connections
                            </Link>
                        </div>
                    ) : providers.connected.length === 0 ? (
                        <div className="rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4 text-sm text-[#6B6960]">
                            <p>No connected providers yet, so there are no subscriptions to analyze.</p>
                            <Link href="/dashboard/connect" className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.06em] text-[#FF5C35] hover:text-[#C93A1A]">
                                Connect account
                            </Link>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4 text-sm text-[#6B6960]">
                            <p>No recurring subscriptions detected for this provider yet.</p>
                            <p className="mt-1 text-xs text-[#A9A79E]">Try switching providers or review your transactions to verify recent recurring charges.</p>
                            <Link href="/dashboard/transactions" className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.06em] text-[#FF5C35] hover:text-[#C93A1A]">
                                View transactions
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4 text-sm text-[#6B6960]">
                            <p>No subscriptions match your search.</p>
                            <p className="mt-1 text-xs text-[#A9A79E]">Try another keyword or clear filters.</p>
                        </div>
                    )
                ) : (
                    <div className="space-y-3">
                        {filteredBySearch.map((subscription, index) => (
                            <SubscriptionRow
                                key={subscription.id}
                                subscription={subscription}
                                index={index}
                                currency={currency}
                                onCancel={async (id) => {
                                    await cancelSubscription(id);
                                }}
                            />
                        ))}
                    </div>
                )}

                {totalSubscriptions > 0 && (
                    <div className="mt-4 flex items-center justify-between border-t border-[#E8E7E0] pt-4">
                        <span className="text-xs uppercase tracking-[0.06em] text-[#A9A79E]">
                            Page {page} / {pageCount} · {totalSubscriptions} total
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage(page - 1)}
                                disabled={page <= 1}
                                className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs text-[#1A1A17] disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= pageCount}
                                className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs text-[#1A1A17] disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {pendingUndoId ? (
                <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-2xl bg-[#1A1A17] p-4 text-sm text-white shadow-2xl flex items-center justify-between">
                    <span>Subscription cancelled.</span>
                    <button
                        type="button"
                        onClick={() => void undoCancel()}
                        disabled={isCancelling}
                        className="rounded-[10px] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-[#1A1A17]"
                    >
                        Undo
                    </button>
                </div>
            ) : null}
        </div>
    );
}
