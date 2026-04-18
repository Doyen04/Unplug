import type { DashboardProvider } from '../../types/subscription';

export const providerLabel = (provider: DashboardProvider): string =>
  provider === 'plaid' ? 'Plaid' : 'Mono';

export const providerCurrency = (provider: DashboardProvider | 'none' | null | undefined): string =>
  provider === 'mono' ? 'NGN' : 'USD';
