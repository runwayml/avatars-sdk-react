# Avatar Trivia — Client Events Example

An AI avatar hosts a trivia game. Questions, answers, scores, and sound effects are all driven by **client event tool calls** over the LiveKit data channel.

## What it demonstrates

- **Shared tool types** (`lib/avatar-tools.ts`) — define tools once, use on both server and client
- **`useClientEvent` hook** — type-safe event handling in a child component
- **Single-event model** — one `next_step` tool call per turn carries question, result, score, and sound

## Tools

| Tool | What it does |
|------|-------------|
| `next_step` | Advances the game — delivers the next question plus the previous answer result, updated score, and sound cue |

## Setup

```bash
cp .env.example .env.local
# Add your RUNWAYML_API_SECRET and NEXT_PUBLIC_AVATAR_ID

npm install
npm run dev
```

## Architecture

```
lib/avatar-tools.ts          (shared types — used by both)
      │
      ├── app/api/.../route.ts   (server: passes tools to session create)
      └── app/page.tsx           (client: useClientEvent + useClientEvents)
```
