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
      <main className="min-h-screen bg-[#FAFAF7] px-4 py-10 text-[#1A1A17] md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#E53434] bg-[#FEF0F0] p-6 text-sm uppercase tracking-[0.08em] text-[#E53434] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          Dashboard unavailable. Try again.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-4 py-10 text-[#1A1A17] md:px-6 lg:h-screen lg:overflow-hidden lg:px-8">
      <div className="mx-auto grid w-full max-w-350 grid-cols-1 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[240px_minmax(0,800px)_280px] lg:items-stretch">
        <div className="order-1 lg:order-1 lg:h-full">
          <DashboardSidebar monthlySpend={summary.monthlySpend} />
        </div>

        <section className="scrollbar-hidden order-3 space-y-4 lg:order-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <section className="rounded-2xl border border-[#E8E7E0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Dashboard command center</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#A9A79E]">
              Source: {summary.dataSource === 'plaid' ? 'Plaid live data' : 'Seeded fallback data'}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Tracked subscriptions</p>
                <p className="font-display mt-2 text-4xl text-[#1A1A17]">{isLoading ? '--' : totalSubscriptions}</p>
              </article>
              <article className="rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Linked accounts</p>
                <p className="font-display mt-2 text-4xl text-[#1C9E5B]">{isLoading ? '--' : summary.linkedAccounts}</p>
              </article>
              <article className="rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Recent transactions</p>
                <p className="font-display mt-2 text-4xl text-[#E8860A]">{isLoading ? '--' : summary.recentTransactionCount}</p>
              </article>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/connect"
                className="rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
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
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">
                Subscriptions
              </p>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilter(option.key)}
                    className={`rounded-[10px] border px-3 py-1 text-xs uppercase tracking-[0.06em] ${filter === option.key
                      ? 'border-[#FF5C35] bg-[#FFF0EC] text-[#C93A1A]'
                      : 'border-[#D0CFC7] bg-white text-[#6B6960] hover:border-[#1A1A17] hover:text-[#1A1A17]'
                      } focus-visible:outline-2 focus-visible:outline-acid-green`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-[#E8E7E0] bg-white p-4 text-sm text-[#6B6960] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
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

            <div className="flex flex-col gap-2 rounded-2xl border border-[#E8E7E0] bg-white px-3 py-2 text-xs uppercase tracking-[0.06em] text-[#6B6960] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-center sm:text-left">
                Page {page} / {pageCount} · {totalSubscriptions} total
              </span>
              <div className="flex justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-[10px] border border-[#D0CFC7] px-2 py-1 text-[#1A1A17] hover:border-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pageCount}
                  className="rounded-[10px] border border-[#D0CFC7] px-2 py-1 text-[#1A1A17] hover:border-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-40"
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
          className="fixed bottom-4 left-1/2 w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-[#E8E7E0] bg-white p-3 text-sm text-[#1A1A17] shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Subscription cancelled. Undo within 5 seconds.</span>
            <button
              type="button"
              onClick={() => void undoCancel()}
              disabled={isCancelling}
              className="rounded-[10px] border border-[#FF5C35] px-2 py-1 text-xs uppercase tracking-[0.06em] text-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-60"
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
