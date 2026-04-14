'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  DashboardFilter,
  DashboardPayload,
  Subscription,
} from '../types/subscription';

export interface DashboardData {
  summary: DashboardPayload['summary'];
  subscriptions: Subscription[];
  totalSubscriptions: number;
  filterCounts: DashboardPayload['pagination']['counts'];
  alerts: DashboardPayload['alerts'];
  debrief: { month: string; content: string } | null;
  isLoading: boolean;
  isDebriefLoading: boolean;
  isError: boolean;
  filter: DashboardFilter;
  setFilter: (filter: DashboardFilter) => void;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
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
    dataSource: 'seeded',
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

const fetchDashboard = async (
  filter: DashboardFilter,
  page: number
): Promise<DashboardPayload> => {
  const query = new URLSearchParams({
    filter,
    page: String(page),
    pageSize: '4',
  });
  const response = await fetch(`/api/dashboard?${query.toString()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to load dashboard');
  return response.json();
};

const fetchDebrief = async (): Promise<{ month: string; content: string }> => {
  const response = await fetch('/api/debrief', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to load debrief');
  return response.json();
};

const postCancel = async (id: string): Promise<void> => {
  const response = await fetch(`/api/subscriptions/${id}/cancel`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to cancel subscription');
};

const postUndo = async (id: string): Promise<void> => {
  const response = await fetch(`/api/subscriptions/${id}/undo`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to undo cancellation');
};

interface UseDashboardDataOptions {
  initialFilter?: DashboardFilter;
  initialPage?: number;
}

export const useDashboardData = (
  options: UseDashboardDataOptions = {}
): DashboardData => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<DashboardFilter>(options.initialFilter ?? 'all');
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [pendingUndoId, setPendingUndoId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', filter, page],
    queryFn: () => fetchDashboard(filter, page),
  });

  const { data: debrief, isLoading: isDebriefLoading } = useQuery({
    queryKey: ['dashboard-debrief'],
    queryFn: fetchDebrief,
  });

  const cancelMutation = useMutation({
    mutationFn: postCancel,
    onSuccess: (_, id) => {
      setPendingUndoId(id);
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-debrief'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: postUndo,
    onSuccess: () => {
      setPendingUndoId(null);
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-debrief'] });
    },
  });

  const payload = data ?? EMPTY_PAYLOAD;

  return {
    summary: payload.summary,
    subscriptions: payload.subscriptions,
    totalSubscriptions: payload.pagination.total,
    filterCounts: payload.pagination.counts,
    alerts: payload.alerts,
    debrief: debrief ?? null,
    isLoading,
    isDebriefLoading,
    isError,
    filter,
    setFilter: (nextFilter) => {
      setFilter(nextFilter);
      setPage(1);
    },
    page: payload.pagination.page,
    pageCount: payload.pagination.pageCount,
    setPage: (nextPage) =>
      setPage(Math.min(Math.max(1, nextPage), payload.pagination.pageCount || 1)),
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
