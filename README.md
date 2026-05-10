# Runway Avatar SDK

Two packages for real-time AI avatar interactions:

- **`@runwayml/avatars`** — Framework-agnostic core. Works with vanilla JS, Vue, Svelte, or any framework.
- **`@runwayml/avatars-react`** — React components and hooks built on the core.

## Installation

```bash
# React (includes core automatically)
npm install @runwayml/avatars-react

# Framework-agnostic
npm install @runwayml/avatars
```

## Quick start (React)

```tsx
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

function App() {
  return (
    <AvatarCall
      avatarId="music-superstar"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

The component handles session creation, WebRTC connection, and renders a default UI with video and controls.

## Quick start (vanilla JS)

```javascript
import { streamTo } from '@runwayml/avatars';

const credentials = await fetch('/api/avatar/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ avatarId: 'influencer' }),
}).then(r => r.json());

const session = await streamTo({ credentials, target: document.getElementById('avatar') });

session.mic.toggle();
session.end();
```

## Server

Your server creates a session and returns credentials. See [Server setup](./docs/server-setup.md) for full examples (Next.js, Express).

```ts
import Runway from '@runwayml/sdk';

const client = new Runway();

export async function POST(req: Request) {
  const { avatarId } = await req.json();
  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  // Poll until ready, then return { sessionId, sessionKey }
}
```

## Examples

- [`vanilla-js`](./examples/vanilla-js) — Pure JS, no framework
- [`nextjs-simple`](./examples/nextjs-simple) — Minimal Next.js demo
- [`nextjs`](./examples/nextjs) — Preset grid and custom avatars
- [`nextjs-client-events`](./examples/nextjs-client-events) — Client event tools (trivia game)
- [`nextjs-rpc`](./examples/nextjs-rpc) — Backend RPC + client events
- [`subtitles`](./examples/subtitles) — Live transcription overlay
- [`nextjs-core-only`](./examples/nextjs-core-only) — Next.js using only the core SDK (no React bindings)
- [`sveltekit`](./examples/sveltekit) — SvelteKit using the core SDK
- [`express`](./examples/express) — Express + Vite
- [`react-router`](./examples/react-router) — React Router v7

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs-simple my-avatar-app
```

## Documentation

- [Server setup](./docs/server-setup.md) — Session creation and credential flow
- [React components](./docs/react-components.md) — AvatarCall, AvatarProvider, AvatarVideo, ControlBar, etc.
- [React hooks](./docs/react-hooks.md) — useAvatarSession, useAvatar, useLocalMedia, useTranscript, etc.
- [Client events](./docs/client-events.md) — Tool calling, page actions, Standard Schema validation
- [Core SDK](./packages/core/README.md) — Framework-agnostic API reference
- [Runway Characters docs](https://docs.dev.runwayml.com/) — Official documentation

## Browser support

Chrome 74+, Firefox 78+, Safari 14.1+, Edge 79+. Requires camera/microphone permissions.

## AI coding assistants

Drop this into `.cursor/rules/runway-avatars.mdc` to give your AI context about the SDK:

```markdown
# Runway Avatar SDK

- Never expose RUNWAYML_API_SECRET to the client — session creation requires a server endpoint
- React: AvatarCall (quick setup), AvatarProvider (headless), AvatarSession (pre-fetched credentials)
- Vanilla JS: streamTo({ credentials, target }) or connect({ credentials })
- Import clientTool and pageActionTools from @runwayml/avatars/api (server-safe, no React)
- Presets: { type: 'runway-preset', presetId }, custom: { type: 'custom', avatarId }
```

## License

MIT
