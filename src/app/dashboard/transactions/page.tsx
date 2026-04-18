'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Receipt } from 'lucide-react';

import { useDashboardData } from '../../../hooks/useDashboardData';
import { formatCurrency } from '../../../lib/utils/format';
import type { DashboardProvider } from '../../../types/subscription';
import { providerLabel, providerCurrency } from '../../../lib/utils/provider';

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

    if (provider) {
        params.set('provider', provider);
    }

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
    const initialProvider =
        initialProviderParam === 'plaid' || initialProviderParam === 'mono'
            ? initialProviderParam
            : undefined;
    const [selectedProvider, setSelectedProvider] = useState<DashboardProvider | undefined>(initialProvider);

    const { providers } = useDashboardData({
        initialFilter: 'all',
        initialPage: 1,
        pageSize: 1,
        includeDebrief: false,
        provider: selectedProvider,
    });

    useEffect(() => {
        if (!providers.active) {
            if (selectedProvider) {
                setSelectedProvider(undefined);
            }
            return;
        }

        if (!selectedProvider || !providers.connected.includes(selectedProvider)) {
            setSelectedProvider(providers.active);
        }
    }, [providers.active, providers.connected, selectedProvider]);

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

        window.history.replaceState(null, '', `/dashboard/transactions?${params.toString()}`);
    }, [searchParams, selectedProvider]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['transactions-page', days, page, pageSize, selectedProvider ?? 'auto'],
        queryFn: () => fetchTransactions(days, page, pageSize, selectedProvider),
        retry: false,
        enabled: Boolean(selectedProvider),
    });

    const filteredTransactions = useMemo(() => {
        const list = data?.transactions ?? [];
        const normalized = search.trim().toLowerCase();
        if (!normalized) return list;
        return list.filter((item) => {
            const merchant = (item.merchant_name ?? item.name).toLowerCase();
            const category = (item.category ?? []).join(' ').toLowerCase();
            return merchant.includes(normalized) || category.includes(normalized);
        });
    }, [data?.transactions, search]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Transactions</h1>
                    <p className="text-sm text-[#6B6960]">Real transaction feed from your linked bank account.</p>
                </div>

                <div className="flex items-center gap-2">
                    {[30, 60, 90].map((window) => (
                        <button
                            key={window}
                            type="button"
                            onClick={() => {
                                setDays(window);
                                setPage(1);
                            }}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] ${days === window
                                ? 'bg-[#FF5C35] text-white'
                                : 'bg-[#F4F3EE] text-[#6B6960] hover:bg-[#E8E7E0]'
                                }`}
                        >
                            {window}d
                        </button>
                    ))}
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

            <div className="flex w-full items-center gap-2 rounded-lg border border-[#D0CFC7] bg-white px-3 py-2 focus-within:border-[#FF5C35] sm:max-w-sm">
                <Search size={16} className="text-[#A9A79E]" />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search transactions"
                    className="w-full border-none bg-transparent text-sm text-[#1A1A17] outline-none"
                />
            </div>

            <section className="overflow-hidden rounded-2xl border border-[#E8E7E0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
                <div className="border-b border-[#E8E7E0] px-5 py-4 text-xs uppercase tracking-[0.06em] text-[#A9A79E]">
                    {data?.total ?? 0} transactions · page {data?.page ?? 1} / {data?.pageCount ?? 1}
                </div>

                {isLoading ? (
                    <div className="px-5 py-6 text-sm text-[#6B6960]">Loading transactions...</div>
                ) : isError ? (
                    <div className="px-5 py-6 text-sm text-[#E53434]">Unable to load transactions. Connect or relink a supported provider and try again.</div>
                ) : !selectedProvider ? (
                    <div className="px-5 py-6 text-sm text-[#6B6960]">
                        No connected provider yet. <Link href="/dashboard/connect" className="font-semibold text-[#FF5C35] hover:text-[#C93A1A]">Connect an account</Link> to view transactions.
                    </div>
                ) : (data?.transactions.length ?? 0) === 0 ? (
                    <div className="px-5 py-6 text-sm text-[#6B6960]">No transactions in this time window.</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-[#6B6960]">No transactions match your search on this page.</div>
                ) : (
                    <div className="divide-y divide-[#E8E7E0]">
                        {filteredTransactions.map((transaction) => (
                            <article key={transaction.transaction_id} className="flex items-center justify-between gap-4 px-5 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A17] text-white shadow-inner">
                                        <Receipt size={14} aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#1A1A17]">
                                            {transaction.merchant_name ?? transaction.name}
                                        </p>
                                        <p className="mt-1 text-xs text-[#6B6960]">
                                            {new Date(transaction.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            {transaction.category?.length
                                                ? ` · ${transaction.category[0]}`
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-semibold text-[#1A1A17]">
                                        {formatCurrency(Math.abs(transaction.amount), providerCurrency(selectedProvider))}
                                    </p>
                                    <span className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${transaction.amount > 0
                                        ? 'border-[#E8860A]/20 bg-[#FEF6EC] text-[#E8860A]'
                                        : 'border-[#1C9E5B]/20 bg-[#EDFAF3] text-[#1C9E5B]'
                                        }`}>
                                        {transaction.amount > 0 ? 'Outflow' : 'Inflow'}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {!isLoading && !isError && (data?.pageCount ?? 1) > 1 && (
                    <div className="flex items-center justify-between border-t border-[#E8E7E0] px-5 py-4">
                        <span className="text-xs uppercase tracking-[0.06em] text-[#A9A79E]">
                            Showing {(data!.page - 1) * data!.pageSize + 1}-{Math.min(data!.page * data!.pageSize, data!.total)} of {data!.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={(data?.page ?? 1) <= 1}
                                className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs text-[#1A1A17] disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.min(data!.pageCount, current + 1))}
                                disabled={(data?.page ?? 1) >= (data?.pageCount ?? 1)}
                                className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs text-[#1A1A17] disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
