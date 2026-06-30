# Runway Avatar + ElevenLabs ConvAI

A Runway avatar powered by your ElevenLabs Conversational AI agent. The agent handles speech recognition, language model, and text-to-speech — Runway renders the avatar.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your keys:

   - **`RUNWAYML_API_SECRET`** — API key from the same environment you target (see below)
   - **`RUNWAY_API_BASE_URL`** — optional; defaults to production (`https://api.dev.runwayml.com`)
   - **`ELEVENLABS_API_KEY`** — from [elevenlabs.io](https://elevenlabs.io/)
   - **`ELEVENLABS_AGENT_ID`** — create an agent at [elevenlabs.io/app/agents](https://elevenlabs.io/app/agents/agents)
   - **`RUNWAY_AVATAR_ID`** — custom avatar from the matching Developer Portal

   **Stage testing** (after integration is deployed to stage):

   ```env
   RUNWAY_API_BASE_URL=https://api.dev-stage.runwayml.com
   RUNWAYML_API_SECRET=<key from https://dev-stage.runwayml.com/>
   RUNWAY_AVATAR_ID=<avatar created on dev-stage>
   ```

   Keys, avatars, and base URL must all match the same environment. A stage key against prod API returns 401.

   This example loads `.env.local` with override in `next.config.ts`, so project keys win over a global `RUNWAYML_API_SECRET` in your shell.

2. Configure your ElevenLabs agent:
   - Set **User input audio format** to **PCM 16000Hz** in Advanced settings
   - Choose a voice, LLM, and system prompt in the agent dashboard

3. Build the local SDK packages (this example uses workspace packages, not npm):

   ```bash
   cd ../..   # monorepo root
   bun install
   bun run build
   ```

4. Install and run the example:

   ```bash
   cd examples/nextjs-elevenlabs
   bun install
   bun run dev
   ```

## How it works

The API route (`app/api/avatar/connect/route.ts`) uses `createElevenLabsSession` from `@runwayml/avatars-react/api`, which:

1. Fetches a signed WebSocket URL from the ElevenLabs API
2. Creates a Runway realtime session with the ElevenLabs integration
3. Polls until ready and returns WebRTC credentials

The client renders a standard `<AvatarCall>` — no ElevenLabs SDK needed on the frontend.
