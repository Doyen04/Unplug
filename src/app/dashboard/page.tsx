'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DashboardAlertsPanel } from '../../components/features/dashboard/DashboardAlertsPanel';
import { DashboardSidebar } from '../../components/features/dashboard/DashboardSidebar';
import { ShameScoreMeter } from '../../components/features/dashboard/ShameScoreMeter';
import { StatCard } from '../../components/features/dashboard/StatCard';
import { DebriefPanel } from '../../components/features/debrief/DebriefPanel';
import { SubscriptionRow } from '../../components/features/subscriptions/SubscriptionRow';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../lib/utils/format';
import type { DashboardFilter } from '../../types/subscription';

const FILTERS: Array<{ key: DashboardFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'at-risk', label: 'At risk' },
  { key: 'unused', label: 'Unused' },
  { key: 'active', label: 'Active' },
  { key: 'cancelled', label: 'Cancelled' },
];

const DashboardPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFilter = (searchParams.get('filter') as DashboardFilter | null) ?? 'all';
  const initialPage = Number(searchParams.get('page') ?? '1') || 1;

  const {
    summary,
    subscriptions,
    totalSubscriptions,
    alerts,
    debrief,
    isLoading,
    isDebriefLoading,
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

  useEffect(() => {
    const currentFilter = searchParams.get('filter') ?? 'all';
    const currentPage = Number(searchParams.get('page') ?? '1') || 1;

    if (currentFilter === filter && currentPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`);
  }, [filter, page, pathname, router, searchParams]);

  useEffect(() => {
    if (!pendingUndoId) return;

    const timeoutId = setTimeout(() => {
      clearPendingUndo();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [pendingUndoId, clearPendingUndo]);

  if (isError) {
    return (
      <main className="min-h-screen bg-stone-950 px-4 py-10 text-stone-100 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl border border-red-900 bg-red-950 p-6 text-sm uppercase tracking-[0.08em] text-red-400">
          Dashboard unavailable. Try again.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-10 text-stone-100 md:px-6 lg:h-screen lg:overflow-hidden lg:px-8">
      <div className="mx-auto grid w-full max-w-350 grid-cols-1 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[240px_minmax(0,800px)_280px] lg:items-stretch">
        <div className="order-1 lg:order-1 lg:h-full">
          <DashboardSidebar monthlySpend={summary.monthlySpend} />
        </div>

        <section className="scrollbar-hidden order-3 space-y-4 lg:order-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <section className="border border-stone-800 bg-stone-900 p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Dashboard command center</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-stone-500">
              Source: {summary.dataSource === 'plaid' ? 'Plaid live data' : 'Seeded fallback data'}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <article className="border border-stone-800 bg-stone-950 p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Tracked subscriptions</p>
                <p className="mt-2 font-display text-4xl text-stone-100">{isLoading ? '--' : totalSubscriptions}</p>
              </article>
              <article className="border border-stone-800 bg-stone-950 p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Linked accounts</p>
                <p className="mt-2 font-display text-4xl text-acid-green">{isLoading ? '--' : summary.linkedAccounts}</p>
              </article>
              <article className="border border-stone-800 bg-stone-950 p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Recent transactions</p>
                <p className="mt-2 font-display text-4xl text-amber-400">{isLoading ? '--' : summary.recentTransactionCount}</p>
              </article>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/connect"
                className="border border-acid-green bg-acid-green px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green"
              >
                Connect another account
              </Link>
            </div>
          </section>

          <ShameScoreMeter
            score={summary.shameScore}
            previousScore={summary.previousShameScore}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              label="Monthly Spend"
              value={formatCurrency(summary.monthlySpend)}
              variant="danger"
            />
            <StatCard label="Unused Count" value={`${summary.unusedCount}`} />
            <StatCard
              label="Saveable / yr"
              value={formatCurrency(summary.saveablePerYear)}
              variant="success"
            />
          </div>

          <div id="debrief">
            <DebriefPanel
              month={debrief?.month ?? 'APR 2026'}
              isLoading={isDebriefLoading}
              content={debrief?.content ?? null}
              error={!isDebriefLoading && !debrief}
            />
          </div>

          <section id="subscriptions" className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">
                Subscriptions
              </p>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilter(option.key)}
                    className={`border px-3 py-1 text-xs uppercase tracking-[0.06em] ${filter === option.key
                      ? 'border-acid-green text-acid-green'
                      : 'border-stone-600 text-stone-200 hover:border-stone-400 hover:text-stone-100'
                      } focus-visible:outline-2 focus-visible:outline-acid-green`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="border border-stone-800 bg-stone-900 p-4 text-sm text-stone-500">
                Scanning transactions
                <span className="animate-blink">_</span>
              </div>
            ) : (
              subscriptions.map((subscription, index) => (
                <SubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                  onCancel={cancelSubscription}
                  index={index}
                />
              ))
            )}

            <div className="flex flex-col gap-2 border border-stone-800 bg-stone-900 px-3 py-2 text-xs uppercase tracking-[0.06em] text-stone-400 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-center sm:text-left">
                Page {page} / {pageCount} · {totalSubscriptions} total
              </span>
              <div className="flex justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="border border-stone-600 px-2 py-1 text-stone-200 hover:border-stone-400 hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-acid-green disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pageCount}
                  className="border border-stone-600 px-2 py-1 text-stone-200 hover:border-stone-400 hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-acid-green disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </section>

        <div id="alerts" className="order-2 lg:order-3 lg:h-full lg:min-h-0">
          <DashboardAlertsPanel alerts={alerts} />
        </div>
      </div>

      {pendingUndoId ? (
        <div
          className="fixed bottom-4 left-1/2 w-[92%] max-w-md -translate-x-1/2 border border-stone-700 bg-stone-900 p-3 text-sm text-stone-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Subscription cancelled. Undo within 5 seconds.</span>
            <button
              type="button"
              onClick={() => void undoCancel()}
              disabled={isCancelling}
              className="border border-acid-green px-2 py-1 text-xs uppercase tracking-[0.06em] text-acid-green focus-visible:outline-2 focus-visible:outline-acid-green disabled:opacity-60"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default DashboardPage;
