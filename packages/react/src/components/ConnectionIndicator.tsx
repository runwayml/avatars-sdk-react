'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  useConnectionQuality,
  type ConnectionQualityDiagnostics,
  type UseConnectionQualityReturn,
} from '../hooks/useConnectionQuality';

export interface ConnectionIndicatorProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children?: (state: UseConnectionQualityReturn) => ReactNode;
  /**
   * Live metrics overlay for verifying warnings (RTT, loss, debounce timers).
   * Also enable `connectionPreviewWarning` on AvatarCall to force the user-facing pill.
   */
  debug?: boolean;
  /** Show the warning pill immediately (UI smoke test; ignores network). */
  previewWarning?: boolean;
}

function ConnectionQualityDebugPanel({
  diagnostics,
}: {
  diagnostics: ConnectionQualityDiagnostics;
}) {
  const lossPct =
    diagnostics.maxLossRatio !== null
      ? `${(diagnostics.maxLossRatio * 100).toFixed(1)}%`
      : '—';
  const rtt =
    diagnostics.maxRttMs !== null
      ? `${Math.round(diagnostics.maxRttMs)}ms`
      : '—';

  return (
    <pre data-avatar-connection-debug="">
      {`lk: ${diagnostics.quality} · rtc: ${diagnostics.connectionState}
warn: ${diagnostics.showWarning ? 'yes' : 'no'}${diagnostics.message ? ` · ${diagnostics.message}` : ''}
stats: rtt ${rtt} · loss ${lossPct} · tracks ${diagnostics.tracksSampled}
stress: lk ${diagnostics.livekitDegraded ? 'yes' : 'no'} · rtc ${diagnostics.statsStressed ? 'yes' : 'no'}
show in: ${diagnostics.msUntilShow !== null ? `${diagnostics.msUntilShow}ms` : '—'}`}
    </pre>
  );
}

/**
 * Subtle overlay when the local network connection is degraded or reconnecting.
 * Renders nothing when connection quality is good.
 */
export function ConnectionIndicator({
  children,
  debug = false,
  previewWarning = false,
  ...props
}: ConnectionIndicatorProps) {
  const connection = useConnectionQuality({ debug });

  const showWarning = previewWarning || connection.showWarning;
  const message = previewWarning
    ? 'Slow connection (preview)'
    : connection.message;

  if (children) {
    return <>{children({ ...connection, showWarning, message })}</>;
  }

  const showPill = showWarning && message;
  const diagnostics = connection.diagnostics;

  if (!showPill && !diagnostics) {
    return null;
  }

  return (
    <div data-avatar-connection-overlay="" {...props}>
      {diagnostics ? (
        <ConnectionQualityDebugPanel diagnostics={diagnostics} />
      ) : null}
      {showPill ? (
        <output
          data-avatar-connection-indicator=""
          data-connection-quality={connection.quality}
          data-connection-reason={
            previewWarning ? 'preview' : (connection.reason ?? undefined)
          }
          aria-live="polite"
        >
          <span data-avatar-connection-signal="" aria-hidden="true" />
          <span data-avatar-connection-message="">{message}</span>
        </output>
      ) : null}
    </div>
  );
}
