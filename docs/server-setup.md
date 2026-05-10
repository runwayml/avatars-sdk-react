# Server Setup

Your server endpoint receives the `avatarId` and returns session credentials. The SDK accepts two response shapes:

| Shape | What you return | What happens |
|-------|----------------|--------------|
| `{ sessionId, sessionKey }` | Simple — just forward the session key | SDK calls the consume endpoint for you |
| `{ sessionId, serverUrl, token, roomName }` | Optimal — call consume server-side | SDK connects directly (no extra round trip) |

## Next.js App Router

```ts
import Runway from '@runwayml/sdk';

const client = new Runway(); // Uses RUNWAYML_API_SECRET env var

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') {
      return Response.json({ sessionId, sessionKey: session.sessionKey });
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  return Response.json({ error: 'Session creation timed out' }, { status: 504 });
}
```

## Express

```ts
import Runway from '@runwayml/sdk';
import express from 'express';

const runway = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });
const app = express();
app.use(express.json());

app.post('/api/avatar/connect', async (req, res) => {
  try {
    const { id: sessionId } = await runway.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: req.body.avatarId },
    });

    const session = await pollUntilReady(sessionId);
    res.json({ sessionId, sessionKey: session.sessionKey });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

async function pollUntilReady(sessionId: string) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const session = await runway.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') return session;
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(session.status)) {
      throw new Error(`Session ${session.status.toLowerCase()}`);
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error('Session timed out');
}
```

## Custom Connect Function

For more control over authentication or headers:

```tsx
<AvatarCall
  avatarId="music-superstar"
  connect={async (avatarId) => {
    const res = await fetch('/api/avatar/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarId }),
    });
    return res.json();
  }}
/>
```
