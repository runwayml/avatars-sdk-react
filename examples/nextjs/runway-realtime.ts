/**
 * Temporary wrapper for Runway realtime sessions API
 * Remove when @runwayml/sdk adds native support
 */

import type Runway from '@runwayml/sdk';

export type AvatarConfig =
  | { type: 'runway-preset'; presetId: string }
  | { type: 'custom'; avatarId: string };

export interface CreateSessionOptions {
  model: string;
  avatar: AvatarConfig;
}

export interface CreateSessionResponse {
  id: string;
}

export interface GetSessionResponse {
  id: string;
  status: 'NOT_READY' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  sessionKey?: string;
}

export class RunwayRealtime {
  constructor(private client: Runway) {}

  async create(options: CreateSessionOptions): Promise<CreateSessionResponse> {
    return this.client.post('/v1/realtime_sessions', {
      body: { model: options.model, avatar: options.avatar },
    }) as Promise<CreateSessionResponse>;
  }

  async get(sessionId: string): Promise<GetSessionResponse> {
    return this.client.get(
      `/v1/realtime_sessions/${sessionId}`,
    ) as Promise<GetSessionResponse>;
  }

  /**
   * Helper to poll until session is ready
   */
  async waitForReady(
    sessionId: string,
    options: { timeoutMs?: number; pollIntervalMs?: number } = {},
  ): Promise<{ sessionKey: string }> {
    const { timeoutMs = 30000, pollIntervalMs = 1000 } = options;
    const startTime = Date.now();

    while (true) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error('Session creation timed out');
      }

      const session = await this.get(sessionId);

      if (session.status === 'READY' && session.sessionKey) {
        return { sessionKey: session.sessionKey };
      }

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(session.status)) {
        throw new Error(
          `Session ${session.status.toLowerCase()} before becoming ready`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }
}
