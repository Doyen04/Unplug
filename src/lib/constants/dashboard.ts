import type { DashboardFilter } from '../../types/subscription';

export const DASHBOARD_FILTER_OPTIONS: Array<{
  key: DashboardFilter;
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'unused', label: 'Unused' },
  { key: 'at-risk', label: 'Risky' },
  { key: 'cancelled', label: 'Cancelled' },
];
