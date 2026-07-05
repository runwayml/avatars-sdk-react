# Runway Avatar + ElevenLabs ConvAI

A Runway avatar powered by your ElevenLabs Conversational AI agent. ElevenLabs handles speech recognition, the language model, and text-to-speech — Runway renders the avatar video.

This example shows the recommended server-side flow using [`createElevenLabsSession`](../../packages/core/src/api/elevenlabs.ts) from `@runwayml/avatars-react/api` and [`AvatarCall`](../../packages/react/README.md) on the client. No ElevenLabs SDK is required in the browser.

## Prerequisites

1. **Runway API key** — [Developer Portal](https://dev.runwayml.com/) → API keys
2. **Custom avatar owned by that API key** — see [Avatar ID](#avatar-id) below
3. **ElevenLabs API key** — [elevenlabs.io](https://elevenlabs.io/) (needs ElevenAgents read permission)
4. **ElevenLabs ConvAI agent** — [Create an agent](https://elevenlabs.io/app/agents/agents), then in **Advanced** set **User input audio format** to **PCM 16000Hz**

## Quick start (published package)

Use this path when integrating against a released `@runwayml/avatars-react` version from npm:

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs-elevenlabs my-elevenlabs-avatar
cd my-elevenlabs-avatar
cp .env.example .env.local
# Fill in .env.local (see Environment variables)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start conversation**.

## Quick start (monorepo / SDK development)

Use this path when working inside the `avatar-sdk-react` repo on an unreleased SDK build:

```bash
cd ../..   # monorepo root
bun install
bun run build

cd examples/nextjs-elevenlabs
cp .env.example .env.local
# Fill in .env.local

bun install
bun run dev
```

This example depends on `file:../../packages/react`, so you must build core + react before running.

## Environment variables

Copy `.env.example` to **`.env.local`** (recommended). This project loads `.env` and `.env.local` with override enabled in `next.config.ts`, so `.env.local` wins over a global `RUNWAYML_API_SECRET` exported in your shell.

| Variable | Required | Description |
|----------|----------|-------------|
| `RUNWAYML_API_SECRET` | Yes | Runway API key (Bearer token) |
| `RUNWAY_AVATAR_ID` | Yes | Custom avatar UUID — must be visible to your API key ([below](#avatar-id)) |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key (server-side only) |
| `ELEVENLABS_AGENT_ID` | Yes | ElevenLabs agent ID (e.g. `agent_…`) |
| `RUNWAY_API_BASE_URL` | No | Defaults to `https://api.dev.runwayml.com`. Use `https://api.dev-stage.runwayml.com` for stage. |

**Keep API keys server-side.** This example never exposes Runway or ElevenLabs secrets to the browser — only `sessionId`, `sessionKey`, and `baseUrl` are returned to the client.

## Avatar ID

`RUNWAY_AVATAR_ID` must be an avatar **your API key can access**, not just one you see in the Developer Portal UI.

The public API scopes avatars to the API project user. An avatar created only in the devportal under your login may return `404 Could not find Avatar` even if the UUID looks correct.

**Verify before running:**

```bash
curl -s "https://api.dev.runwayml.com/v1/avatars" \
  -H "Authorization: Bearer $RUNWAYML_API_SECRET" \
  -H "X-Runway-Version: 2024-11-06"
```

Use an `id` from that list where `status` is `READY`. Or create the avatar via [`POST /v1/avatars`](https://docs.dev.runwayml.com/api) with the same API key.

When you click **Start conversation**, the server logs the resolved values (no secrets):

```
[avatar/connect] creating session { baseUrl, avatarId, agentId }
```

## How it works

```
Browser                    Your Next.js server              External APIs
   |                              |                              |
   |-- POST /api/avatar/connect ->|                              |
   |                              |-- ElevenLabs signed URL ---->|
   |                              |-- POST /v1/realtime_sessions > Runway
   |                              |<- poll until READY ----------|
   |<- { sessionId, sessionKey, avatarId, baseUrl } -|                              |
   |                                                              |
   |-- AvatarCall (WebRTC) --------------------------------------> Runway
```

The API route (`app/api/avatar/connect/route.ts`) calls `createElevenLabsSession`, which:

1. Fetches a signed WebSocket URL from ElevenLabs (~15 min lifetime)
2. Creates a Runway realtime session with `integration: { type: "elevenlabs", signedUrl }`
3. Polls until the session is `READY` and returns credentials for `AvatarCall`

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `404 Could not find Avatar` | Avatar UUID not owned by this API key | List avatars with `GET /v1/avatars`; use an ID from that response |
| `401` / inactive API key | Wrong key or wrong API host | Match key to `RUNWAY_API_BASE_URL` (prod key → prod API, stage key → stage API) |
| Session times out before `READY` | Worker backlog or wrong environment | Retry; confirm Runway backend is healthy for your tier |
| No audio / agent silent | ElevenLabs agent misconfigured | Set **PCM 16000Hz** input format on the agent |
| `RUNWAYML_API_SECRET is not set` | Missing env | Copy `.env.example` → `.env.local` and restart `dev` |

Server errors surface in the modal and in the terminal running `next dev`.

## Learn more

- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
- [Runway API — realtime sessions](https://docs.dev.runwayml.com/api)
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai/overview)
