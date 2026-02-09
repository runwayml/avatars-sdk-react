# Next.js Server Actions Example

This example demonstrates how to use `@runwayml/avatars-react` with **React Server Actions** instead of API routes.

## Key Difference

Instead of using an API route (`/api/avatar/connect`), this example uses a server action to create the avatar session:

```tsx
// app/actions.ts
'use server';

export async function createAvatarSession(avatarId: string) {
  // Create session on the server
  return { sessionId, serverUrl, token, roomName };
}

// app/page.tsx
import { createAvatarSession } from './actions';

// Call the server action directly from the client
const credentials = await createAvatarSession('coding-teacher');

// Use AvatarSession instead of AvatarCall
<AvatarSession credentials={credentials}>
  <AvatarVideo />
  <ControlBar />
</AvatarSession>
```

## When to Use This Approach

- When you want tighter integration with React's data flow
- When you prefer server actions over API routes
- When using the `AvatarSession` component for more control

## Setup

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs-server-actions my-avatar-app
cd my-avatar-app
npm install
```

Copy `.env.example` to `.env` and add your Runway API secret, then run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3001`.

## Custom Avatars

In addition to the preset avatars, you can use your own custom avatars created in the [Runway Developer Portal](https://dev.runwayml.com/).

1. Create a custom avatar in the Developer Portal
2. Copy the avatar ID
3. Enter it in the "Custom Avatar" input on the example page
4. Click "Start Call"
