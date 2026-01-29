'use client';

/**
 * Widget Component
 *
 * Main container component that renders either the bubble or floating avatar.
 */

import { useEffect } from 'react';
import { WidgetProvider, useWidgetContext } from './WidgetProvider';
import { Bubble } from './components/Bubble';
import { FloatingAvatar } from './components/FloatingAvatar';
import { registerWidgetControls } from './utils/imperativeApi';
import type { WidgetConfig, WidgetUIState } from './types';

export interface WidgetProps {
  config: WidgetConfig;
}

export function Widget({ config }: WidgetProps) {
  return (
    <WidgetProvider config={config}>
      <WidgetContent />
    </WidgetProvider>
  );
}

function WidgetContent() {
  const { config, state, open, close, startSession } = useWidgetContext();

  const isExpanded = state.uiState === 'expanded';

  // Register controls for imperative API
  useEffect(() => {
    const setUIState = (newState: WidgetUIState) => {
      if (newState === 'expanded') {
        open();
      } else {
        close();
      }
    };

    registerWidgetControls(state.uiState, setUIState);
  }, [state.uiState, open, close]);

  // Auto-start session when expanding
  useEffect(() => {
    if (isExpanded && state.connectionState === 'idle' && !state.credentials) {
      startSession();
    }
  }, [isExpanded, state.connectionState, state.credentials, startSession]);

  // Apply accent color as CSS custom property
  const style = config.accentColor
    ? ({ '--widget-accent': config.accentColor } as React.CSSProperties)
    : undefined;

  return (
    <div
      className="widget-root"
      data-position={config.position}
      style={{
        ...style,
        '--widget-z-index': config.zIndex,
      } as React.CSSProperties}
    >
      {isExpanded ? <FloatingAvatar /> : <Bubble />}
    </div>
  );
}
