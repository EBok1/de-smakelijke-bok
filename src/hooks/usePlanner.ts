'use client';

import { createLocalStore, useStore } from '@/lib/store';
import { DEFAULT_WEEK, type PlanMode, type WeekSettings } from '@/lib/planner';

export interface PlannerState {
  persons: number;
  /** Only weeks the user changed are stored; others use the fresh suggestion */
  weeks: Record<string, WeekSettings>;
  /** Ticked-off shopping items per week */
  checked: Record<string, string[]>;
}

export const plannerStore = createLocalStore<PlannerState>('smakelijke-bok-planner', {
  persons: 2,
  weeks: {},
  checked: {},
});

function updateWeek(key: string, change: (week: WeekSettings) => WeekSettings) {
  plannerStore.set((prev) => ({
    ...prev,
    weeks: { ...prev.weeks, [key]: change(prev.weeks[key] ?? DEFAULT_WEEK) },
  }));
}

export const plannerActions = {
  setPersons: (persons: number) =>
    plannerStore.set((prev) => ({ ...prev, persons: Math.min(12, Math.max(1, persons)) })),

  // A new option starts from its own suggestion, so earlier swaps are dropped
  setMode: (key: string, mode: PlanMode) =>
    updateWeek(key, (week) => ({ ...week, mode, overrides: {} })),

  shuffle: (key: string) =>
    updateWeek(key, (week) => ({ ...week, shuffle: week.shuffle + 1, overrides: {} })),

  setDay: (key: string, day: number, slug: string | null) =>
    updateWeek(key, (week) => ({ ...week, overrides: { ...week.overrides, [day]: slug } })),

  resetDay: (key: string, day: number) =>
    updateWeek(key, (week) => {
      const overrides = { ...week.overrides };
      delete overrides[day];
      return { ...week, overrides };
    }),

  resetWeek: (key: string) => updateWeek(key, (week) => ({ ...week, overrides: {} })),

  toggleChecked: (key: string, item: string) =>
    plannerStore.set((prev) => {
      const current = prev.checked[key] ?? [];
      const next = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      return { ...prev, checked: { ...prev.checked, [key]: next } };
    }),
};

export function usePlanner() {
  const [state] = useStore(plannerStore);
  return state;
}
