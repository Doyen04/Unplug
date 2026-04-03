import type {
    DashboardFilter,
    DashboardSummary,
    DashboardAlert,
    Subscription,
    SubscriptionStatus,
} from '../../types/subscription';

interface StoredSubscription extends Subscription {
    previousStatus?: Exclude<SubscriptionStatus, 'cancelled'>;
}

let subscriptionsStore: StoredSubscription[] = [
    {
        id: 's-1',
        serviceName: 'Netflix',
        amountMonthly: 19,
        frequencyLabel: 'monthly',
        status: 'unused',
        confidence: 'high',
        usageScore: 18,
        verdict: 'unused',
        alert: { type: 'unused', message: 'No usage signals in 45 days' },
    },
    {
        id: 's-2',
        serviceName: 'Spotify',
        amountMonthly: 12,
        frequencyLabel: 'monthly',
        status: 'healthy',
        confidence: 'high',
        usageScore: 84,
        verdict: 'active',
    },
    {
        id: 's-3',
        serviceName: 'Notion',
        amountMonthly: 15,
        frequencyLabel: 'monthly',
        status: 'price-hike',
        confidence: 'medium',
        usageScore: 62,
        verdict: 'likely_unused',
        alert: { type: 'price-hike', message: 'Up $2.00 vs last month' },
    },
    {
        id: 's-4',
        serviceName: 'Duolingo',
        amountMonthly: 13,
        frequencyLabel: 'monthly',
        status: 'trial-ending',
        confidence: 'medium',
        usageScore: 50,
        verdict: 'likely_unused',
        alert: { type: 'trial-ending', message: 'Trial converts in 2 days' },
    },
    {
        id: 's-5',
        serviceName: 'YouTube Premium',
        amountMonthly: 14,
        frequencyLabel: 'monthly',
        status: 'healthy',
        confidence: 'high',
        usageScore: 76,
        verdict: 'active',
    },
    {
        id: 's-6',
        serviceName: 'Adobe CC',
        amountMonthly: 61,
        frequencyLabel: 'monthly',
        status: 'unused',
        confidence: 'medium',
        usageScore: 28,
        verdict: 'unused',
        alert: { type: 'dormant', message: 'Likely unused based on recent signals' },
    },
];

export interface DashboardPayload {
    summary: DashboardSummary;
    subscriptions: Subscription[];
    alerts: DashboardAlert[];
    pagination: {
        filter: DashboardFilter;
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
}

interface DashboardQueryOptions {
    filter?: DashboardFilter;
    page?: number;
    pageSize?: number;
}

const applyFilter = (subscriptions: Subscription[], filter: DashboardFilter): Subscription[] => {
    if (filter === 'all') return subscriptions;
    if (filter === 'cancelled') return subscriptions.filter((item) => item.status === 'cancelled');
    if (filter === 'active') {
        return subscriptions.filter((item) => item.verdict === 'active' && item.status !== 'cancelled');
    }
    if (filter === 'unused') {
        return subscriptions.filter((item) => item.status === 'unused' || item.verdict === 'unused');
    }
    return subscriptions.filter(
        (item) =>
            item.status === 'trial-ending' || item.status === 'price-hike' || item.verdict === 'likely_unused'
    );
};

export const getDashboardPayload = (options: DashboardQueryOptions = {}): DashboardPayload => {
    const filter = options.filter ?? 'all';
    const pageSize = Math.min(20, Math.max(1, options.pageSize ?? 4));
    const requestedPage = Math.max(1, options.page ?? 1);

    const subscriptions: Subscription[] = subscriptionsStore.map(({ previousStatus, ...item }) => item);
    const filteredSubscriptions = applyFilter(subscriptions, filter);
    const total = filteredSubscriptions.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const start = (page - 1) * pageSize;
    const pagedSubscriptions = filteredSubscriptions.slice(start, start + pageSize);

    const monthlySpend = subscriptions
        .filter((item) => item.status !== 'cancelled')
        .reduce((sum, item) => sum + item.amountMonthly, 0);

    const unusedCount = subscriptions.filter(
        (item) => item.status === 'unused' || item.verdict === 'unused'
    ).length;

    const saveablePerYear = subscriptions
        .filter((item) => item.status === 'unused')
        .reduce((sum, item) => sum + item.amountMonthly * 12, 0);

    const shameScore = Math.min(100, Math.max(0, 100 - Math.round(monthlySpend * 0.75)));

    const summary: DashboardSummary = {
        monthlySpend,
        unusedCount,
        saveablePerYear,
        shameScore,
        previousShameScore: Math.min(100, shameScore + 8),
    };

    const alerts: DashboardAlert[] = subscriptions
        .filter((item) => item.alert && item.status !== 'cancelled')
        .map((item) => ({
            id: item.id,
            type: item.alert!.type,
            label: `${item.serviceName}: ${item.alert!.message}`,
        }));

    return {
        summary,
        subscriptions: pagedSubscriptions,
        alerts,
        pagination: {
            filter,
            page,
            pageSize,
            pageCount,
            total,
        },
    };
};

export const cancelSubscriptionById = (id: string): Subscription | null => {
    const target = subscriptionsStore.find((item) => item.id === id);
    if (!target) return null;
    if (target.status !== 'cancelled') {
        target.previousStatus = target.status;
        target.status = 'cancelled';
    }
    return { ...target };
};

export const undoCancelSubscriptionById = (id: string): Subscription | null => {
    const target = subscriptionsStore.find((item) => item.id === id);
    if (!target) return null;
    if (target.status === 'cancelled') {
        target.status = target.previousStatus ?? 'healthy';
        target.previousStatus = undefined;
    }
    return { ...target };
};
