import { describe, expect, it } from 'bun:test';
import { isRtcStatsDegraded, summarizeRtcStats } from './connection-stats';

function mockReport(entries: Array<[string, object]>): RTCStatsReport {
  const map = new Map<string, object>(entries);
  return {
    forEach(
      callback: (value: object, key: string) => void,
    ) {
      map.forEach((value, key) => {
        callback(value, key);
      });
    },
  } as RTCStatsReport;
}

describe('connection-stats', () => {
  it('detects high RTT on candidate-pair', () => {
    const report = mockReport([
      [
        'pair',
        {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.5,
        },
      ],
    ]);
    expect(isRtcStatsDegraded(report)).toBe(true);
  });

  it('detects inbound packet loss', () => {
    const report = mockReport([
      [
        'in',
        {
          type: 'inbound-rtp',
          packetsReceived: 90,
          packetsLost: 10,
        },
      ],
    ]);
    expect(isRtcStatsDegraded(report)).toBe(true);
  });

  it('summarizes RTT and loss', () => {
    const summary = summarizeRtcStats(
      mockReport([
        [
          'pair',
          {
            type: 'candidate-pair',
            state: 'succeeded',
            currentRoundTripTime: 0.12,
          },
        ],
        [
          'in',
          {
            type: 'inbound-rtp',
            packetsReceived: 100,
            packetsLost: 1,
          },
        ],
      ]),
    );
    expect(summary.maxRttMs).toBe(120);
    expect(summary.maxLossRatio).toBeCloseTo(0.01);
    expect(summary.degraded).toBe(false);
  });

  it('returns false for healthy stats', () => {
    const report = mockReport([
      [
        'pair',
        {
          type: 'candidate-pair',
          state: 'succeeded',
          currentRoundTripTime: 0.05,
        },
      ],
      [
        'in',
        {
          type: 'inbound-rtp',
          packetsReceived: 1000,
          packetsLost: 0,
        },
      ],
    ]);
    expect(isRtcStatsDegraded(report)).toBe(false);
  });
});
