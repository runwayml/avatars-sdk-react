# Runway Avatar + ElevenLabs ConvAI

A Runway avatar powered by your ElevenLabs Conversational AI agent. The agent handles speech recognition, language model, and text-to-speech — Runway renders the avatar.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your keys:

   - **`RUNWAYML_API_SECRET`** — from [dev.runwayml.com](https://dev.runwayml.com/)
   - **`ELEVENLABS_API_KEY`** — from [elevenlabs.io](https://elevenlabs.io/)
   - **`ELEVENLABS_AGENT_ID`** — create an agent at [elevenlabs.io/app/agents](https://elevenlabs.io/app/agents/agents)
   - **`RUNWAY_AVATAR_ID`** — create a custom avatar in the Developer Portal

2. Configure your ElevenLabs agent:
   - Set **User input audio format** to **PCM 16000Hz** in Advanced settings
   - Choose a voice, LLM, and system prompt in the agent dashboard

3. Install and run:

   ```bash
   bun install
   bun run dev
   ```

## How it works

The API route (`app/api/avatar/connect/route.ts`) uses `createElevenLabsSession` from `@runwayml/avatars-react/api`, which:

1. Fetches a signed WebSocket URL from the ElevenLabs API
2. Creates a Runway realtime session with the ElevenLabs integration
3. Polls until ready and returns WebRTC credentials

The client renders a standard `<AvatarCall>` — no ElevenLabs SDK needed on the frontend.
