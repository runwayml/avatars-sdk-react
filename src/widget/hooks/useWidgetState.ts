'use client';

/**
 * useWidgetState Hook
 *
 * Manages the widget's UI state (open/close) and connection state.
 */

import { useState, useCallback } from 'react';
import type { WidgetUIState, WidgetConnectionState, WidgetState } from '../types';
import type { SessionCredentials } from '../../types';

export interface UseWidgetStateOptions {
  startExpanded?: boolean;
}

export interface UseWidgetStateReturn {
  state: WidgetState;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setConnectionState: (connectionState: WidgetConnectionState) => void;
  setCredentials: (credentials: SessionCredentials | null) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export function useWidgetState(options: UseWidgetStateOptions = {}): UseWidgetStateReturn {
  const { startExpanded = false } = options;

  const [uiState, setUIState] = useState<WidgetUIState>(startExpanded ? 'expanded' : 'collapsed');
  const [connectionState, setConnectionState] = useState<WidgetConnectionState>('idle');
  const [credentials, setCredentials] = useState<SessionCredentials | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const open = useCallback(() => {
    setUIState('expanded');
  }, []);

  const close = useCallback(() => {
    setUIState('collapsed');
  }, []);

  const toggle = useCallback(() => {
    setUIState((prev) => (prev === 'collapsed' ? 'expanded' : 'collapsed'));
  }, []);

  const reset = useCallback(() => {
    setConnectionState('idle');
    setCredentials(null);
    setError(null);
  }, []);

  const state: WidgetState = {
    uiState,
    connectionState,
    credentials,
    error,
  };

  return {
    state,
    open,
    close,
    toggle,
    setConnectionState,
    setCredentials,
    setError,
    reset,
  };
}
