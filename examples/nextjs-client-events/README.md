# Avatar Trivia — Client Events Example

An AI avatar hosts a trivia game. Questions, answers, scores, and sound effects are all driven by **client event tool calls** over the LiveKit data channel.

## What it demonstrates

- **Shared tool types** (`lib/avatar-tools.ts`) — define tools once, use on both server and client
- **`useClientEvents<T>` hook** — type-safe event handling in a child component
- **Visual feedback** — question cards, correct/incorrect overlays, score + streak tracking
- **Sound effects** — plays audio on correct/incorrect answers via `play_sound` events

## Tools

| Tool | What it does |
|------|-------------|
| `show_question` | Displays a multiple-choice question in the sidebar |
| `reveal_answer` | Shows correct/incorrect overlay on the video |
| `update_score` | Updates the scoreboard |
| `play_sound` | Plays a sound effect (`correct`, `incorrect`, `drumroll`, etc.) |

## Setup

```bash
cp .env.example .env.local
# Add your RUNWAYML_API_SECRET

npm install
npm run dev
```

## Architecture

```
lib/avatar-tools.ts          (shared types — used by both)
      │
      ├── app/api/.../route.ts   (server: passes tools to session create)
      └── app/page.tsx           (client: useClientEvents<TriviaEvent>)
```
