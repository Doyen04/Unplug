'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchDashboardDebrief,
  fetchDashboardPayload,
  postCancelSubscription,
  postUndoSubscription,
  type DashboardDebrief,
} from '../lib/client/dashboard-api';
import type {
  DashboardFilter,
  DashboardProvider,
  DashboardPayload,
  Subscription,
} from '../types/subscription';

export interface DashboardData {
  summary: DashboardPayload['summary'];
  subscriptions: Subscription[];
  totalSubscriptions: number;
  filterCounts: DashboardPayload['pagination']['counts'];
  alerts: DashboardPayload['alerts'];
  providers: DashboardPayload['providers'];
  debrief: DashboardDebrief | null;
  isLoading: boolean;
  isDebriefLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  filter: DashboardFilter;
  setFilter: (filter: DashboardFilter) => void;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  undoCancel: () => Promise<void>;
  clearPendingUndo: () => void;
  pendingUndoId: string | null;
  isCancelling: boolean;
}

const EMPTY_PAYLOAD: DashboardPayload = {
  summary: {
    monthlySpend: 0,
    unusedCount: 0,
    saveablePerYear: 0,
    shameScore: 0,
    previousShameScore: 0,
    linkedAccounts: 0,
    recentTransactionCount: 0,
    dataSource: 'none',
  },
  providers: {
    connected: [],
    active: null,
    hasBoth: false,
  },
  subscriptions: [],
  alerts: [],
  pagination: {
    filter: 'all',
    page: 1,
    pageSize: 4,
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

interface UseDashboardDataOptions {
  initialFilter?: DashboardFilter;
  initialPage?: number;
  pageSize?: number;
  includeDebrief?: boolean;
  provider?: DashboardProvider;
}

export const useDashboardData = (
  options: UseDashboardDataOptions = {}
): DashboardData => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<DashboardFilter>(options.initialFilter ?? 'all');
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [pendingUndoId, setPendingUndoId] = useState<string | null>(null);
  const pageSize = Math.min(20, Math.max(1, options.pageSize ?? 4));
  const includeDebrief = options.includeDebrief ?? true;

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', filter, page, pageSize, options.provider ?? 'auto'],
    queryFn: () => fetchDashboardPayload({
      filter,
      page,
      pageSize,
      provider: options.provider,
    }),
  });

  const debriefQuery = useQuery({
    queryKey: ['dashboard-debrief'],
    queryFn: fetchDashboardDebrief,
    enabled: includeDebrief,
  });

  const cancelMutation = useMutation({
    mutationFn: postCancelSubscription,
    onSuccess: (_, id) => {
      setPendingUndoId(id);
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-debrief'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: postUndoSubscription,
    onSuccess: () => {
      setPendingUndoId(null);
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-debrief'] });
    },
  });

  const payload = dashboardQuery.data ?? EMPTY_PAYLOAD;

  return {
    summary: payload.summary,
    subscriptions: payload.subscriptions,
    totalSubscriptions: payload.pagination.total,
    filterCounts: payload.pagination.counts,
    alerts: payload.alerts,
    providers: payload.providers,
    debrief: includeDebrief ? debriefQuery.data ?? null : null,
    isLoading: dashboardQuery.isLoading,
    isDebriefLoading: includeDebrief ? debriefQuery.isLoading : false,
    isError: dashboardQuery.isError,
    isFetching: dashboardQuery.isFetching,
    filter,
    setFilter: (nextFilter) => {
      setFilter(nextFilter);
      setPage(1);
    },
    page: payload.pagination.page,
    pageCount: payload.pagination.pageCount,
    setPage: (nextPage) =>
      setPage(Math.min(Math.max(1, nextPage), payload.pagination.pageCount || 1)),
    refetch: async () => {
      await dashboardQuery.refetch();
    },
    cancelSubscription: async (id: string) => {
      await cancelMutation.mutateAsync(id);
    },
    undoCancel: async () => {
      if (!pendingUndoId) return;
      await undoMutation.mutateAsync(pendingUndoId);
    },
    clearPendingUndo: () => setPendingUndoId(null),
    pendingUndoId,
    isCancelling: cancelMutation.isPending || undoMutation.isPending,
  };
};
