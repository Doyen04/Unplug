import type {
    DashboardFilter,
    DashboardPayload,
    DashboardProvider,
} from '../../types/subscription';

export interface DashboardDebrief {
    month: string;
    content: string;
}

export interface PlaidTransaction {
    transaction_id: string;
    name: string;
    amount: number;
    date: string;
    merchant_name: string | null;
    iso_currency_code?: string | null;
    category: string[] | null;
}

export interface TransactionsPayload {
    provider?: DashboardProvider;
    total: number;
    page?: number;
    pageSize?: number;
    pageCount?: number;
    transactions: PlaidTransaction[];
}

export interface UserPayload {
    name?: string;
}

interface DashboardRequest {
    filter: DashboardFilter;
    page: number;
    pageSize: number;
    provider?: DashboardProvider;
}

export const fetchDashboardPayload = async ({
    filter,
    page,
    pageSize,
    provider,
}: DashboardRequest): Promise<DashboardPayload> => {
    const query = new URLSearchParams({
        filter,
        page: String(page),
        pageSize: String(pageSize),
    });

    if (provider) {
        query.set('provider', provider);
    }

    const response = await fetch(`/api/dashboard?${query.toString()}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to load dashboard data');
    }

    return (await response.json()) as DashboardPayload;
};

export const fetchDashboardDebrief = async (): Promise<DashboardDebrief> => {
    const response = await fetch('/api/debrief', { cache: 'no-store' });

    if (!response.ok) {
        throw new Error('Failed to load debrief');
    }

    return (await response.json()) as DashboardDebrief;
};

export const postCancelSubscription = async (id: string): Promise<void> => {
    const response = await fetch(`/api/subscriptions/${id}/cancel`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to cancel subscription');
    }
};

export const postUndoSubscription = async (id: string): Promise<void> => {
    const response = await fetch(`/api/subscriptions/${id}/undo`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to undo cancellation');
    }
};

const buildTransactionsUrl = (
    days: number,
    provider?: DashboardProvider,
    page?: number,
    pageSize?: number
): string => {
    const query = new URLSearchParams({ days: String(days) });

    if (provider) {
        query.set('provider', provider);
    }

    if (page) {
        query.set('page', String(page));
    }

    if (pageSize) {
        query.set('pageSize', String(pageSize));
    }

    return `/api/connect/plaid/transactions?${query.toString()}`;
};

export const fetchRecentTransactions = async (
    days = 60,
    provider?: DashboardProvider
): Promise<TransactionsPayload> => {
    const pageSize = 100;
    const maxPages = 25;
    const allTransactions: PlaidTransaction[] = [];

    let page = 1;
    let pageCount = 1;
    let total = 0;

    do {
        const response = await fetch(buildTransactionsUrl(days, provider, page, pageSize), {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to load transactions');
        }

        const payload = (await response.json()) as TransactionsPayload;

        if (page === 1) {
            total = payload.total;
            pageCount = Math.max(1, payload.pageCount ?? 1);
        }

        allTransactions.push(...payload.transactions);
        page += 1;
    } while (page <= pageCount && page <= maxPages);

    const dedupedTransactions = Array.from(
        new Map(allTransactions.map((transaction) => [transaction.transaction_id, transaction])).values()
    ).sort((a, b) => b.date.localeCompare(a.date));

    return {
        total: total || dedupedTransactions.length,
        transactions: dedupedTransactions,
    };
};

export const fetchCurrentUser = async (): Promise<UserPayload> => {
    const response = await fetch('/api/user', { cache: 'no-store' });

    if (!response.ok) {
        throw new Error('Failed to load user');
    }

    return (await response.json()) as UserPayload;
};
