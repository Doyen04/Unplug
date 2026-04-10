'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';

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

/* Subscription list skeleton */
const SubscriptionSkeleton = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-card border border-border bg-white px-4 py-[18px] shadow-card"
        style={{ minHeight: '72px' }}
      >
        <div className="shimmer h-10 w-10 rounded-[10px]" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-3 w-20 rounded" />
        </div>
        <div className="shimmer h-5 w-16 rounded" />
      </div>
    ))}
  </div>
);

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

  /* Sync filter/page to URL */
  useEffect(() => {
    const currentFilter = searchParams.get('filter') ?? 'all';
    const currentPage = Number(searchParams.get('page') ?? '1') || 1;

    if (currentFilter === filter && currentPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', filter);
    params.set('page', String(page));
    router.replace(`${pathname}?${params.toString()}`);
  }, [filter, page, pathname, router, searchParams]);

  /* Auto-clear undo toast after 5s */
  useEffect(() => {
    if (!pendingUndoId) return;

    toast.success('Subscription cancelled!', {
      description: 'You can undo within 5 seconds.',
      action: {
        label: 'Undo',
        onClick: () => void undoCancel(),
      },
      duration: 5000,
    });

    const timeoutId = setTimeout(() => {
      clearPendingUndo();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [pendingUndoId, clearPendingUndo, undoCancel]);

  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base px-4">
        <div className="max-w-md rounded-card border border-danger bg-danger-light p-6 text-center shadow-card">
          <p className="text-[15px] font-medium text-danger">Dashboard unavailable</p>
          <p className="mt-2 text-[13px] text-text-secondary">
            Something went wrong loading your data. Please try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-btn bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            border: '1px solid #E8E7E0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            borderRadius: '16px',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          },
        }}
      />
      <main className="min-h-screen bg-bg-base px-4 py-6 text-text-primary md:px-6 lg:h-screen lg:overflow-hidden lg:px-8 lg:py-6">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:items-stretch">

          {/* Sidebar */}
          <div className="order-1 lg:order-1 lg:h-full">
            <DashboardSidebar monthlySpend={summary.monthlySpend} />
          </div>

          {/* Main content */}
          <section className="scrollbar-hidden order-3 space-y-4 lg:order-2 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2">

            {/* Command center */}
            <section className="rounded-card border border-border bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                  Dashboard
                </p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">
                  {summary.dataSource === 'plaid' ? '● Live data' : '● Demo data'}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-tag border border-border bg-bg-muted p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">
                    Tracked
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-text-primary">
                    {isLoading ? '--' : totalSubscriptions}
                  </p>
                </div>
                <div className="rounded-tag border border-border bg-bg-muted p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">
                    Linked accounts
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-success">
                    {isLoading ? '--' : summary.linkedAccounts}
                  </p>
                </div>
                <div className="rounded-tag border border-border bg-bg-muted p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-muted">
                    Recent charges
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold text-warning">
                    {isLoading ? '--' : summary.recentTransactionCount}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href="/dashboard/connect"
                  className="inline-flex rounded-btn bg-brand px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-brand-dark hover:-translate-y-0.5"
                >
                  Connect another account
                </Link>
              </div>
            </section>

            {/* Shame Score */}
            <ShameScoreMeter
              score={summary.shameScore}
              previousScore={summary.previousShameScore}
              isLoading={isLoading}
            />

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <StatCard
                label="Monthly Spend"
                value={formatCurrency(summary.monthlySpend)}
                variant="danger"
                index={0}
              />
              <StatCard
                label="Unused"
                value={`${summary.unusedCount}`}
                index={1}
              />
              <StatCard
                label="Saveable / yr"
                value={formatCurrency(summary.saveablePerYear)}
                variant="success"
                index={2}
              />
            </div>

            {/* Debrief */}
            <div id="debrief">
              <DebriefPanel
                month={debrief?.month ?? 'APR 2026'}
                isLoading={isDebriefLoading}
                content={debrief?.content ?? null}
                error={!isDebriefLoading && !debrief}
              />
            </div>

            {/* Subscriptions */}
            <section id="subscriptions" className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                  Subscriptions
                </p>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setFilter(option.key)}
                      className={`rounded-pill px-4 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                        filter === option.key
                          ? 'bg-text-primary text-white'
                          : 'border border-border bg-white text-text-secondary hover:border-border-strong hover:text-text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <SubscriptionSkeleton />
              ) : subscriptions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-white py-12 shadow-card">
                  <div className="text-4xl">👻</div>
                  <p className="text-[15px] font-medium text-text-primary">
                    Nothing in the graveyard yet
                  </p>
                  <p className="text-[13px] text-text-secondary">
                    Connect your bank to find subscriptions automatically
                  </p>
                  <Link
                    href="/dashboard/connect"
                    className="mt-2 rounded-btn bg-brand px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-brand-dark"
                  >
                    Connect Bank
                  </Link>
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

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between rounded-card border border-border bg-white px-4 py-3 shadow-card">
                  <span className="text-[13px] text-text-muted">
                    Page {page} of {pageCount} · {totalSubscriptions} total
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="rounded-btn border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition-colors hover:border-border-strong disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pageCount}
                      className="rounded-btn border border-border px-3 py-1.5 text-[13px] font-medium text-text-primary transition-colors hover:border-border-strong disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </section>
          </section>

          {/* Alerts panel */}
          <div id="alerts" className="order-2 lg:order-3 lg:h-full lg:min-h-0">
            <DashboardAlertsPanel alerts={alerts} />
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
