'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Link as LinkIcon, AlertTriangle, Search, Receipt, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { fetchCurrentUser, fetchRecentTransactions } from '@/lib/client/dashboard-api';
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
        cancelSubscription, undoCancel, clearPendingUndo, pendingUndoId, isCancelling
    } = useDashboardData({
        initialFilter: (searchParams.get('filter') as DashboardFilter) || 'all',
        initialPage: Number(searchParams.get('page')) || 1,
        provider: initialProvider,
    });

    useEffect(() => {
        fetchCurrentUser().then(u => setUserInitials(getNameInitials(u.name || ''))).catch(() => { });
    }, []);

    const { data: txData, isLoading: lux, isError: erx, isFetching: fex, refetch: rex } = useQuery({
        queryKey: ['dashboard-transactions', providers.active],
        queryFn: () => fetchRecentTransactions(365, providers.active || undefined),
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
            return { name: d.toLocaleDateString('en-US', { month: 'short' }), spend: spendByMonth.get(key) || 0 };
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
            {isError && <Badge variant="warning" className="w-full justify-center py-2 h-auto">Using offline snapshot data</Badge>}

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

            <Card className="overflow-hidden p-0">
                <div className="border-b border-border p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-1 bg-bg-muted p-1 rounded-full">
                        {(['subscriptions', 'transactions'] as const).map(t => (
                            <Button key={t} variant={ledgerTab === t ? 'primary' : 'ghost'} size="sm" className="rounded-full px-5 uppercase text-[10px] tracking-widest font-bold" onClick={() => setLedgerTab(t)}>
                                {t}
                            </Button>
                        ))}
                    </div>
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-3 text-text-muted" />
                        <input
                            className="w-full bg-bg-base border border-border-strong rounded-btn py-2 pl-10 pr-4 text-sm"
                            placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>


                {ledgerTab === 'subscriptions' ? (
                    <div className="space-y-0">
                        <div className="h-14 flex items-center gap-2 px-6 border-b border-border bg-bg-muted/10">
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
                        <div className="p-6 space-y-4">
                            {subscriptions.filter(s => s.serviceName.toLowerCase().includes(searchQuery.toLowerCase())).map((s, i) => (
                                <SubscriptionRow key={s.id} subscription={s} onCancel={cancelSubscription} index={i} />
                            ))}
                            {pageCount > 1 && (
                                <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Page {page} / {pageCount}</span>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18} className="text-text-primary" /></Button>
                                        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full" disabled={page === pageCount} onClick={() => setPage(page + 1)}><ChevronRight size={18} className="text-text-primary" /></Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {txData?.transactions.slice(0, 8).map(tx => (
                            <div key={tx.transaction_id} className="flex justify-between py-4 group">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-text-primary text-white"><Receipt size={16} /></div>
                                    <div>
                                        <p className="text-sm font-bold">{tx.merchant_name || tx.name}</p>
                                        <p className="text-[10px] text-text-muted uppercase font-bold">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right tabular-nums">
                                    <p className="text-sm font-bold">{formatCurrency(tx.amount, currency)}</p>
                                    <Badge variant={tx.amount > 0 ? 'warning' : 'success'}>{tx.amount > 0 ? 'Outflow' : 'Inflow'}</Badge>
                                </div>
                            </div>
                        ))}
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
