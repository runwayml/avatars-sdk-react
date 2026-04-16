# Subtitles

Live transcription below the video during an avatar session using `useTranscript` and `AvatarProvider` from `@runwayml/avatars-react`.

This folder is a minimal [Next.js](https://nextjs.org/) App Router app so the session API route stays in one place alongside the UI—swap the UI stack if you prefer; the hook usage is the same.

## Quick start

### In this repository

The example pins the SDK with `"@runwayml/avatars-react": "file:../.."` so installs resolve to the package at the repo root (types and runtime match your checkout). Build the SDK once so `dist/` exists, then install here:

```bash
# from repository root
bun run build

cd examples/subtitles
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Standalone copy (e.g. `degit`)

If you copied only this folder, point the dependency at the published package instead of `file:../..`:

```json
"@runwayml/avatars-react": "latest"
```

Then:

```bash
npx degit runwayml/avatars-sdk-react/examples/subtitles my-subtitles-app
cd my-subtitles-app
# edit package.json as above
cp .env.example .env.local
# Add your RUNWAYML_API_SECRET from https://dev.runwayml.com/

npm install
npm run dev
```

## Why AvatarProvider?

`AvatarCall` renders a styled container with `overflow: hidden` and a fixed `aspect-ratio: 16/9` — great for the common case, but any children are clipped to that box. Since subtitles need to render _below_ the video, this example uses `AvatarProvider` instead. It handles credential fetching and session context identically to `AvatarCall`, but renders no container element, giving you full layout control:

```tsx
<AvatarProvider avatarId="..." sessionId={id} sessionKey={key} fallback={<Loading />}>
  <div className="video-container">
    <AvatarVideo />
    <ControlBar />
  </div>
  <Subtitles />  {/* hooks work here — outside the video box */}
</AvatarProvider>
```

## How it works

`useTranscript` accumulates transcript entries from the session. By default (`mergeDataChannelSegments: true`), it listens for transcript data on `RoomEvent.DataReceived`: Runway worker `{ type: "transcription", role, turn, text }` streaming chunks (concatenated per role+turn), and LiveKit-style `{ segments: [{ id, text, … }] }`. It also listens for native `RoomEvent.TranscriptionReceived` events. Entries are deduplicated by `id`.

**Common options** (this example uses some of these):

- `{ interim: true }` — include partial segments before they're final; omit or use `false` for final-only
- `transcript.slice(-2)` — keep only the last few lines for a caption strip
- `entry.final` — style interim vs final (e.g. dim partial text)
- **Speaker labels** — this example treats `participantIdentity` starting with `agent` or `entry.id` starting with `runway-transcription-assistant` as the avatar

## Learn More

- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
- [Runway Developer Portal](https://dev.runwayml.com/)
