'use client';

import { useEffect, useSyncExternalStore } from 'react';

type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

interface CacheEntry<T> {
  state: QueryState<T>;
  promise?: Promise<T>;
}

const IDLE_STATE: QueryState<never> = { status: 'idle' };

const cache = new Map<string, CacheEntry<unknown>>();
const subscribers = new Set<() => void>();

function notifySubscribers() {
  for (const callback of subscribers) {
    callback();
  }
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot<T>(key: string): QueryState<T> {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  return entry?.state ?? (IDLE_STATE as QueryState<T>);
}

export interface UseQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useQuery<T>(options: UseQueryOptions<T>): QueryState<T> {
  const { queryKey, queryFn, enabled = true, onError } = options;

  const state = useSyncExternalStore(
    subscribe,
    () => getSnapshot<T>(queryKey),
    () => getSnapshot<T>(queryKey),
  );

  useEffect(() => {
    if (!enabled) return;

    const entry = cache.get(queryKey) as CacheEntry<T> | undefined;
    if (entry && entry.state.status !== 'idle') {
      return;
    }

    const promise = queryFn();

    cache.set(queryKey, {
      state: { status: 'loading' },
      promise,
    });
    notifySubscribers();

    promise
      .then((data) => {
        cache.set(queryKey, { state: { status: 'success', data } });
        notifySubscribers();
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        cache.set(queryKey, { state: { status: 'error', error } });
        notifySubscribers();
        onError?.(error);
      });
  }, [queryKey, enabled, queryFn, onError]);

  return state;
}
