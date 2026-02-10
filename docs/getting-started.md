# Getting Started

## Installation

```bash
npm install @runwayml/avatars-react
```

For server-side session creation:

```bash
npm install @runwayml/sdk
```

## Environment Setup

Set your Runway API secret on the server (never expose to client):

```bash
export RUNWAYML_API_SECRET="your-api-secret-here"
```

Get your API secret from the [Runway Developer Portal](https://dev.runwayml.com/).

## Minimal Example

### Client Component

```tsx
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css'; // Optional default styles

function App() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

### Server Endpoint (Next.js Example)

```ts
// app/api/avatar/connect/route.ts
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  // 1. Create session
  const created = await client.post('/v1/realtime_sessions', {
    body: {
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: avatarId },
    },
  });

  // 2. Poll until ready
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

  // 3. Consume session to get WebRTC credentials (use sessionKey for auth)
  const { url, token, roomName } = await client.post(
    `/v1/realtime_sessions/${created.id}/consume`,
    { headers: { Authorization: `Bearer ${sessionKey}` } }
  );

  return Response.json({
    sessionId: created.id,
    serverUrl: url,
    token,
    roomName,
  });
}
```

## How It Works

1. `AvatarCall` POSTs `{ avatarId }` to your `connectUrl`
2. Your server creates a session with Runway's API (~10–30 seconds)
3. Server returns WebRTC credentials to the client
4. `AvatarCall` establishes a real-time video connection (~1–5 seconds)
5. User sees and talks to the AI avatar

> **Note:** Session creation (step 2) can take 10–30 seconds. `AvatarCall` handles loading states internally — use `avatarImageUrl` and the default styles for a polished loading experience. See the [Loading States guide](guides/loading-states.md) for details.

## Session States

The SDK tracks connection state:

```
idle → connecting → active → ending → ended
                ↘         ↘
                 → error ←
```

Use the `useAvatarStatus` hook to track the lifecycle:

```tsx
const avatar = useAvatarStatus();
// avatar.status: 'connecting' | 'waiting' | 'ready' | 'ending' | 'ended' | 'error'
```

## Next Steps

- [Loading States](guides/loading-states.md) - Handle loading UI during session setup
- [Components](api/components.md) - Learn about all available components
- [Hooks](api/hooks.md) - Access session state with hooks
- [Styling](guides/styling.md) - Customize the appearance
- [Preset Avatars](reference/preset-avatars.md) - See available avatar presets
