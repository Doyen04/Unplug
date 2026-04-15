'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, AlertTriangle, RefreshCcw } from 'lucide-react';

import { SubscriptionRow } from '../../../components/features/subscriptions/SubscriptionRow';
import type { DashboardFilter, DashboardPayload } from '../../../types/subscription';

const FILTERS: Array<{ key: DashboardFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'unused', label: 'Unused' },
    { key: 'at-risk', label: 'Risky' },
    { key: 'cancelled', label: 'Cancelled' },
];

const fetchSubscriptionsPage = async (
    filter: DashboardFilter,
    page: number
): Promise<DashboardPayload> => {
    const query = new URLSearchParams({
        filter,
        page: String(page),
        pageSize: '20',
    });

    const response = await fetch(`/api/dashboard?${query.toString()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load subscriptions');
    return response.json();
};

const postCancel = async (id: string): Promise<void> => {
    const response = await fetch(`/api/subscriptions/${id}/cancel`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to cancel subscription');
};

const postUndo = async (id: string): Promise<void> => {
    const response = await fetch(`/api/subscriptions/${id}/undo`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to undo cancellation');
};

export default function SubscriptionsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<DashboardFilter>('all');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pendingUndoId, setPendingUndoId] = useState<string | null>(null);

    const { data, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ['subscriptions-page', filter, page],
        queryFn: () => fetchSubscriptionsPage(filter, page),
    });

    const cancelMutation = useMutation({
        mutationFn: postCancel,
        onSuccess: (_, id) => {
            setPendingUndoId(id);
            void queryClient.invalidateQueries({ queryKey: ['subscriptions-page'] });
        },
    });

    const undoMutation = useMutation({
        mutationFn: postUndo,
        onSuccess: () => {
            setPendingUndoId(null);
            void queryClient.invalidateQueries({ queryKey: ['subscriptions-page'] });
        },
    });

    useEffect(() => {
        if (!pendingUndoId) return;
        const timeoutId = setTimeout(() => setPendingUndoId(null), 5000);
        return () => clearTimeout(timeoutId);
    }, [pendingUndoId]);

    const subscriptions = data?.subscriptions ?? [];
    const filteredBySearch = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) return subscriptions;
        return subscriptions.filter((item) => item.serviceName.toLowerCase().includes(normalizedSearch));
    }, [subscriptions, search]);

    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Subscriptions</h1>
                    <p className="text-sm text-[#6B6960]">Live subscription data from your connected accounts.</p>
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

            <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map((item) => (
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
                    <p className="text-sm text-[#6B6960]">Loading subscriptions...</p>
                ) : filteredBySearch.length === 0 ? (
                    isError ? (
                        <div className="rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4 text-sm text-[#6B6960]">
                            <p>We couldn’t load subscriptions right now.</p>
                            <Link href="/dashboard/connect" className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.06em] text-[#FF5C35] hover:text-[#C93A1A]">
                                Check connections
                            </Link>
                        </div>
                    ) : (
                        <p className="text-sm text-[#6B6960]">No subscriptions found.</p>
                    )
                ) : (
                    <div className="space-y-3">
                        {filteredBySearch.map((subscription, index) => (
                            <SubscriptionRow
                                key={subscription.id}
                                subscription={subscription}
                                index={index}
                                onCancel={async (id) => {
                                    await cancelMutation.mutateAsync(id);
                                }}
                            />
                        ))}
                    </div>
                )}

                {pagination && pagination.total > 0 && (
                    <div className="mt-4 flex items-center justify-between border-t border-[#E8E7E0] pt-4">
                        <span className="text-xs uppercase tracking-[0.06em] text-[#A9A79E]">
                            Page {pagination.page} / {pagination.pageCount} · {pagination.total} total
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={pagination.page <= 1}
                                className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs text-[#1A1A17] disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.min(pagination.pageCount, current + 1))}
                                disabled={pagination.page >= pagination.pageCount}
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
                        onClick={() => void undoMutation.mutateAsync(pendingUndoId)}
                        className="rounded-[10px] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-[#1A1A17]"
                    >
                        Undo
                    </button>
                </div>
            ) : null}
        </div>
    );
}
