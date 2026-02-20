# Next.js Server Actions Example

Uses React Server Actions instead of API routes for session creation.

## Quick Start

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs-server-actions my-avatar-app
cd my-avatar-app
npm install
cp .env.example .env
npm run dev
```

Add your Runway API secret to `.env` from [dev.runwayml.com](https://dev.runwayml.com/).

Open [http://localhost:3001](http://localhost:3001).

## Key Difference

```tsx
// Server action instead of API route
'use server';

export async function createAvatarSession(avatarId: string) {
  // Create session on the server
  return { sessionId, sessionKey };
}

// Client component
<AvatarCall avatarId="game-host" connect={createAvatarSession} />
```

## Learn More

- [Next.js API Routes Example](../nextjs/) - Recommended for most use cases
- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
