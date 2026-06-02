import type { DashboardProvider } from '@/types/subscription';

export const providerCurrency = (provider: DashboardProvider | 'none' | null | undefined): string =>
  provider === 'mono' ? 'NGN' : 'USD';
