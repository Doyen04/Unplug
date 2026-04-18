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
    category: string[] | null;
}

export interface TransactionsPayload {
    total: number;
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

export const fetchRecentTransactions = async (
    days = 60,
    provider?: DashboardProvider
): Promise<TransactionsPayload> => {
    const query = new URLSearchParams({ days: String(days) });
    if (provider) {
        query.set('provider', provider);
    }

    const response = await fetch(`/api/connect/plaid/transactions?${query.toString()}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to load transactions');
    }

    return (await response.json()) as TransactionsPayload;
};

export const fetchCurrentUser = async (): Promise<UserPayload> => {
    const response = await fetch('/api/user', { cache: 'no-store' });

    if (!response.ok) {
        throw new Error('Failed to load user');
    }

    return (await response.json()) as UserPayload;
};
