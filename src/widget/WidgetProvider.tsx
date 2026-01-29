'use client';

/**
 * WidgetProvider
 *
 * Context provider for the widget's configuration and state.
 */

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useWidgetState } from './hooks/useWidgetState';
import { useWidgetSession } from './hooks/useWidgetSession';
import type { WidgetConfig, WidgetContextValue, WidgetConnectionState } from './types';

const WidgetContext = createContext<WidgetContextValue | null>(null);

export interface WidgetProviderProps {
  config: WidgetConfig;
  children: ReactNode;
}

export function WidgetProvider({ config, children }: WidgetProviderProps) {
  const {
    state,
    open,
    close,
    toggle,
    setConnectionState,
    setCredentials,
    setError,
    reset,
  } = useWidgetState({
    startExpanded: config.startExpanded,
  });

  const { startSession } = useWidgetSession({
    config,
    setConnectionState,
    setCredentials,
    setError,
    onReady: config.onReady,
    onError: config.onError,
  });

  const endSession = useCallback(async () => {
    reset();
    config.onEnd?.();
  }, [reset, config]);

  const handleSetConnectionState = useCallback(
    (connectionState: WidgetConnectionState) => {
      setConnectionState(connectionState);
    },
    [setConnectionState]
  );

  const handleSetError = useCallback(
    (error: Error | null) => {
      setError(error);
      if (error) {
        setConnectionState('error');
      }
    },
    [setError, setConnectionState]
  );

  const contextValue = useMemo<WidgetContextValue>(() => {
    const normalizedConfig = {
      ...config,
      position: config.position ?? 'bottom-right',
      theme: config.theme ?? 'light',
      zIndex: config.zIndex ?? 2147483646,
    };

    return {
      config: normalizedConfig,
      state,
      open,
      close,
      toggle,
      startSession,
      endSession,
      setError: handleSetError,
      setConnectionState: handleSetConnectionState,
    };
  }, [
    config,
    state,
    open,
    close,
    toggle,
    startSession,
    endSession,
    handleSetError,
    handleSetConnectionState,
  ]);

  return <WidgetContext.Provider value={contextValue}>{children}</WidgetContext.Provider>;
}

/**
 * Hook to access the widget context
 */
export function useWidgetContext(): WidgetContextValue {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgetContext must be used within a WidgetProvider');
  }
  return context;
}
