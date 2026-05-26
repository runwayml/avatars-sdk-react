'use client';

import { useConnectionState, useRoomContext } from '@livekit/components-react';
import {
  CONNECTION_QUALITY_SHOW_DELAY_MS,
  connectionQualityWarningMessage,
  isDegradedConnectionQuality,
  summarizeRtcStats,
  shouldShowConnectionQualityWarning,
  type ConnectionQuality,
} from '@runwayml/avatars';
import {
  ConnectionQuality as LKConnectionQuality,
  ConnectionState,
  RoomEvent,
} from 'livekit-client';
import type { Participant, RemoteTrack } from 'livekit-client';
import * as React from 'react';

export type ConnectionQualityWarningReason = 'degraded' | 'reconnecting';

export type ConnectionQualityDiagnostics = {
  connectionState: string;
  quality: ConnectionQuality;
  showWarning: boolean;
  message: string | null;
  statsStressed: boolean;
  livekitDegraded: boolean;
  maxRttMs: number | null;
  maxLossRatio: number | null;
  tracksSampled: number;
  msUntilShow: number | null;
  lastSampleAt: number | null;
};

export type UseConnectionQualityReturn = {
  quality: ConnectionQuality;
  showWarning: boolean;
  message: string | null;
  reason: ConnectionQualityWarningReason | null;
  diagnostics: ConnectionQualityDiagnostics | null;
};

type DebounceTimestamps = {
  degradedSinceMs: number | null;
  statsDegradedSinceMs: number | null;
  stableSinceMs: number | null;
};

const EMPTY_DEBOUNCE: DebounceTimestamps = {
  degradedSinceMs: null,
  statsDegradedSinceMs: null,
  stableSinceMs: null,
};

function mapLiveKitQuality(quality: LKConnectionQuality): ConnectionQuality {
  switch (quality) {
    case LKConnectionQuality.Excellent:
      return 'excellent';
    case LKConnectionQuality.Good:
      return 'good';
    case LKConnectionQuality.Poor:
      return 'poor';
    case LKConnectionQuality.Lost:
      return 'lost';
    default:
      return 'unknown';
  }
}

function msUntilWarningShow(
  debounce: DebounceTimestamps,
  quality: ConnectionQuality,
  now: number,
): number | null {
  const isLiveKitDegraded = isDegradedConnectionQuality(quality);
  const isStatsDegraded = debounce.statsDegradedSinceMs != null;
  if (!isLiveKitDegraded && !isStatsDegraded) {
    return null;
  }
  const sinceMs = [
    isLiveKitDegraded ? debounce.degradedSinceMs : null,
    isStatsDegraded ? debounce.statsDegradedSinceMs : null,
  ]
    .filter((value): value is number => value !== null)
    .reduce<number | null>(
      (earliest, value) =>
        earliest === null ? value : Math.min(earliest, value),
      null,
    );
  if (sinceMs === null) {
    return null;
  }
  return Math.max(0, CONNECTION_QUALITY_SHOW_DELAY_MS - (now - sinceMs));
}

function applyDegradedTransition(
  prev: DebounceTimestamps,
  isDegraded: boolean,
  key: 'degradedSinceMs' | 'statsDegradedSinceMs',
  now: number,
): DebounceTimestamps {
  if (isDegraded) {
    if (prev[key] !== null) {
      return prev;
    }
    return { ...prev, [key]: now, stableSinceMs: null };
  }
  if (prev[key] === null) {
    return prev;
  }
  return {
    ...prev,
    [key]: null,
    stableSinceMs: prev.stableSinceMs ?? now,
  };
}

/**
 * Tracks local connection quality with debounced warnings for unstable networks.
 * Must be used within AvatarSession / AvatarCall.
 */
export function useConnectionQuality(options?: {
  debug?: boolean;
}): UseConnectionQualityReturn {
  const debug = options?.debug === true;
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const [quality, setQuality] = React.useState<ConnectionQuality>(() =>
    mapLiveKitQuality(room.localParticipant.connectionQuality),
  );
  const [debounce, setDebounce] =
    React.useState<DebounceTimestamps>(EMPTY_DEBOUNCE);
  const [statsSnapshot, setStatsSnapshot] = React.useState<{
    maxRttMs: number | null;
    maxLossRatio: number | null;
    tracksSampled: number;
    lastSampleAt: number | null;
  }>({
    maxRttMs: null,
    maxLossRatio: null,
    tracksSampled: 0,
    lastSampleAt: null,
  });
  const [debugClock, setDebugClock] = React.useState(() => Date.now());

  const isReconnecting =
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting;

  React.useEffect(() => {
    function handleQualityChanged(
      nextQuality: LKConnectionQuality,
      participant: Participant,
    ) {
      if (!participant.isLocal) {
        return;
      }
      const mapped = mapLiveKitQuality(nextQuality);
      setQuality(mapped);
      const now = Date.now();
      setDebounce((prev) =>
        applyDegradedTransition(
          prev,
          isDegradedConnectionQuality(mapped),
          'degradedSinceMs',
          now,
        ),
      );
    }

    room.on(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
    setQuality(mapLiveKitQuality(room.localParticipant.connectionQuality));
    return () => {
      room.off(RoomEvent.ConnectionQualityChanged, handleQualityChanged);
    };
  }, [room]);

  React.useEffect(() => {
    if (connectionState !== ConnectionState.Connected) {
      setDebounce(EMPTY_DEBOUNCE);
      setStatsSnapshot({
        maxRttMs: null,
        maxLossRatio: null,
        tracksSampled: 0,
        lastSampleAt: null,
      });
      return;
    }

    let cancelled = false;

    async function sampleStats() {
      const tracks: Array<RemoteTrack> = [];
      for (const participant of room.remoteParticipants.values()) {
        for (const publication of participant.trackPublications.values()) {
          if (!publication.isSubscribed) {
            continue;
          }
          const track = publication.track;
          if (!track || typeof track.getRTCStatsReport !== 'function') {
            continue;
          }
          tracks.push(track);
        }
      }

      const reports = await Promise.all(
        tracks.map((track) => track.getRTCStatsReport()),
      );

      if (cancelled) {
        return;
      }

      let maxRttMs = 0;
      let maxLossRatio = 0;
      let stressed = false;

      for (const report of reports) {
        if (!report) {
          continue;
        }
        const summary = summarizeRtcStats(report);
        maxRttMs = Math.max(maxRttMs, summary.maxRttMs);
        maxLossRatio = Math.max(maxLossRatio, summary.maxLossRatio);
        if (summary.degraded) {
          stressed = true;
        }
      }

      const now = Date.now();
      setDebounce((prev) =>
        applyDegradedTransition(
          prev,
          stressed,
          'statsDegradedSinceMs',
          now,
        ),
      );
      setStatsSnapshot({
        maxRttMs: tracks.length > 0 ? maxRttMs : null,
        maxLossRatio: tracks.length > 0 ? maxLossRatio : null,
        tracksSampled: tracks.length,
        lastSampleAt: now,
      });
    }

    void sampleStats();
    const id = window.setInterval(() => void sampleStats(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [room, connectionState]);

  React.useEffect(() => {
    if (!debug) {
      return;
    }
    const id = window.setInterval(() => setDebugClock(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [debug]);

  React.useEffect(() => {
    const remaining = msUntilWarningShow(debounce, quality, Date.now());
    if (remaining === null || remaining <= 0) {
      return;
    }
    const id = window.setTimeout(() => {
      setDebounce((prev) => ({ ...prev }));
    }, remaining);
    return () => window.clearTimeout(id);
  }, [debounce, quality]);

  const statsStressedActive = debounce.statsDegradedSinceMs !== null;
  const livekitDegraded = isDegradedConnectionQuality(quality);

  const showWarning = isReconnecting
    ? true
    : shouldShowConnectionQualityWarning({
        quality,
        degradedSinceMs: debounce.degradedSinceMs,
        statsDegradedSinceMs: debounce.statsDegradedSinceMs,
        stableSinceMs: debounce.stableSinceMs,
      });

  const reason: ConnectionQualityWarningReason | null = isReconnecting
    ? 'reconnecting'
    : showWarning && (livekitDegraded || statsStressedActive)
      ? 'degraded'
      : null;

  const message = showWarning
    ? connectionQualityWarningMessage(
        quality,
        isReconnecting ? 'reconnecting' : undefined,
        {
          statsStressed: statsStressedActive && !livekitDegraded,
        },
      )
    : null;

  const diagnostics: ConnectionQualityDiagnostics | null = debug
    ? {
        connectionState,
        quality,
        showWarning,
        message,
        statsStressed: statsStressedActive,
        livekitDegraded,
        maxRttMs: statsSnapshot.maxRttMs,
        maxLossRatio: statsSnapshot.maxLossRatio,
        tracksSampled: statsSnapshot.tracksSampled,
        msUntilShow: msUntilWarningShow(debounce, quality, debugClock),
        lastSampleAt: statsSnapshot.lastSampleAt,
      }
    : null;

  return {
    quality,
    showWarning,
    message,
    reason,
    diagnostics,
  };
}
