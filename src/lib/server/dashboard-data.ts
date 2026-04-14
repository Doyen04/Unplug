import type {
    DashboardFilter,
    DashboardSummary,
    DashboardAlert,
    Subscription,
} from '../../types/subscription';
import { calculateUsageScore } from '../usage-signals/calculateUsageScore';
import {
    listConnectedAccountsByUser,
    markConnectedAccountAuthStatus,
} from './connected-accounts-store';
import { decryptToken } from './token-crypto';
import {
    readStoredSubscriptions,
    writeStoredSubscriptions,
    type StoredSubscription,
} from './subscriptions-store';
import { writeFile } from 'fs/promises';
import path from 'path';

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
        counts: {
            all: number;
            active: number;
            unused: number;
            'at-risk': number;
            cancelled: number;
        };
    };
}

interface DashboardQueryOptions {
    filter?: DashboardFilter;
    page?: number;
    pageSize?: number;
    userId?: string;
}

interface PlaidTransaction {
    transaction_id: string;
    name: string;
    amount: number;
    date: string;
    merchant_name: string | null;
    category: string[] | null;
}

interface PlaidSnapshot {
    linkedAccounts: number;
    transactions: PlaidTransaction[];
    noAccount?: boolean;
}

const PLAID_BASE_URLS: Record<string, string> = {
    sandbox: 'https://sandbox.plaid.com',
    development: 'https://development.plaid.com',
    production: 'https://production.plaid.com',
};

const RECONNECT_ERROR_CODES = new Set(['INVALID_ACCESS_TOKEN', 'ITEM_LOGIN_REQUIRED']);

const isoDateDaysAgo = (days: number): string => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeMerchantLabel = (transaction: PlaidTransaction): string => {
    const raw = (transaction.merchant_name ?? transaction.name ?? 'Unknown service').trim();
    return raw.replace(/\s+/g, ' ');
};

const toMerchantKey = (label: string): string =>
    label
        .toLowerCase()
        .replace(/[^a-z0-9 ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const daysBetween = (a: string, b: string): number => {
    const first = new Date(a).getTime();
    const second = new Date(b).getTime();
    return Math.abs(Math.round((first - second) / (1000 * 60 * 60 * 24)));
};

const average = (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const median = (values: number[]): number => {
    if (values.length === 0) return 30;
    const sorted = [...values].sort((a, b) => a - b);
    const center = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[center - 1] + sorted[center]) / 2;
    }
    return sorted[center];
};

const detectFrequency = (medianGapDays: number): Subscription['frequencyLabel'] => {
    if (medianGapDays <= 10) return 'weekly';
    if (medianGapDays >= 300) return 'yearly';
    return 'monthly';
};

const resolveStatusAndAlert = (
    verdict: Subscription['verdict'],
    transactions: PlaidTransaction[]
): Pick<Subscription, 'status' | 'alert'> => {
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    const recentAmounts = sorted.slice(0, 2).map((item) => item.amount);
    const priorAmounts = sorted.slice(2, 4).map((item) => item.amount);

    const recentAverage = average(recentAmounts);
    const priorAverage = average(priorAmounts);

    if (priorAverage > 0 && recentAverage >= priorAverage * 1.15) {
        const increase = recentAverage - priorAverage;
        return {
            status: 'price-hike',
            alert: {
                type: 'price-hike',
                message: `Up $${increase.toFixed(2)} vs prior charges`,
            },
        };
    }

    if (verdict === 'unused') {
        const newestDate = sorted[0]?.date ?? null;
        const dormantDays = newestDate ? daysBetween(newestDate, new Date().toISOString().slice(0, 10)) : 30;
        return {
            status: 'unused',
            alert: {
                type: 'unused',
                message: `No meaningful usage signals in ${dormantDays} days`,
            },
        };
    }

    if (verdict === 'likely_unused') {
        return {
            status: 'healthy',
            alert: {
                type: 'dormant',
                message: 'Likely unused based on transaction cadence',
            },
        };
    }

    return { status: 'healthy' };
};

const buildDetectedSubscription = (
    merchantKey: string,
    merchantLabel: string,
    transactions: PlaidTransaction[]
): Subscription => {
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    const gaps: number[] = [];

    for (let index = 0; index < sorted.length - 1; index += 1) {
        gaps.push(daysBetween(sorted[index].date, sorted[index + 1].date));
    }

    const medianGap = median(gaps);
    const frequencyLabel = detectFrequency(medianGap);

    const baselineAmount = average(sorted.slice(0, 3).map((item) => item.amount));
    const amountMonthly =
        frequencyLabel === 'weekly'
            ? baselineAmount * 4.33
            : frequencyLabel === 'yearly'
                ? baselineAmount / 12
                : baselineAmount;

    const newestDate = sorted[0]?.date ?? new Date().toISOString().slice(0, 10);
    const lastSeenDays = daysBetween(newestDate, new Date().toISOString().slice(0, 10));

    const variability = gaps.length > 1
        ? Math.sqrt(average(gaps.map((gap) => (gap - average(gaps)) ** 2)))
        : 0;
    const cadenceRegularity = gaps.length > 0
        ? clamp(Math.round(100 - (variability / Math.max(average(gaps), 1)) * 100), 10, 100)
        : 60;

    const usageSignals = calculateUsageScore({
        transactionGap: clamp(100 - lastSeenDays * 2.5, 0, 100),
        emailSignal: clamp(sorted.length * 18, 10, 100),
        appInstalled: 60,
        userCheckin: cadenceRegularity,
        secondaryActivity: sorted.some((item) => (item.category ?? []).length > 0) ? 70 : 45,
    });

    const statusAndAlert = resolveStatusAndAlert(usageSignals.verdict, sorted);
    const safeMerchantKey = merchantKey.replace(/\s+/g, '-');

    return {
        id: `plaid-${safeMerchantKey}`,
        serviceName: merchantLabel,
        amountMonthly: Number(amountMonthly.toFixed(2)),
        frequencyLabel,
        status: statusAndAlert.status,
        confidence: usageSignals.confidence,
        usageScore: usageSignals.score,
        verdict: usageSignals.verdict,
        ...(statusAndAlert.alert ? { alert: statusAndAlert.alert } : {}),
    };
};

const detectSubscriptionsFromTransactions = (transactions: PlaidTransaction[]): Subscription[] => {
    const recurringCandidates = transactions.filter((item) => item.amount > 0);
    const grouped = new Map<string, { label: string; transactions: PlaidTransaction[] }>();

    for (const transaction of recurringCandidates) {
        const label = normalizeMerchantLabel(transaction);
        const merchantKey = toMerchantKey(label);

        if (!merchantKey) continue;

        const existing = grouped.get(merchantKey);
        if (!existing) {
            grouped.set(merchantKey, { label, transactions: [transaction] });
            continue;
        }

        existing.transactions.push(transaction);
    }

    return Array.from(grouped.entries())
        .filter(([, group]) => group.transactions.length >= 2)
        .map(([merchantKey, group]) => buildDetectedSubscription(merchantKey, group.label, group.transactions))
        .sort((a, b) => b.amountMonthly - a.amountMonthly)
        .slice(0, 40);
};

const mergeDetectedWithStored = (
    detected: Subscription[],
    stored: StoredSubscription[]
): StoredSubscription[] => {
    const storedById = new Map(stored.map((item) => [item.id, item]));

    const merged: StoredSubscription[] = detected.map((item) => {
        const existing = storedById.get(item.id);

        if (existing?.status === 'cancelled') {
            return {
                ...item,
                status: 'cancelled',
                previousStatus:
                    existing.previousStatus
                    ?? (item.status === 'cancelled' ? 'healthy' : item.status),
            };
        }

        return {
            ...item,
            previousStatus: existing?.previousStatus,
        };
    });

    const staleCancelled = stored.filter(
        (item) => item.status === 'cancelled' && !merged.some((nextItem) => nextItem.id === item.id)
    );

    return [...merged, ...staleCancelled];
};

const fetchPlaidSnapshot = async (userId: string): Promise<PlaidSnapshot | null> => {
    const userAccounts = await listConnectedAccountsByUser(userId);
    const plaidAccounts = userAccounts.filter((item) => item.provider === 'plaid');
    const plaidAccount = plaidAccounts.find((item) => item.encryptedAccessToken) ?? plaidAccounts[0];

    // If the user has not connected any Plaid account, return a marker object
    if (plaidAccounts.length === 0 || !plaidAccount) {
        return { linkedAccounts: 0, transactions: [], noAccount: true };
    }

    if (!plaidAccount.encryptedAccessToken) {
        return null;
    }

    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const envName = process.env.PLAID_ENV ?? 'sandbox';
    const baseUrl = PLAID_BASE_URLS[envName] ?? PLAID_BASE_URLS.sandbox;

    if (!clientId || !secret) {
        return null;
    }

    let accessToken = '';
    try {
        accessToken = decryptToken(plaidAccount.encryptedAccessToken);
    } catch {
        return null;
    }

    const accountsResponse = await fetch(`${baseUrl}/accounts/get`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            secret,
            access_token: accessToken,
        }),
        cache: 'no-store',
    });

    if (!accountsResponse.ok) {
        const payload = (await accountsResponse.json().catch(() => null)) as { error_code?: string } | null;
        const errorCode = payload?.error_code;
        if (errorCode && RECONNECT_ERROR_CODES.has(errorCode)) {
            await markConnectedAccountAuthStatus(userId, 'plaid', plaidAccount.accountRef, 'reconnect_required');
        }
        return null;
    }

    const transactionsResponse = await fetch(`${baseUrl}/transactions/get`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            secret,
            access_token: accessToken,
            start_date: isoDateDaysAgo(90),
            end_date: new Date().toISOString().slice(0, 10),
            options: {
                count: 250,
                offset: 0,
            },
        }),
        cache: 'no-store',
    });

    if (!transactionsResponse.ok) {
        const payload = (await transactionsResponse.json().catch(() => null)) as { error_code?: string } | null;
        const errorCode = payload?.error_code;
        if (errorCode && RECONNECT_ERROR_CODES.has(errorCode)) {
            await markConnectedAccountAuthStatus(userId, 'plaid', plaidAccount.accountRef, 'reconnect_required');
        }
        return null;
    }

    await markConnectedAccountAuthStatus(userId, 'plaid', plaidAccount.accountRef, 'active');

    const accountsPayload = (await accountsResponse.json()) as {
        accounts: Array<{ account_id: string }>;
    };

    const transactionsPayload = (await transactionsResponse.json()) as {
        transactions: PlaidTransaction[];
    };

    // Write fetched transactions to a text file for inspection
    try {
        const outPath = path.resolve(process.cwd(), 'data', `plaid-transactions-${userId}.txt`);
        const content = [
            `Plaid Snapshot for user: ${userId}`,
            `Fetched at: ${new Date().toISOString()}`,
            `Connected Plaid records: ${plaidAccounts.length}`,
            `Plaid API accounts returned: ${accountsPayload.accounts.length}`,
            'Transactions:',
            JSON.stringify(transactionsPayload.transactions, null, 2),
        ].join('\n\n');
        await writeFile(outPath, content, 'utf8');
    } catch {
        // ignore file write errors - we still return the snapshot
    }

    return {
        linkedAccounts: plaidAccounts.length,
        transactions: transactionsPayload.transactions,
    };
};

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
    const plaidSnapshot = options.userId ? await fetchPlaidSnapshot(options.userId) : null;

    // If the user has not connected any Plaid account, return empty dashboard
    if (options.userId && plaidSnapshot?.noAccount) {
        const summary: DashboardSummary = {
            monthlySpend: 0,
            unusedCount: 0,
            saveablePerYear: 0,
            shameScore: 0,
            previousShameScore: 0,
            linkedAccounts: 0,
            recentTransactionCount: 0,
            dataSource: 'seeded',
        };

        const page = 1;
        return {
            summary,
            subscriptions: [],
            alerts: [],
            pagination: {
                filter,
                page,
                pageSize,
                pageCount: 1,
                total: 0,
                counts: {
                    all: 0,
                    active: 0,
                    unused: 0,
                    'at-risk': 0,
                    cancelled: 0,
                },
            },
        };
    }

    const detectedSubscriptions = plaidSnapshot
        ? detectSubscriptionsFromTransactions(plaidSnapshot.transactions)
        : [];

    const effectiveStoredSubscriptions = detectedSubscriptions.length > 0
        ? mergeDetectedWithStored(detectedSubscriptions, storedSubscriptions)
        : storedSubscriptions;

    if (detectedSubscriptions.length > 0) {
        await writeStoredSubscriptions(effectiveStoredSubscriptions);
    }

    const subscriptions: Subscription[] = effectiveStoredSubscriptions.map(({ previousStatus, ...item }) => item);
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
        linkedAccounts: plaidSnapshot?.linkedAccounts ?? 0,
        recentTransactionCount: plaidSnapshot?.transactions.length ?? 0,
        dataSource: detectedSubscriptions.length > 0 ? 'plaid' : 'seeded',
    };

    const alerts: DashboardAlert[] = subscriptions
        .filter((item) => item.alert && item.status !== 'cancelled')
        .map((item) => ({
            id: item.id,
            type: item.alert!.type,
            label: `${item.serviceName}: ${item.alert!.message}`,
        }));

    const counts = {
        all: subscriptions.length,
        active: applyFilter(subscriptions, 'active').length,
        unused: applyFilter(subscriptions, 'unused').length,
        'at-risk': applyFilter(subscriptions, 'at-risk').length,
        cancelled: applyFilter(subscriptions, 'cancelled').length,
    };

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
            counts,
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
