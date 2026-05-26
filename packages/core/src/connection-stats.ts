/** RTT above this (ms) suggests a slow or constrained path (e.g. 3G). */
export const CONNECTION_STATS_RTT_THRESHOLD_MS = 400;

/** Inbound packet loss ratio above this counts as degraded. */
export const CONNECTION_STATS_PACKET_LOSS_RATIO = 0.03;

export type RtcStatsSummary = {
  maxRttMs: number;
  maxLossRatio: number;
  degraded: boolean;
};

export function summarizeRtcStats(report: RTCStatsReport): RtcStatsSummary {
  let maxRttMs = 0;
  let maxLossRatio = 0;

  report.forEach((stat) => {
    if (stat.type === 'candidate-pair') {
      const pair = stat as RTCStats & {
        state?: string;
        currentRoundTripTime?: number;
      };
      if (pair.state === 'succeeded' && typeof pair.currentRoundTripTime === 'number') {
        maxRttMs = Math.max(maxRttMs, pair.currentRoundTripTime * 1000);
      }
    }

    if (stat.type === 'inbound-rtp') {
      const inbound = stat as RTCInboundRtpStreamStats;
      const received = inbound.packetsReceived ?? 0;
      const lost = inbound.packetsLost ?? 0;
      const total = received + lost;
      if (total > 0) {
        maxLossRatio = Math.max(maxLossRatio, lost / total);
      }
    }
  });

  return {
    maxRttMs,
    maxLossRatio,
    degraded:
      maxRttMs >= CONNECTION_STATS_RTT_THRESHOLD_MS ||
      maxLossRatio >= CONNECTION_STATS_PACKET_LOSS_RATIO,
  };
}

/**
 * Infer network stress from WebRTC stats when LiveKit still reports "good".
 * Uses ICE RTT and inbound RTP loss (subscriber path — avatar video downlink).
 */
export function isRtcStatsDegraded(report: RTCStatsReport): boolean {
  return summarizeRtcStats(report).degraded;
}
