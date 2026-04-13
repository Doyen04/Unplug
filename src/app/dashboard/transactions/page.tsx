'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { formatCurrency } from '../../../lib/utils/format';

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
    total: number;
    transactions: PlaidTransaction[];
}

const fetchTransactions = async (days: number): Promise<TransactionsResponse> => {
    const response = await fetch(`/api/connect/plaid/transactions?days=${days}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load transactions');
    return response.json();
};

export default function TransactionsPage() {
    const [days, setDays] = useState(90);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['transactions-page', days],
        queryFn: () => fetchTransactions(days),
        retry: false,
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Transactions</h1>
                    <p className="text-sm text-[#6B6960]">Real transaction feed from your linked Plaid account.</p>
                </div>

                <div className="flex items-center gap-2">
                    {[30, 60, 90].map((window) => (
                        <button
                            key={window}
                            type="button"
                            onClick={() => setDays(window)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] ${days === window
                                    ? 'bg-[#1A1A17] text-white'
                                    : 'bg-[#F4F3EE] text-[#6B6960] hover:bg-[#E8E7E0]'
                                }`}
                        >
                            {window}d
                        </button>
                    ))}
                </div>
            </header>

            <section className="overflow-hidden rounded-2xl border border-[#E8E7E0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
                <div className="border-b border-[#E8E7E0] px-5 py-4 text-xs uppercase tracking-[0.06em] text-[#A9A79E]">
                    {data?.total ?? 0} transactions
                </div>

                {isLoading ? (
                    <div className="px-5 py-6 text-sm text-[#6B6960]">Loading transactions...</div>
                ) : isError ? (
                    <div className="px-5 py-6 text-sm text-[#E53434]">Unable to load transactions. Connect or relink Plaid and try again.</div>
                ) : (data?.transactions.length ?? 0) === 0 ? (
                    <div className="px-5 py-6 text-sm text-[#6B6960]">No transactions in this time window.</div>
                ) : (
                    <div className="divide-y divide-[#E8E7E0]">
                        {data!.transactions.map((transaction) => (
                            <article key={transaction.transaction_id} className="flex items-center justify-between gap-4 px-5 py-4">
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

                                <div className="text-right">
                                    <p className="text-sm font-semibold text-[#1A1A17]">
                                        {formatCurrency(Math.abs(transaction.amount))}
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
            </section>
        </div>
    );
}
