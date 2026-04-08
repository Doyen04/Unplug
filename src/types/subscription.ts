export type SubscriptionStatus =
  | 'unused'
  | 'trial-ending'
  | 'price-hike'
  | 'healthy'
  | 'cancelled';

export type UsageConfidence = 'high' | 'medium' | 'low';

export type UsageVerdict = 'active' | 'likely_unused' | 'unused' | 'unknown';

export type AlertType = 'unused' | 'trial-ending' | 'price-hike' | 'dormant';

export type DashboardFilter = 'all' | 'at-risk' | 'active' | 'cancelled' | 'unused';

export interface Subscription {
  id: string;
  serviceName: string;
  amountMonthly: number;
  frequencyLabel: 'monthly' | 'weekly' | 'yearly';
  status: SubscriptionStatus;
  confidence: UsageConfidence;
  usageScore: number;
  verdict: UsageVerdict;
  alert?: {
    type: AlertType;
    message: string;
  };
}

export interface DashboardSummary {
  monthlySpend: number;
  unusedCount: number;
  saveablePerYear: number;
  shameScore: number;
  previousShameScore: number;
  linkedAccounts: number;
  recentTransactionCount: number;
  dataSource: 'plaid' | 'seeded';
}

export interface DashboardAlert {
  id: string;
  label: string;
  type: AlertType;
}

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
