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
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

### API Route

The API route creates a session with the Runway API and returns credentials:

```ts
// app/api/avatar/connect/route.ts
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  // Create session
  const { id } = await client.post('/v1/realtime_sessions', {
    body: {
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: avatarId },
    },
  });

  // Poll until ready
  let status = 'NOT_READY';
  let sessionKey = '';
  while (status === 'NOT_READY') {
    await new Promise((r) => setTimeout(r, 1000));
    const session = await client.get(`/v1/realtime_sessions/${id}`);
    status = session.status;
    if (status === 'READY') sessionKey = session.sessionKey;
  }

  return Response.json({ sessionId: id, sessionKey });
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
