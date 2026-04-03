'use client';

import { create } from 'zustand';

export interface SubscriptionStoreState {
  cancelledIds: string[];
  pendingUndoId: string | null;
  cancelSubscription: (id: string) => void;
  undoCancel: () => void;
  clearUndo: () => void;
}

export const useSubscriptionStore = create<SubscriptionStoreState>((set) => ({
  cancelledIds: [],
  pendingUndoId: null,
  cancelSubscription: (id) =>
    set((state) => ({
      cancelledIds: state.cancelledIds.includes(id)
        ? state.cancelledIds
        : [...state.cancelledIds, id],
      pendingUndoId: id,
    })),
  undoCancel: () =>
    set((state) => {
      if (!state.pendingUndoId) return state;
      return {
        cancelledIds: state.cancelledIds.filter(
          (id) => id !== state.pendingUndoId
        ),
        pendingUndoId: null,
      };
    }),
  clearUndo: () => set({ pendingUndoId: null }),
}));
