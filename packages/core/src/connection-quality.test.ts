import { describe, expect, it } from 'bun:test';
import {
  connectionQualityWarningMessage,
  isDegradedConnectionQuality,
  shouldShowConnectionQualityWarning,
} from './connection-quality';

describe('connection-quality', () => {
  it('detects degraded quality levels', () => {
    expect(isDegradedConnectionQuality('poor')).toBe(true);
    expect(isDegradedConnectionQuality('lost')).toBe(true);
    expect(isDegradedConnectionQuality('good')).toBe(false);
    expect(isDegradedConnectionQuality('excellent')).toBe(false);
  });

  it('returns warning copy for degraded and reconnecting states', () => {
    expect(connectionQualityWarningMessage('poor')).toBe('Unstable connection');
    expect(connectionQualityWarningMessage('lost')).toBe(
      'Connection lost — check your network',
    );
    expect(connectionQualityWarningMessage('good', 'reconnecting')).toBe(
      'Reconnecting…',
    );
    expect(connectionQualityWarningMessage('excellent')).toBeNull();
    expect(
      connectionQualityWarningMessage('good', undefined, {
        statsStressed: true,
      }),
    ).toBe('Slow connection');
  });

  it('shows warning when WebRTC stats are stressed', () => {
    const now = 10_000;
    expect(
      shouldShowConnectionQualityWarning({
        quality: 'good',
        degradedSinceMs: null,
        statsDegradedSinceMs: now - 3000,
        stableSinceMs: null,
        now,
      }),
    ).toBe(true);
  });

  it('debounces showing and hiding warnings', () => {
    const now = 10_000;
    expect(
      shouldShowConnectionQualityWarning({
        quality: 'poor',
        degradedSinceMs: now - 1000,
        stableSinceMs: null,
        now,
      }),
    ).toBe(false);

    expect(
      shouldShowConnectionQualityWarning({
        quality: 'poor',
        degradedSinceMs: now - 3000,
        stableSinceMs: null,
        now,
      }),
    ).toBe(true);

    expect(
      shouldShowConnectionQualityWarning({
        quality: 'good',
        degradedSinceMs: null,
        stableSinceMs: now - 2000,
        now,
      }),
    ).toBe(true);

    expect(
      shouldShowConnectionQualityWarning({
        quality: 'good',
        degradedSinceMs: null,
        stableSinceMs: now - 6000,
        now,
      }),
    ).toBe(false);
  });
});
