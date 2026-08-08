import type { DashboardProvider } from '@/types/subscription';

export const providerCurrency = (provider: DashboardProvider | 'none' | null | undefined): string =>
  provider === 'mono' ? 'NGN' : 'USD';

/**
 * Currency for a subscription addressed by its provider-scoped synthetic id
 * (`mono-netflix`, `plaid-spotify`) rather than by a provider value.
 *
 * This is the same rule as providerCurrency — Mono is the Nigerian provider so
 * its charges are NGN, everything else is USD — reached from the other side.
 * Dashboard surfaces only have the synthetic id on hand, not the provider, so
 * they derive it from the prefix. Defined in terms of providerCurrency so the
 * two can never drift.
 */
export const currencyForSubscriptionId = (subscriptionId: string): string =>
  providerCurrency(subscriptionId.startsWith('mono-') ? 'mono' : 'plaid');

/**
 * Display name for a provider. Takes a plain string rather than
 * DashboardProvider because DashboardStats receives it already widened.
 */
export const providerLabel = (provider: string): string =>
  provider === 'plaid' ? 'Plaid' : 'Mono';
