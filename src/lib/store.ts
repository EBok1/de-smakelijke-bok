'use client';

import { useCallback, useSyncExternalStore } from 'react';

// One place where personal data (favorites, lists, meal plans) is kept.
// Today it lives in localStorage; when accounts arrive, this is the layer
// that syncs to the server, so components don't have to change.

type Listener = () => void;
type Update<T> = T | ((prev: T) => T);

export interface Store<T> {
  get: () => T;
  getServer: () => T;
  set: (update: Update<T>) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createLocalStore<T>(key: string, fallback: T): Store<T> {
  const listeners = new Set<Listener>();
  // Cached so useSyncExternalStore sees the same object until something changes
  let cache: T | undefined;

  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };

  const notify = () => listeners.forEach((listener) => listener());

  // Another tab changed the same data
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    cache = undefined;
    notify();
  };

  return {
    get: () => (typeof window === 'undefined' ? fallback : read()),
    getServer: () => fallback,
    set(update) {
      const next =
        typeof update === 'function' ? (update as (prev: T) => T)(read()) : update;
      cache = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Private mode or full storage: keep working in memory for this visit
      }
      notify();
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener('storage', onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): [T, Store<T>['set']] {
  const value = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  return [value, store.set];
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true once stored data can be read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    useCallback(() => true, []),
    () => false,
  );
}
