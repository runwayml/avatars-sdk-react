import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const mockConsumeSession = mock(() =>
  Promise.resolve({
    url: 'wss://lk.example.com',
    token: 'lk-token-123',
    roomName: 'room-abc',
  }),
);

mock.module('@runwayml/avatars', () => ({
  consumeSession: mockConsumeSession,
}));

// Re-import after mocking so the module picks up the mock
const { fetchCredentials } = await import('./useCredentials');

beforeEach(() => {
  mockConsumeSession.mockClear();
});

afterEach(() => {
  mock.restore();
});

describe('fetchCredentials', () => {
  it('calls consumeSession for sessionId + sessionKey', async () => {
    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      sessionId: 'sess-1',
      sessionKey: 'key-1',
    });

    expect(mockConsumeSession).toHaveBeenCalledWith({
      sessionId: 'sess-1',
      sessionKey: 'key-1',
      baseUrl: undefined,
    });
    expect(result).toEqual({
      sessionId: 'sess-1',
      serverUrl: 'wss://lk.example.com',
      token: 'lk-token-123',
      roomName: 'room-abc',
    });
  });

  it('auto-consumes when connectUrl returns sessionKey-shaped response', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ sessionId: 'sess-2', sessionKey: 'key-2' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as unknown as typeof globalThis.fetch;

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      connectUrl: '/api/connect',
    });

    expect(mockConsumeSession).toHaveBeenCalledWith({
      sessionId: 'sess-2',
      sessionKey: 'key-2',
      baseUrl: undefined,
    });
    expect(result).toEqual({
      sessionId: 'sess-2',
      serverUrl: 'wss://lk.example.com',
      token: 'lk-token-123',
      roomName: 'room-abc',
    });
  });

  it('passes through full credentials from connectUrl without consuming', async () => {
    const fullCredentials = {
      sessionId: 'sess-3',
      serverUrl: 'wss://other.example.com',
      token: 'other-token',
      roomName: 'other-room',
    };

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(fullCredentials), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    ) as unknown as typeof globalThis.fetch;

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      connectUrl: '/api/connect',
    });

    expect(mockConsumeSession).not.toHaveBeenCalled();
    expect(result).toEqual(fullCredentials);
  });

  it('auto-consumes when connect function returns sessionKey-shaped response', async () => {
    const connectFn = mock(() =>
      Promise.resolve({ sessionId: 'sess-4', sessionKey: 'key-4' } as any),
    );

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      connect: connectFn,
    });

    expect(connectFn).toHaveBeenCalledWith('test-avatar');
    expect(mockConsumeSession).toHaveBeenCalledWith({
      sessionId: 'sess-4',
      sessionKey: 'key-4',
      baseUrl: undefined,
    });
    expect(result).toEqual({
      sessionId: 'sess-4',
      serverUrl: 'wss://lk.example.com',
      token: 'lk-token-123',
      roomName: 'room-abc',
    });
  });

  it('passes baseUrl to consumeSession during auto-consume', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ sessionId: 'sess-5', sessionKey: 'key-5' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    ) as unknown as typeof globalThis.fetch;

    await fetchCredentials({
      avatarId: 'test-avatar',
      connectUrl: '/api/connect',
      baseUrl: 'https://custom-api.example.com',
    });

    expect(mockConsumeSession).toHaveBeenCalledWith({
      sessionId: 'sess-5',
      sessionKey: 'key-5',
      baseUrl: 'https://custom-api.example.com',
    });
  });

  it('throws when connectUrl returns a non-OK response', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Internal Server Error', { status: 500 })),
    ) as unknown as typeof globalThis.fetch;

    await expect(
      fetchCredentials({ avatarId: 'test-avatar', connectUrl: '/api/connect' }),
    ).rejects.toThrow('Failed to connect: 500');
  });

  it('throws when no credential source is provided', async () => {
    await expect(
      fetchCredentials({ avatarId: 'test-avatar' }),
    ).rejects.toThrow('AvatarCall requires one of');
  });
});
