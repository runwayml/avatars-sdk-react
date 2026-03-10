# Next.js Avatar Example

This example shows how to use `@runwayml/avatars-react` with [Next.js](https://nextjs.org/) App Router.

## Quick Start

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs my-avatar-app
cd my-avatar-app
npm install
```

Copy `.env.example` to `.env.local` and add your Runway API secret from [dev.runwayml.com](https://dev.runwayml.com/):

```bash
cp .env.example .env.local
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### Client Component

```tsx
'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function AvatarPage() {
  return (
    <AvatarCall
      avatarId="music-superstar"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

### API Route

The API route creates a realtime session with the Runway SDK and polls until it's ready:

```ts
// app/api/avatar/connect/route.ts
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  // Poll until the session is ready
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

## Custom Avatars

You can use custom avatars created in the [Runway Developer Portal](https://dev.runwayml.com/):

1. Create a custom avatar in the Developer Portal
2. Copy the avatar ID
3. Pass it to the API route

## Learn More

- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
- [Runway Developer Portal](https://dev.runwayml.com/)
- [Next.js Documentation](https://nextjs.org/docs)
