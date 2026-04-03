import type {
    DashboardFilter,
    DashboardSummary,
    DashboardAlert,
    Subscription,
} from '../../types/subscription';
import {
    readStoredSubscriptions,
    writeStoredSubscriptions,
    type StoredSubscription,
} from './subscriptions-store';

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

export const getDashboardPayload = async (
    options: DashboardQueryOptions = {}
): Promise<DashboardPayload> => {
    const filter = options.filter ?? 'all';
    const pageSize = Math.min(20, Math.max(1, options.pageSize ?? 4));
    const requestedPage = Math.max(1, options.page ?? 1);

    const storedSubscriptions = await readStoredSubscriptions();
    const subscriptions: Subscription[] = storedSubscriptions.map(({ previousStatus, ...item }) => item);
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

export const cancelSubscriptionById = async (id: string): Promise<Subscription | null> => {
    const subscriptionsStore = await readStoredSubscriptions();
    const target = subscriptionsStore.find((item) => item.id === id);
    if (!target) return null;
    if (target.status !== 'cancelled') {
        target.previousStatus = target.status;
        target.status = 'cancelled';
        await writeStoredSubscriptions(subscriptionsStore);
    }
    return { ...target };
};

export const undoCancelSubscriptionById = async (id: string): Promise<Subscription | null> => {
    const subscriptionsStore = await readStoredSubscriptions();
    const target = subscriptionsStore.find((item) => item.id === id);
    if (!target) return null;
    if (target.status === 'cancelled') {
        target.status = target.previousStatus ?? 'healthy';
        target.previousStatus = undefined;
        await writeStoredSubscriptions(subscriptionsStore);
    }
    return { ...target };
};
