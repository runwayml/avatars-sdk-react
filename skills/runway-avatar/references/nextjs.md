# Next.js Integration

Guide for integrating Runway Avatar SDK with Next.js App Router.

## Project Setup

### 1. Install Dependencies

```bash
npm install @runwayml/avatars-react @runwayml/sdk
```

### 2. Environment Variables

Create `.env.local`:

```
RUNWAYML_API_SECRET=your-api-secret-here
```

---

## API Route

Create the server endpoint for session creation.

### app/api/avatar/connect/route.ts

```typescript
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  // Create session
  const created = (await client.post('/v1/realtime_sessions', {
    body: {
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: avatarId },
    },
  })) as { id: string };

  // Poll until ready
  let status = 'NOT_READY';
  let sessionKey = '';
  while (status === 'NOT_READY') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const session = (await client.get(
      `/v1/realtime_sessions/${created.id}`
    )) as { status: string; sessionKey?: string };
    status = session.status;

    if (status === 'READY' && session.sessionKey) {
      sessionKey = session.sessionKey;
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      throw new Error(`Session ${status.toLowerCase()} before becoming ready`);
    }
  }

  // Consume session (use sessionKey for auth)
  const { url, token, roomName } = (await client.post(
    `/v1/realtime_sessions/${created.id}/consume`,
    { headers: { Authorization: `Bearer ${sessionKey}` } }
  )) as { url: string; token: string; roomName: string };

  return Response.json({
    sessionId: created.id,
    serverUrl: url,
    token,
    roomName,
  });
}
```

---

## Client Component

Avatar components must be client components due to WebRTC requirements.

### app/avatar/page.tsx

```tsx
'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function AvatarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AvatarCall
        avatarId="game-host"
        connectUrl="/api/avatar/connect"
        className="w-full max-w-3xl aspect-video"
        onEnd={() => console.log('Call ended')}
        onError={(error) => console.error('Error:', error)}
      />
    </main>
  );
}
```

---

## Server Actions Alternative

You can use Server Actions instead of API routes.

### app/actions/avatar.ts

```typescript
'use server';

import Runway from '@runwayml/sdk';
import type { SessionCredentials } from '@runwayml/avatars-react';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function createAvatarSession(
  avatarId: string
): Promise<SessionCredentials> {
  const created = (await client.post('/v1/realtime_sessions', {
    body: {
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: avatarId },
    },
  })) as { id: string };

  let status = 'NOT_READY';
  let sessionKey = '';
  while (status === 'NOT_READY') {
    await new Promise((r) => setTimeout(r, 1000));
    const session = (await client.get(
      `/v1/realtime_sessions/${created.id}`
    )) as { status: string; sessionKey?: string };
    status = session.status;

    if (status === 'READY' && session.sessionKey) {
      sessionKey = session.sessionKey;
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      throw new Error(`Session ${status.toLowerCase()}`);
    }
  }

  const { url, token, roomName } = (await client.post(
    `/v1/realtime_sessions/${created.id}/consume`,
    { headers: { Authorization: `Bearer ${sessionKey}` } }
  )) as { url: string; token: string; roomName: string };

  return {
    sessionId: created.id,
    serverUrl: url,
    token,
    roomName,
  };
}
```

### app/avatar/page.tsx (with Server Action)

```tsx
'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import { createAvatarSession } from '../actions/avatar';
import '@runwayml/avatars-react/styles.css';

export default function AvatarPage() {
  return (
    <AvatarCall
      avatarId="game-host"
      connect={createAvatarSession}
      className="w-full max-w-3xl aspect-video"
    />
  );
}
```

---

## Common Issues

### "use client" Required

Avatar components use browser APIs (WebRTC). Always add `'use client'` directive:

```tsx
'use client';

import { AvatarCall } from '@runwayml/avatars-react';
```

### Hydration Errors

If you see hydration errors, ensure avatar components are only rendered client-side:

```tsx
'use client';

import dynamic from 'next/dynamic';

const AvatarCall = dynamic(
  () => import('@runwayml/avatars-react').then((mod) => mod.AvatarCall),
  { ssr: false }
);
```
