'use client';

import { useAvatarSessionContext } from '../components/AvatarSession';
import type { AvatarSessionContextValue } from '../types';

export type UseAvatarSessionReturn =
  | { state: 'idle'; sessionId: string; error: null; end: () => Promise<void> }
  | {
      state: 'connecting';
      sessionId: string;
      error: null;
      end: () => Promise<void>;
    }
  | {
      state: 'active';
      sessionId: string;
      error: null;
      end: () => Promise<void>;
    }
  | {
      state: 'ending';
      sessionId: string;
      error: null;
      end: () => Promise<void>;
    }
  | { state: 'ended'; sessionId: string; error: null; end: () => Promise<void> }
  | {
      state: 'error';
      sessionId: string;
      error: Error;
      end: () => Promise<void>;
    };

export function useAvatarSession(): UseAvatarSessionReturn {
  const context = useAvatarSessionContext();
  return context as UseAvatarSessionReturn;
}

export type { AvatarSessionContextValue };
