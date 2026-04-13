'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, Settings, Flame, Layers, Link as LinkIcon, TrendingUp, AlertTriangle, Check, Search, ArrowRight, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { formatCurrency } from '../../lib/utils/format';
import { useDashboardData } from '../../hooks/useDashboardData';
import { interpolateScoreColor } from '../../lib/utils/shameScore';
import type { DashboardFilter } from '../../types/subscription';
import { SubscriptionRow } from '../../components/features/subscriptions/SubscriptionRow';

const MOCK_CHART_DATA = [
  { name: 'Nov', spend: 12000 },
  { name: 'Dec', spend: 18000 },
  { name: 'Jan', spend: 13500 },
  { name: 'Feb', spend: 20000 },
  { name: 'Mar', spend: 16000 },
  { name: 'Apr', spend: 28000 },
];

const FILTERS: Array<{ key: DashboardFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'unused', label: 'Unused' },
  { key: 'at-risk', label: 'Risky' },
  { key: 'cancelled', label: 'Cancelled' },
];

interface PlaidTransaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  merchant_name: string | null;
  category: string[] | null;
}

const fetchRecentTransactions = async (): Promise<{ total: number; transactions: PlaidTransaction[] }> => {
  const response = await fetch('/api/connect/plaid/transactions?days=60', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load transactions');
  }

  return response.json();
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [ledgerTab, setLedgerTab] = useState<'subscriptions' | 'transactions'>('subscriptions');

  const initialFilter = (searchParams.get('filter') as DashboardFilter | null) ?? 'all';
  const initialPage = Number(searchParams.get('page') ?? '1') || 1;

  const {
    summary,
    subscriptions,
    totalSubscriptions,
    alerts,
    isLoading,
    isError,
    filter,
    setFilter,
    page,
    pageCount,
    setPage,
    cancelSubscription,
    undoCancel,
    clearPendingUndo,
    pendingUndoId,
    isCancelling,
  } = useDashboardData({
    initialFilter,
    initialPage,
  });

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
  } = useQuery({
    queryKey: ['dashboard-transactions'],
    queryFn: fetchRecentTransactions,
    retry: false,
  });

  const recentTransactions = (transactionsData?.transactions ?? []).slice(0, 5);

  useEffect(() => {
    const currentFilter = searchParams.get('filter') ?? 'all';
    const currentPage = Number(searchParams.get('page') ?? '1') || 1;

    if (currentFilter === filter && currentPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    params.set('page', String(page));
    router.replace(`?${params.toString()}`);
  }, [filter, page, pathname, router, searchParams]);

  useEffect(() => {
    if (!pendingUndoId) return;
    const timeoutId = setTimeout(() => { clearPendingUndo(); }, 5000);
    return () => clearTimeout(timeoutId);
  }, [pendingUndoId, clearPendingUndo]);

  const scoreColor = interpolateScoreColor(summary.shameScore);
  const strokeDashoffset = 125.6 * (1 - summary.shameScore / 100);

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-2xl border border-[#E53434] bg-[#FEF0F0] p-6 text-sm uppercase tracking-[0.08em] text-[#E53434]">
          Dashboard unavailable. Try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TOP BAR */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Dashboard</h1>
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative group">
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D0CFC7] bg-white text-[#6B6960] hover:border-[#1A1A17] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
            >
              <Bell size={18} />
              {alerts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E53434] text-[10px] font-bold text-white">
                  {alerts.length}
                </span>
              )}
            </button>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-[#D0CFC7]">
            <div className="flex h-full w-full items-center justify-center bg-[#1A1A17] text-white font-medium text-sm">JD</div>
          </div>
        </div>
      </header>

      {/* ROW 1: STAT CARDS */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <article className="group flex flex-col justify-between rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#D0CFC7]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FEF0F0] text-[#E53434] ring-1 ring-[#FEE2E2] transition-colors group-hover:bg-[#E53434] group-hover:text-white">
              <Flame size={16} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6960]">Monthly Burn</p>
          </div>
          <div className="mt-6">
            <p className="font-display text-4xl font-semibold leading-none text-[#1A1A17]">{formatCurrency(summary.monthlySpend)}</p>
            <p className="mt-1.5 text-xs text-[#A9A79E]">burning every month</p>
          </div>
        </article>

        <article className="group flex flex-col justify-between rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#D0CFC7]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF0EB] text-[#FF5C35] ring-1 ring-[#FFE0D6] transition-colors group-hover:bg-[#FF5C35] group-hover:text-white">
              <Layers size={16} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6960]">Tracked Subs</p>
          </div>
          <div className="mt-6">
            <p className="font-display text-4xl font-semibold leading-none text-[#1A1A17]">{totalSubscriptions}</p>
            <p className="mt-1.5 text-xs text-[#A9A79E]">active subscriptions</p>
          </div>
        </article>

        <article className="group flex flex-col justify-between rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#D0CFC7]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDFAF3] text-[#1C9E5B] ring-1 ring-[#D1F4E0] transition-colors group-hover:bg-[#1C9E5B] group-hover:text-white">
              <LinkIcon size={16} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6960]">Linked Accounts</p>
          </div>
          <div className="mt-6">
            <p className="font-display text-4xl font-semibold leading-none text-[#1A1A17]">{summary.linkedAccounts}</p>
            <p className="mt-1.5 text-xs text-[#A9A79E]">bank accounts connected</p>
          </div>
        </article>

        <article className="group flex flex-col justify-between rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#D0CFC7]">
          <div className="z-10 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF7] text-[#1A1A17] ring-1 ring-[#E8E7E0] transition-colors group-hover:bg-[#1A1A17] group-hover:text-white">
              <Check size={16} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6960]">Shame Score</p>
          </div>
          <div className="z-10 mt-6 flex items-center justify-between">
            <div>
              <p className="font-display text-4xl font-semibold leading-none text-[#1A1A17]">{summary.shameScore}</p>
              <p className="mt-1.5 text-xs text-[#A9A79E]">subscription guilt index</p>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="none" stroke="#F4F3EE" strokeWidth="4" />
                <circle cx="22" cy="22" r="20" fill="none" strokeWidth="4" strokeLinecap="round"
                  style={{ stroke: scoreColor, strokeDasharray: 125.6, strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
            </div>
          </div>
        </article>
      </section>

      {/* ROW 2: CHART + SECONDARY INSIGHT CARDS */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <article className="col-span-1 lg:col-span-2 group flex flex-col justify-between rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] lg:row-span-1 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#D0CFC7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF7] text-[#1A1A17] ring-1 ring-[#E8E7E0] transition-colors group-hover:bg-[#1A1A17] group-hover:text-white">
                <TrendingUp size={16} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6960]">Monthly Spend</p>
            </div>
            <p className="font-display text-2xl font-semibold text-[#1A1A17]">{formatCurrency(summary.monthlySpend)}</p>
          </div>
          <div className="mt-8 flex flex-col flex-1 pb-2">
            <div className="h-40 lg:h-64 w-full group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CHART_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    style={{ textTransform: 'uppercase' }}
                    tick={{ fill: '#A9A79E', fontSize: 10, fontWeight: 500 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #E8E7E0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', fontSize: '12px', fontWeight: 600, color: '#1A1A17' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Spend']}
                  />
                  <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                    {MOCK_CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#FF5C35" className="opacity-40 hover:opacity-100 transition-opacity duration-300" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </article>

        <article className="group flex flex-col justify-between rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-[#D0CFC7]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF7] text-[#1A1A17] ring-1 ring-[#E8E7E0] transition-colors group-hover:bg-[#1A1A17] group-hover:text-white">
                <AlertTriangle size={16} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6960]">Unused</p>
            </div>
            <p className="mt-5 font-display text-5xl font-semibold leading-none text-[#1A1A17]">{summary.unusedCount}</p>
            <p className="mt-3 text-sm text-[#6B6960] max-w-xs">subscriptions you haven't used proactively in 30+ days.</p>
          </div>
          <Link href="#subscriptions" onClick={() => setFilter('unused')} className="mt-6 flex w-max items-center font-bold text-[#FF5C35] text-xs uppercase tracking-[0.08em] hover:text-[#C93A1A] bg-transparent hover:bg-[#FEF6EC] px-3 py-1.5 -ml-3 rounded-lg transition-colors">
            Review unused <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </article>

        <article className="group flex flex-col justify-between rounded-2xl border border-[#FFE8E2] bg-linear-to-br from-[#FEF0F0] to-[#FFFFFF] p-6 shadow-[0_1px_4px_rgba(229,52,52,0.04),0_4px_16px_rgba(229,52,52,0.04)] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(229,52,52,0.08)] hover:border-[#FCA5A5]">
          <div>
            <div className="flex items-center gap-2 text-[#E53434]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]">You could save</p>
            </div>
            <p className="mt-5 font-display text-4xl font-bold text-[#E53434]">{formatCurrency(summary.saveablePerYear)}</p>
            <p className="text-xs text-[#E53434]/80 mt-2 font-medium">by cutting unused subs</p>
          </div>
          <button onClick={() => setFilter('unused')} className="mt-6 rounded-xl border border-[#E53434] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#E53434] hover:bg-[#E53434] hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-[#E53434] transition-all shadow-sm hover:shadow-md">
            See what to cut
          </button>
        </article>
      </section>

      {/* ROW 3: BANNER (If no accounts linked) */}
      {summary.linkedAccounts === 0 && !isLoading && (
        <section className="flex flex-col gap-5 rounded-2xl border border-[#E8E7E0] bg-[#1A1A17] p-6 text-white sm:flex-row sm:items-center sm:justify-between shadow-[0_8px_32px_rgba(26,26,23,0.12)] transition-all hover:shadow-[0_8px_32px_rgba(26,26,23,0.2)]">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#31302A] text-[#FF5C35] ring-1 ring-[#FF5C35]/20">
              <LinkIcon size={24} />
            </div>
            <div>
              <p className="text-lg font-bold">Connect your main bank account</p>
              <p className="text-sm text-[#A9A79E] mt-1 max-w-xl leading-relaxed">We need to link your bank to scan for active subscriptions accurately. Connect via Plaid or Mono to get started.</p>
            </div>
          </div>
          <Link href="/dashboard/connect" className="shrink-0 rounded-xl bg-[#FF5C35] px-6 py-3.5 text-center text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-[#C93A1A] focus:ring-2 focus:ring-[#FF5C35] focus:ring-offset-2 focus:ring-offset-[#1A1A17] transition-all">
            Connect Account
          </Link>
        </section>
      )}

      {/* ROW 4: SUBSCRIPTIONS + TRANSACTIONS (TABBED) */}
      <section id="subscriptions" className="group rounded-2xl border border-[#E8E7E0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#D0CFC7]">
        <div className="flex flex-col justify-between border-b border-[#E8E7E0] p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full bg-[#F4F3EE] p-1">
            <button
              type="button"
              onClick={() => setLedgerTab('subscriptions')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${ledgerTab === 'subscriptions' ? 'bg-[#1A1A17] text-white' : 'text-[#6B6960] hover:text-[#1A1A17]'}`}
            >
              Your Subscriptions
            </button>
            <button
              type="button"
              onClick={() => setLedgerTab('transactions')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${ledgerTab === 'transactions' ? 'bg-[#1A1A17] text-white' : 'text-[#6B6960] hover:text-[#1A1A17]'}`}
            >
              Recent Transactions
            </button>
          </div>

          {ledgerTab === 'subscriptions' ? (
            <div className="mt-4 flex w-full max-w-sm items-center gap-2 rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-3 py-2 sm:mt-0 focus-within:border-[#1A1A17] focus-within:bg-white transition-colors">
              <Search size={16} className="text-[#A9A79E]" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent text-sm text-[#1A1A17] outline-none placeholder:text-[#A9A79E]"
              />
            </div>
          ) : (
            <Link href="/dashboard/transactions" className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#FF5C35] hover:text-[#C93A1A] sm:mt-0">View all &rarr;</Link>
          )}
        </div>

        {ledgerTab === 'subscriptions' ? (
          <div className="flex gap-4 overflow-x-auto border-b border-[#E8E7E0] px-5 py-3">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] transition-colors ${filter === f.key
                  ? 'bg-[#1A1A17] text-white'
                  : 'bg-[#F4F3EE] text-[#6B6960] hover:bg-[#E8E7E0] hover:text-[#1A1A17]'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="p-5 overflow-hidden">
          {ledgerTab === 'subscriptions' ? (
            <>
              <div className="flex flex-col gap-3">
                {isLoading ? (
                  <div className="text-sm text-[#6B6960] py-4">Scanning transactions...</div>
                ) : subscriptions.filter((subscription) => subscription.serviceName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-sm text-[#6B6960] py-4">No subscriptions matched this filter.</div>
                ) : (
                  subscriptions
                    .filter((subscription) => subscription.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((subscription, index) => (
                      <SubscriptionRow
                        key={subscription.id}
                        subscription={subscription}
                        onCancel={cancelSubscription}
                        index={index}
                      />
                    ))
                )}
              </div>

              {!isLoading && subscriptions.length > 0 && (
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#E8E7E0]">
                  <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#A9A79E]">
                    Page {page} / {pageCount} · {totalSubscriptions} total
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs font-medium text-[#1A1A17] hover:bg-[#F4F3EE] disabled:opacity-40 transition-colors">
                      Prev
                    </button>
                    <button type="button" onClick={() => setPage(page + 1)} disabled={page >= pageCount} className="rounded-lg border border-[#D0CFC7] px-3 py-1.5 text-xs font-medium text-[#1A1A17] hover:bg-[#F4F3EE] disabled:opacity-40 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="divide-y divide-[#E8E7E0]/60">
              {isTransactionsLoading ? (
                <div className="py-4 text-sm text-[#6B6960]">Loading transactions...</div>
              ) : recentTransactions.length === 0 ? (
                <div className="py-4 text-sm text-[#6B6960]">No live transactions found. Connect an account to populate this list.</div>
              ) : recentTransactions.map((tx) => (
                <div key={tx.transaction_id} className="flex items-center justify-between py-4 hover:bg-[#FAFAF7] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A1A17] text-white font-bold text-sm shadow-inner">
                      {(tx.merchant_name ?? tx.name).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A17]">{tx.merchant_name ?? tx.name}</p>
                      <p className="text-xs text-[#6B6960] mt-1">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1A1A17]">{formatCurrency(tx.amount)}</p>
                    <span className={`inline-block rounded-md px-2 py-0.5 mt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${tx.amount > 0
                        ? 'bg-[#FEF6EC] text-[#E8860A] border border-[#E8860A]/20'
                        : 'bg-[#EDFAF3] text-[#1C9E5B] border border-[#1C9E5B]/20'
                      }`}>
                      {tx.amount > 0 ? 'Outflow' : 'Inflow'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* UNDO TOAST */}
      {pendingUndoId ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-2xl bg-[#1A1A17] p-4 text-sm text-white shadow-2xl flex items-center justify-between" role="status">
          <span>Subscription cancelled.</span>
          <button type="button" onClick={() => void undoCancel()} disabled={isCancelling} className="rounded-[10px] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.06em] text-[#1A1A17] hover:bg-[#F4F3EE] disabled:opacity-60">
            Undo
          </button>
        </div>
      ) : null}

      {/* Slide-over Alerts Panel */}
      {isAlertsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAlertsOpen(false)}
          />
          <section className="absolute inset-y-0 right-0 w-full max-w-sm flex">
            <div className="w-full h-full bg-[#F4F4F0] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-[#E8E7E0]">

              {/* Slide-over Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E7E0] bg-white">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#1A1A17]">Alerts</h2>
                  {alerts.length > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-[#E53434] px-2 text-[10px] font-bold text-white">
                      {alerts.length} NEW
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsAlertsOpen(false)}
                  className="text-[#6B6960] hover:text-[#1A1A17] hover:bg-[#E8E7E0] p-1.5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Slide-over Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {alerts.length === 0 ? (
                  <div className="rounded-2xl border border-[#E8E7E0] bg-white p-10 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center text-[#6B6960] transition-all hover:border-[#D0CFC7] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDFAF3] text-[#1C9E5B] border border-[#D1F4E0] shadow-sm mb-4">
                      <Check size={24} />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A17]">All clear!</p>
                    <p className="text-xs text-[#A9A79E] mt-1.5 max-w-50">No new alerts to review. You're completely up to date.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="group flex flex-col gap-3 rounded-2xl border border-[#FFE8E2] bg-linear-to-br from-[#FEF6EC] to-white p-5 shadow-sm transition-all hover:shadow-[0_4px_12px_rgba(232,134,10,0.1)] hover:border-[#FDB487] hover:-translate-y-0.5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#E8860A] border border-[#FFE8E2] shadow-[0_1px_2px_rgba(232,134,10,0.1)]">
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className="text-sm font-bold text-[#1A1A17]">{alert.label}</p>
                          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#6B6960] mt-1.5">Action Recommended</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </section>
        </div>
      )}
    </div>
  );
}
