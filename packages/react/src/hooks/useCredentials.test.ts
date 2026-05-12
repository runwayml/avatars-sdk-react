import { afterEach, describe, expect, it, mock } from 'bun:test';
import { fetchCredentials } from './useCredentials';

const originalFetch = globalThis.fetch;

const CONSUME_RESPONSE = {
  url: 'wss://lk.example.com',
  token: 'lk-token-123',
  roomName: 'room-abc',
};

let fetchCalls: Array<{ url: string; init?: RequestInit }>;

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  fetchCalls = [];
  const wrapped = (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    fetchCalls.push({ url: urlStr, init });
    return handler(urlStr, init);
  };
  globalThis.fetch = mock(wrapped) as unknown as typeof globalThis.fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('fetchCredentials', () => {
  it('calls consumeSession for sessionId + sessionKey', async () => {
    mockFetch((url) => {
      if (url.includes('/consume')) {
        return new Response(JSON.stringify(CONSUME_RESPONSE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not found', { status: 404 });
    });

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      sessionId: 'sess-1',
      sessionKey: 'key-1',
    });

    expect(result).toEqual({
      sessionId: 'sess-1',
      serverUrl: 'wss://lk.example.com',
      token: 'lk-token-123',
      roomName: 'room-abc',
    });

    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0].url).toContain('/v1/realtime_sessions/sess-1/consume');
  });

  it('auto-consumes when connectUrl returns sessionKey-shaped response', async () => {
    mockFetch((url) => {
      if (url === '/api/connect') {
        return new Response(
          JSON.stringify({ sessionId: 'sess-2', sessionKey: 'key-2' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes('/consume')) {
        return new Response(JSON.stringify(CONSUME_RESPONSE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not found', { status: 404 });
    });

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      connectUrl: '/api/connect',
    });

    expect(fetchCalls).toHaveLength(2);
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

    mockFetch(() =>
      new Response(JSON.stringify(fullCredentials), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      connectUrl: '/api/connect',
    });

    expect(fetchCalls).toHaveLength(1);
    expect(result).toEqual(fullCredentials);
  });

  it('auto-consumes when connect function returns sessionKey-shaped response', async () => {
    mockFetch((url) => {
      if (url.includes('/consume')) {
        return new Response(JSON.stringify(CONSUME_RESPONSE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not found', { status: 404 });
    });

    const connectFn = mock(() =>
      Promise.resolve({ sessionId: 'sess-4', sessionKey: 'key-4' } as any),
    );

    const result = await fetchCredentials({
      avatarId: 'test-avatar',
      connect: connectFn,
    });

    expect(connectFn).toHaveBeenCalledWith('test-avatar');
    expect(result).toEqual({
      sessionId: 'sess-4',
      serverUrl: 'wss://lk.example.com',
      token: 'lk-token-123',
      roomName: 'room-abc',
    });
  });

  it('passes baseUrl to consumeSession during auto-consume', async () => {
    mockFetch((url) => {
      if (url.includes('/consume')) {
        return new Response(JSON.stringify(CONSUME_RESPONSE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ sessionId: 'sess-5', sessionKey: 'key-5' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    await fetchCredentials({
      avatarId: 'test-avatar',
      connectUrl: '/api/connect',
      baseUrl: 'https://custom-api.example.com',
    });

    const consumeCall = fetchCalls.find((c) => c.url.includes('/consume'));
    expect(consumeCall).toBeDefined();
    expect(consumeCall!.url).toContain('https://custom-api.example.com');
  });

  it('throws when connectUrl returns a non-OK response', async () => {
    mockFetch(() => new Response('Internal Server Error', { status: 500 }));

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
