# Server Setup Guide

This guide covers setting up the server-side session creation for Runway Avatar SDK.

## Why Server-Side?

Session creation requires your Runway API secret, which must never be exposed to the client. The server acts as a secure intermediary.

## Flow Overview

```
1. Client sends avatarId to your server
2. Server creates session with Runway API
3. Server polls until session is ready
4. Server consumes session to get WebRTC credentials
5. Server returns credentials to client
6. Client establishes WebRTC connection
```

## Installation

```bash
npm install @runwayml/sdk
```

## Environment Variables

```bash
# .env or .env.local
RUNWAYML_API_SECRET=your-api-secret-here
```

Get your API secret from the [Runway Developer Portal](https://dev.runwayml.com/).

## Implementation

### Next.js App Router

```typescript
// app/api/avatar/connect/route.ts
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  try {
    // 1. Create session
    const created = (await client.post('/v1/realtime_sessions', {
      body: {
        model: 'gwm1_avatars',
        avatar: { type: 'runway-preset', presetId: avatarId },
      },
    })) as { id: string };

    // 2. Poll until ready (with timeout)
    let status = 'NOT_READY';
    let sessionKey = '';
    const startTime = Date.now();
    const timeout = 30000;

    while (status === 'NOT_READY') {
      if (Date.now() - startTime > timeout) {
        return Response.json({ error: 'Session creation timed out' }, { status: 504 });
      }

      await new Promise((r) => setTimeout(r, 1000));

      const session = (await client.get(
        `/v1/realtime_sessions/${created.id}`
      )) as { status: string; sessionKey?: string };
      status = session.status;

      if (status === 'READY' && session.sessionKey) {
        sessionKey = session.sessionKey;
      }

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
        return Response.json(
          { error: `Session ${status.toLowerCase()}` },
          { status: 500 }
        );
      }
    }

    // 3. Consume session (use sessionKey for auth)
    const { url, token, roomName } = (await client.post(
      `/v1/realtime_sessions/${created.id}/consume`,
      { headers: { Authorization: `Bearer ${sessionKey}` } }
    )) as { url: string; token: string; roomName: string };

    // 4. Return credentials
    return Response.json({
      sessionId: created.id,
      serverUrl: url,
      token,
      roomName,
    });
  } catch (error) {
    console.error('Avatar session error:', error);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

### Express

```typescript
import express from 'express';
import Runway from '@runwayml/sdk';

const app = express();
app.use(express.json());

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

app.post('/api/avatar/connect', async (req, res) => {
  const { avatarId } = req.body;

  try {
    const created = await client.post('/v1/realtime_sessions', {
      body: {
        model: 'gwm1_avatars',
        avatar: { type: 'runway-preset', presetId: avatarId },
      },
    });

    let status = 'NOT_READY';
    let sessionKey = '';
    while (status === 'NOT_READY') {
      await new Promise((r) => setTimeout(r, 1000));
      const session = await client.get(`/v1/realtime_sessions/${created.id}`);
      status = session.status;

      if (status === 'READY' && session.sessionKey) {
        sessionKey = session.sessionKey;
      }

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
        return res.status(500).json({ error: `Session ${status.toLowerCase()}` });
      }
    }

    const { url, token, roomName } = await client.post(
      `/v1/realtime_sessions/${created.id}/consume`,
      { headers: { Authorization: `Bearer ${sessionKey}` } }
    );

    res.json({
      sessionId: created.id,
      serverUrl: url,
      token,
      roomName,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.listen(3001);
```

### Next.js Server Actions

```typescript
// app/actions/avatar.ts
'use server';

import Runway from '@runwayml/sdk';
import type { SessionCredentials } from '@runwayml/avatars-react';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function createAvatarSession(avatarId: string): Promise<SessionCredentials> {
  const created = await client.post('/v1/realtime_sessions', {
    body: {
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: avatarId },
    },
  });

  let status = 'NOT_READY';
  let sessionKey = '';
  while (status === 'NOT_READY') {
    await new Promise((r) => setTimeout(r, 1000));
    const session = await client.get(`/v1/realtime_sessions/${created.id}`);
    status = session.status;

    if (status === 'READY' && session.sessionKey) {
      sessionKey = session.sessionKey;
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      throw new Error(`Session ${status.toLowerCase()}`);
    }
  }

  const { url, token, roomName } = await client.post(
    `/v1/realtime_sessions/${created.id}/consume`,
    { headers: { Authorization: `Bearer ${sessionKey}` } }
  );

  return { sessionId: created.id, serverUrl: url, token, roomName };
}
```

## Session Status Values

| Status | Description | Action |
|--------|-------------|--------|
| `NOT_READY` | Being created | Continue polling |
| `READY` | Ready for connection | Save `sessionKey`, then consume session |
| `RUNNING` | Currently in use | Already consumed |
| `COMPLETED` | Ended normally | Error - create new |
| `FAILED` | Creation failed | Error - retry |
| `CANCELLED` | Was cancelled | Error - create new |

When the session becomes `READY`, the response includes a `sessionKey` field. This key must be used as a Bearer token when calling the consume endpoint.

## Error Handling

```typescript
try {
  const created = await client.post('/v1/realtime_sessions', { ... });
} catch (error) {
  if (error.status === 401) {
    // Invalid API key
  } else if (error.status === 429) {
    // Rate limited - implement retry with backoff
  } else if (error.status === 402) {
    // Insufficient credits
  }
}
```

## Security Considerations

1. **Validate avatar IDs** - Only allow known avatar presets
2. **Rate limit** - Protect endpoint from abuse
3. **Authentication** - Require user auth before creating sessions
4. **Logging** - Log session creation for debugging (not credentials)
5. **Timeout** - Don't poll indefinitely
