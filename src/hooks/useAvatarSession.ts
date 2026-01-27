'use client';

/**
 * useAvatarSession Hook
 *
 * Provides access to the current avatar session state.
 * Returns a discriminated union based on session state for type-safe UI rendering.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const session = useAvatarSession();
 *
 *   if (session.state === 'connecting') {
 *     return <Loading />;
 *   }
 *
 *   if (session.state === 'error') {
 *     return <Error message={session.error.message} />;
 *   }
 *
 *   return <ActiveSession onEnd={session.end} />;
 * }
 * ```
 */

import { useAvatarSessionContext } from '../components/AvatarSession';
import type { AvatarSessionContextValue } from '../types';

/**
 * Discriminated union types for type-safe session state handling
 */
export type UseAvatarSessionReturn =
  | { state: 'idle'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'connecting'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'active'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'ending'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'ended'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'error'; sessionId: string; error: Error; end: () => Promise<void> };

/**
 * Hook to access the current avatar session state
 *
 * @returns Session state as a discriminated union
 */
export function useAvatarSession(): UseAvatarSessionReturn {
  const context = useAvatarSessionContext();
  return context as UseAvatarSessionReturn;
}

export type { AvatarSessionContextValue };
