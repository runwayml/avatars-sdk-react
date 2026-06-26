import { afterEach, describe, expect, it, mock } from 'bun:test';
import { createElevenLabsSession } from './elevenlabs';

const originalFetch = globalThis.fetch;

let fetchCalls: Array<{ url: string; init?: RequestInit }>;

function mockFetch(
  handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
  fetchCalls = [];
  const wrapped = (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    fetchCalls.push({ url: urlStr, init });
    return handler(urlStr, init);
  };
  globalThis.fetch = mock(wrapped) as unknown as typeof globalThis.fetch;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const SIGNED_URL =
  'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent_1&conversation_signature=tok';

const SESSION_OPTIONS = {
  runwayApiSecret: 'rw-secret',
  avatarId: 'avatar-1',
  elevenLabsApiKey: 'el-key',
  agentId: 'agent_1',
} as const;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('createElevenLabsSession', () => {
  it('runs the full signed-url -> create -> poll flow and returns credentials', async () => {
    mockFetch((url) => {
      if (url.includes('get-signed-url')) {
        return json({ signed_url: SIGNED_URL });
      }
      if (url.endsWith('/v1/realtime_sessions')) {
        return json({ id: 'session-123' });
      }
      if (url.includes('/v1/realtime_sessions/session-123')) {
        return json({ status: 'READY', sessionKey: 'sk-abc' });
      }
      return new Response('Not found', { status: 404 });
    });

    const result = await createElevenLabsSession({
      ...SESSION_OPTIONS,
      baseUrl: 'https://api.example.com',
    });

    expect(result).toEqual({ sessionId: 'session-123', sessionKey: 'sk-abc' });

    const signedCall = fetchCalls.find((c) => c.url.includes('get-signed-url'));
    expect(signedCall?.url).toContain('agent_id=agent_1');
    expect(
      (signedCall?.init?.headers as Record<string, string>)['xi-api-key'],
    ).toBe('el-key');

    const createCall = fetchCalls.find(
      (c) => c.init?.method === 'POST' && c.url.endsWith('/v1/realtime_sessions'),
    );
    const createBody = JSON.parse(createCall?.init?.body as string);
    expect(createBody.model).toBe('gwm1_avatars');
    expect(createBody.avatar).toEqual({ type: 'custom', avatarId: 'avatar-1' });
    expect(createBody.integration).toEqual({
      type: 'elevenlabs',
      signedUrl: SIGNED_URL,
    });
  });

  it('throws when the ElevenLabs signed-url request fails', async () => {
    mockFetch((url) => {
      if (url.includes('get-signed-url')) {
        return new Response('forbidden', { status: 401 });
      }
      return new Response('Not found', { status: 404 });
    });

    await expect(
      createElevenLabsSession({
        ...SESSION_OPTIONS,
        elevenLabsApiKey: 'bad-key',
      }),
    ).rejects.toThrow(/ElevenLabs signed URL/);
  });

  it('throws when the Runway session creation fails', async () => {
    mockFetch((url) => {
      if (url.includes('get-signed-url')) {
        return json({ signed_url: SIGNED_URL });
      }
      if (url.endsWith('/v1/realtime_sessions')) {
        return new Response('bad request', { status: 400 });
      }
      return new Response('Not found', { status: 404 });
    });

    await expect(createElevenLabsSession(SESSION_OPTIONS)).rejects.toThrow(
      /Runway session/,
    );
  });
});
