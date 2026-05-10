import { describe, expect, it } from 'bun:test';
import { AvatarError, toAvatarError } from './error';

describe('AvatarError', () => {
  it('has name, code, and message', () => {
    const err = new AvatarError('CONNECTION_FAILED', 'bad connection');
    expect(err.name).toBe('AvatarError');
    expect(err.code).toBe('CONNECTION_FAILED');
    expect(err.message).toBe('bad connection');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AvatarError);
  });

  it('preserves the original error as cause', () => {
    const original = new Error('network down');
    const err = new AvatarError('CONNECTION_FAILED', 'failed', original);
    expect(err.cause).toBe(original);
  });
});

describe('toAvatarError', () => {
  it('wraps a plain Error with a code', () => {
    const original = new Error('timeout');
    const err = toAvatarError('CONSUME_FAILED', 'fallback', original);
    expect(err.code).toBe('CONSUME_FAILED');
    expect(err.message).toBe('timeout');
    expect(err.cause).toBe(original);
  });

  it('uses fallback message for non-Error values', () => {
    const err = toAvatarError('UNKNOWN', 'something broke', 'string error');
    expect(err.message).toBe('something broke');
    expect(err.cause).toBeUndefined();
  });

  it('passes through existing AvatarError unchanged', () => {
    const original = new AvatarError('MEDIA_DEVICE_ERROR', 'mic failed');
    const err = toAvatarError('UNKNOWN', 'fallback', original);
    expect(err).toBe(original);
    expect(err.code).toBe('MEDIA_DEVICE_ERROR');
  });
});
