'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Link as LinkIcon, AlertTriangle, Search, Receipt, RefreshCcw, ChevronLeft, ChevronRight, Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

import { fetchCurrentUser, fetchRecentTransactions, searchTransactions } from '@/lib/client/dashboard-api';
import { NotificationsDrawer } from '@/components/features/notifications/NotificationsDrawer';
import { DASHBOARD_FILTER_OPTIONS } from '@/lib/constants/dashboard';
import { formatCurrency, getNameInitials } from '@/lib/utils/format';
import { useDashboardData } from '@/hooks/useDashboardData';
import { interpolateScoreColor } from '@/lib/utils/shameScore';
import { providerCurrency } from '@/lib/utils/provider';
import type { DashboardFilter, DashboardProvider } from '@/types/subscription';
import { SubscriptionRow } from '@/components/features/subscriptions/SubscriptionRow';
import { DashboardSkeleton } from '@/components/features/dashboard/DashboardSkeleton';

// Modular Components
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStats } from './components/DashboardStats';
import { SpendChart } from './components/SpendChart';
import { SavingsInsight } from './components/SavingsInsight';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { TransactionRow } from '@/components/features/transactions/TransactionRow';

const startOfMonth = (date: Date): Date => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getMonthKey = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const [ledgerTab, setLedgerTab] = useState<'subscriptions' | 'transactions'>('subscriptions');
    const [userInitials, setUserInitials] = useState('?');

    const initialProvider = (searchParams.get('provider') as DashboardProvider) || undefined;
    const {
        summary, providers, subscriptions, totalSubscriptions, filterCounts, alerts,
        hasData, isInitialLoading, isLoading, isError, isFetching,
        filter, setFilter, page, pageCount, setPage, refetch,
        cancelSubscription, undoCancel, clearPendingUndo, pendingUndoId, isCancelling,
        search, setSearch
    } = useDashboardData({
        initialFilter: (searchParams.get('filter') as DashboardFilter) || 'all',
        initialPage: Number(searchParams.get('page')) || 1,
        provider: initialProvider,
    });

    // Debounce local search state to hook's search state
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, setSearch]);

    useEffect(() => {
        fetchCurrentUser().then(u => setUserInitials(getNameInitials(u.name || ''))).catch(() => { });
    }, []);

    // Auto-dismiss undo toast after 5 seconds
    useEffect(() => {
        if (!pendingUndoId) return;
        const timeoutId = setTimeout(() => clearPendingUndo(), 5000);
        return () => clearTimeout(timeoutId);
    }, [pendingUndoId, clearPendingUndo]);

    const { data: txData, isLoading: lux, isError: erx, isFetching: fex, refetch: rex } = useQuery({
        queryKey: ['dashboard-transactions', providers.active, search],
        queryFn: () => search
            ? searchTransactions(search, 365, providers.active || undefined)
            : fetchRecentTransactions(365, providers.active || undefined),
        enabled: !!providers.active,
    });

    const chartData = useMemo(() => {
        if (!txData) return [];
        const spendByMonth = new Map<string, number>();
        txData.transactions.forEach(t => {
            if (t.amount <= 0) return;
            const key = getMonthKey(startOfMonth(new Date(t.date)));
            spendByMonth.set(key, (spendByMonth.get(key) || 0) + t.amount);
        });
        const now = startOfMonth(new Date());
        return Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            const key = getMonthKey(d);
            return { name: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), spend: spendByMonth.get(key) || 0 };
        });
    }, [txData]);

    const currency = providerCurrency(providers.active || initialProvider);
    const strokeDashoffset = 125.6 * (1 - summary.shameScore / 100);
    const scoreAngle = (summary.shameScore / 100) * Math.PI * 2 - Math.PI / 2;

    const prevSpend = chartData.slice(0, 6).reduce((a, b) => a + b.spend, 0);
    const currSpend = chartData.slice(6).reduce((a, b) => a + b.spend, 0);
    const spendDelta = currSpend - prevSpend;
    const spendDeltaPercent = prevSpend > 0 ? Math.round((spendDelta / prevSpend) * 100) : 0;

    if (isInitialLoading) return <DashboardSkeleton />;

    return (
        <div className="space-y-6">
            <NotificationsDrawer
                isOpen={isAlertsOpen}
                alerts={alerts}
                onClose={() => setIsAlertsOpen(false)}
            />
        </div>
                                                </div >
                                            ))
}
                                        </div >
                                    ) : (
    <div className="flex flex-col items-center justify-center h-40 text-center text-text-muted space-y-2">
        <Bell size={32} className="opacity-20" />
        <p className="text-sm">No new notifications</p>
    </div>
)}
                                </div >
                            </div >
                        </motion.div >
                    </>
                )}
            </AnimatePresence >
    { isError && <Badge variant="warning" className="w-full justify-center py-2 h-auto">Using offline snapshot data</Badge>}

            <DashboardHeader alertsCount={alerts.length} onOpenAlerts={() => setIsAlertsOpen(true)} userInitials={userInitials} />

            <DashboardStats
                summary={summary} totalSubscriptions={totalSubscriptions} activeFilterCount={filterCounts.active}
                providers={providers} currency={currency} scoreColor={interpolateScoreColor(summary.shameScore)}
                strokeDashoffset={strokeDashoffset} dialX={22 + 20 * Math.cos(scoreAngle)} dialY={22 + 20 * Math.sin(scoreAngle)}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <SpendChart
                    monthlySpend={summary.monthlySpend} currency={currency} previousPeriodSpend={prevSpend}
                    currentPeriodSpend={currSpend} spendDelta={spendDelta} spendDeltaPercent={spendDeltaPercent}
                    chartData={chartData} isLoading={lux} isError={erx} isFetching={fex} onRetry={rex}
                />
                <SavingsInsight
                    unusedCount={summary.unusedCount} saveablePerYear={summary.saveablePerYear}
                    currency={currency} onFilterUnused={() => setFilter('unused')}
                />
            </div>

            <DataTable
                className="overflow-hidden p-0"
                data={ledgerTab === 'subscriptions'
                    ? subscriptions
                    : (txData?.transactions.slice(0, 8) || [])
                }
                isLoading={ledgerTab === 'subscriptions' ? (isLoading || isFetching) : (lux || fex)}
                isError={ledgerTab === 'subscriptions' ? isError : erx}
                onRetry={ledgerTab === 'subscriptions' ? refetch : rex}
                header={
                    <div className="border-b border-border">
                        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex gap-1 bg-bg-muted p-1 rounded-full">
                                    {(['subscriptions', 'transactions'] as const).map(t => (
                                        <Button key={t} variant={ledgerTab === t ? 'primary' : 'ghost'} size="sm" className="rounded-full px-5 uppercase text-[10px] tracking-widest font-bold" onClick={() => setLedgerTab(t)}>
                                            {t}
                                        </Button>
                                    ))}
                                </div>

                                {providers.hasBoth && (
                                    <div className="flex gap-1 bg-bg-muted p-1 rounded-full">
                                        {providers.connected.map((p: DashboardProvider) => (
                                            <Button
                                                key={p} size="sm" variant={providers.active === p ? 'primary' : 'ghost'}
                                                className="rounded-full px-4 uppercase text-[10px] tracking-widest font-bold"
                                                onClick={() => {
                                                    const params = new URLSearchParams(searchParams.toString());
                                                    params.set('provider', p);
                                                    window.history.replaceState(null, '', `?${params.toString()}`);
                                                    window.location.reload(); // Quickest way to sync providers for now
                                                }}
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative w-full sm:w-64 h-10 group">
                                <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none z-10">
                                    <Search size={16} className="text-text-muted transition-colors group-focus-within:text-brand" />
                                </div>
                                <Input
                                    className="pl-10 h-full w-full"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {ledgerTab === 'subscriptions' && (
                            <div className="h-14 flex items-center gap-2 px-6 border-t border-border bg-bg-muted/10">
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
                                    {DASHBOARD_FILTER_OPTIONS.map(f => (
                                        <button
                                            key={f.key} onClick={() => setFilter(f.key)}
                                            className={`h-8 px-4 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all ${filter === f.key ? 'bg-brand text-white shadow-sm' : 'bg-bg-muted text-text-secondary border border-border-strong hover:bg-bg-subtle'}`}
                                        >
                                            {f.label} ({filterCounts[f.key]})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                }
                renderItem={(item, i) => {
                    if (ledgerTab === 'subscriptions') {
                        return <SubscriptionRow key={(item as any).id} subscription={item as any} onCancel={cancelSubscription} index={i} />;
                    }
                    return <TransactionRow key={(item as any).transaction_id} transaction={item as any} currency={currency} index={i} />;
                }}
                showDivider={ledgerTab === 'transactions'}
                itemsClassName={ledgerTab === 'subscriptions' ? "p-6 space-y-4" : ""}
                pagination={ledgerTab === 'subscriptions' ? {
                    page,
                    pageCount,
                    onPageChange: (p) => setPage(p)
                } : undefined}
            />

            <AnimatePresence>
                {pendingUndoId && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed bottom-6 left-1/2 z-50"
                    >
                        <Card className="bg-text-primary text-white border-none shadow-2xl p-4 flex items-center gap-6">
                            <span className="text-sm">Subscription cancelled.</span>
                            <Button variant="secondary" size="sm" className="bg-white text-text-primary border-none" onClick={undoCancel} disabled={isCancelling}>
                                {isCancelling ? <span className="animate-pulse">Undoing...</span> : 'Undo'}
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
