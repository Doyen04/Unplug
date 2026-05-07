/**
 * React Query key factory for type-safe and cache-friendly query keys
 * Centralizes all query key definitions to prevent mismatches
 */

import type { DashboardFilter, DashboardProvider } from '@/types/subscription';

export const dashboardKeys = {
    all: ['dashboard'] as const,
    payloads: () => [...dashboardKeys.all, 'payloads'] as const,
    payload: (filter: DashboardFilter, page?: number, provider?: DashboardProvider, search?: string) =>
        [...dashboardKeys.payloads(), { filter, page, provider, search }] as const,

    transactions: () => [...dashboardKeys.all, 'transactions'] as const,
    transactionsList: (provider?: DashboardProvider, search?: string) =>
        [...dashboardKeys.transactions(), { provider, search }] as const,

    debrief: () => [...dashboardKeys.all, 'debrief'] as const,

    user: () => ['user'] as const,
    userProfile: () => [...dashboardKeys.user(), 'profile'] as const,
    userSettings: () => [...dashboardKeys.user(), 'settings'] as const,

    accounts: () => ['accounts'] as const,
    connectedAccounts: () => [...dashboardKeys.accounts(), 'connected'] as const,
} as const;
