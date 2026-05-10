# Next.js + Core SDK (no React bindings)

Uses `@runwayml/avatars` directly in React with `useState` / `useEffect` — no `@runwayml/avatars-react` needed. Shows what the React experience looks like without the bindings package.

## Setup

```bash
cp .env.example .env
# Add your Runway API secret

bun install
bun run dev
```

## What this demonstrates

- `streamTo` called from a React component via `useCallback`
- Session stored in `useState`, events subscribed in `useEffect`
- `session.mic.toggle()` / `session.end()` called from button handlers
- `AvatarEvent.AvatarVideoReady` / `MediaChanged` driving React state
- No `AvatarCall`, no `useAvatarSession`, no React bindings at all
