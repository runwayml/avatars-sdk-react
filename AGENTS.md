# Agent Guidelines

Context for AI agents working with `@runwayml/avatars-react` - a React SDK for real-time AI avatar interactions via WebRTC.

## Quick Reference

| Resource | Location |
|----------|----------|
| Package README | `README.md` |
| Next.js example | `examples/nextjs/` |
| Types | `src/types.ts` |

## Architecture

```
src/
├── components/    # Headless React components with render props
├── hooks/         # useAvatarSession, useAvatar, useLocalMedia
├── api/           # Session consumption endpoint
├── types.ts       # SessionCredentials, SessionState, Props types
└── index.ts       # Public exports
```

## Component Hierarchy

```
AvatarCall (handles session creation)
└── AvatarSession (WebRTC provider)
    ├── AvatarVideo (remote avatar)
    ├── UserVideo (local camera)
    ├── ControlBar (mic/camera/end)
    └── ScreenShareVideo
```

## Key Patterns

**Session states:** `idle` → `connecting` → `active` → `ending` → `ended` (or `error`)

**Render props:** All display components accept `children` as render function:
```tsx
<AvatarVideo>
  {(avatar) => {
    switch (avatar.status) {
      case 'connecting': return <Spinner />;
      case 'waiting': return <Placeholder />;
      case 'ready': return <VideoTrack trackRef={avatar.videoTrackRef} />;
    }
  }}
</AvatarVideo>
```

**Hooks require context:** Must be inside `<AvatarCall>` or `<AvatarSession>`

## Components

| Component | Purpose |
|-----------|---------|
| `AvatarCall` | High-level component, handles session creation |
| `AvatarSession` | Low-level, requires pre-fetched credentials |
| `AvatarVideo` | Renders remote avatar video |
| `UserVideo` | Renders local camera |
| `ControlBar` | Mic/camera/end-call buttons |
| `ScreenShareVideo` | Renders screen share |

## Hooks

| Hook | Purpose |
|------|---------|
| `useAvatarStatus` | Discriminated union of full avatar lifecycle (recommended) |
| `useAvatarSession` | Session state and `end()` control |
| `useAvatar` | Remote avatar video track |
| `useLocalMedia` | Local mic/camera toggles |
| `useClientEvent` | Subscribe to a single client event type by tool name (state + callback) |
| `useClientEvents` | Listen for all client events from the avatar |
| `useTranscription` | Listen for transcription segments from the session |

## Commands

```bash
bun run dev        # Watch mode
bun run build      # Build package
bun run typecheck  # TypeScript check
bun run lint       # Biome linter
bun test           # Run tests
```

## Source Files

| Purpose | Path |
|---------|------|
| All types | `src/types.ts` |
| High-level component | `src/components/AvatarCall.tsx` |
| Session provider | `src/components/AvatarSession.tsx` |
| Avatar video | `src/components/AvatarVideo.tsx` |
| User video | `src/components/UserVideo.tsx` |
| Controls | `src/components/ControlBar.tsx` |
| Session hook | `src/hooks/useAvatarSession.ts` |
| Avatar hook | `src/hooks/useAvatar.ts` |
| Media hook | `src/hooks/useLocalMedia.ts` |
| Server example | `examples/nextjs/app/api/avatar/connect/route.ts` |

## Design Principles

- **No direct LiveKit imports in examples/consumer code.** If an example needs to import from `@livekit/components-react` or `livekit-client`, that's a signal the SDK isn't exposing enough. Treat every direct LiveKit import as a missing SDK API surface.

## Learned Workspace Facts

- Release flow follows `CONTRIBUTING.md` — bump version, update changelog, commit, push, then `gh release create` triggers the NPM publish workflow
- `consumeSession` API converts `sessionId + sessionKey` → WebRTC credentials (`serverUrl`, `token`, `roomName`); this step is handled client-side by the SDK
- Primary quickstart reference is `examples/nextjs/` (API routes, more universally understood than server actions)
- Documentation lives on an external docs website — `docs/` and `skills/` folders were intentionally removed from the repo
- Dev scripts auto-detect portless (`command -v portless`) and use it when available; there are no separate `dev:portless` scripts
- VS Code launch configs (`.vscode/launch.json`) are the primary way to start example dev servers, with `preLaunchTask` linking the package first
- Graphite `gt submit` cannot push to this repo — fall back to `git push -u origin <branch>` + `gh pr create`
- Client events are fire-and-forget messages from the avatar model delivered via LiveKit data channel (`RoomEvent.DataReceived`); exposed through `onClientEvent` prop, `useClientEvents<T>`, and `useClientEvent<E, T>` hooks with generic type support; server also sends ack messages with `args: { status: "event_sent" }` that `parseClientEvent` filters out
- Examples should include a `/dev` page for testing UI states (question cards, score, confetti, error) without a live avatar session
- `defineClientTools` is named to distinguish from planned "server tools" that can call back and send messages to the model; follow-up: accept Standard Schema-compatible schemas (Zod, Valibot, ArkType) for `args` to get runtime validation and inferred types without `as` casts
- Session creation avatar field uses `{ type: 'runway-preset', presetId }` for built-in presets and `{ type: 'custom', avatarId }` for custom avatars — passing a UUID as `presetId` will 400
- When examples target staging (`api.dev-stage.runwayml.com`), the SDK's `consumeSession` still defaults to `api.dev.runwayml.com`; pass `baseUrl` to `AvatarCall`/`AvatarSession` and expose `NEXT_PUBLIC_RUNWAYML_BASE_URL` in the example's `.env.local`
