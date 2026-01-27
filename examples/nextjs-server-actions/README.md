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

1. Copy `.env.example` to `.env` and add your Runway API secret
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`

The app will be available at `http://localhost:3001`.
