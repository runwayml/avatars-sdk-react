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
- Primary quickstart reference is `examples/nextjs/` (API routes, more universally understood than server actions); documentation lives on an external docs website — `docs/` and `skills/` folders were intentionally removed from the repo
- Dev scripts auto-detect portless (`command -v portless`) and use it when available; there are no separate `dev:portless` scripts; VS Code launch configs (`.vscode/launch.json`) are the primary way to start example dev servers, with `preLaunchTask` linking the package first
- Graphite `gt submit` only works after the GitHub repo is added under **Synced repos** in Graphite ([settings](https://app.graphite.dev/settings/synced-repos)); otherwise it errors with “You can only submit to repos synced with Graphite” (org admins may need to enable the Graphite GitHub app for `runwayml/avatars-sdk-react`). The CLI resolves the repo from `git remote origin` — it must match that GitHub slug exactly (do not confuse the NPM package name `@runwayml/avatars-react` with the repo path `runwayml/avatars-sdk-react`, or typo `avatar-sdk-react` vs `avatars-sdk-react`). Until then, use `git push -u origin <branch>` + `gh pr create`. Local commands (`gt ls`, `gt sync`, `gt checkout`, `gt modify`, `gt create`) still work.
- Client events are fire-and-forget messages from the avatar model delivered via LiveKit data channel (`RoomEvent.DataReceived`); exposed through `onClientEvent` prop, `useClientEvents<T>` (catch-all), and `useClientEvent<E, T>` (filtered by tool name; latest args as state + optional callback); server also sends ack messages with `args: { status: "event_sent" }` that `parseClientEvent` filters out; examples with rich UI should include a `/dev` page for testing states (question cards, score, confetti, error) without a live avatar session
- Client tool helpers use the `client` prefix (`clientTool`, `ClientEventsFrom`, etc.) to distinguish from planned "server tools" that can call back and send messages to the model; follow-up: accept Standard Schema (Zod, Valibot, ArkType) for `args` to get runtime validation and inferred types without `as` casts
- `@runwayml/avatars-react/api` is the server-safe entry point (no React, no `'use client'`); use it for imports needed in Next.js API routes or server components to avoid pulling in the client bundle
- Session creation avatar field uses `{ type: 'runway-preset', presetId }` for built-in presets and `{ type: 'custom', avatarId }` for custom avatars — passing a UUID as `presetId` will 400; Runway `avatars.retrieve` is only for custom avatar UUIDs, not preset slugs (calling it with a preset id returns 400 — examples should use static preset metadata or hardcoded client data)
- The client-events trivia example (`examples/nextjs-client-events/`) keeps session `personality` and `startScript` as repo constants in `lib/trivia-personality.ts` (passed from the connect route); keep personality within the API character limit (~2000); realtime create fields may still be cast with `as any` until `@runwayml/sdk` types include them
- When examples target staging (`api.dev-stage.runwayml.com`), the SDK's `consumeSession` still defaults to `api.dev.runwayml.com`; pass `baseUrl` to `AvatarCall`/`AvatarSession` and expose `NEXT_PUBLIC_RUNWAYML_BASE_URL` in the example's `.env.local`
- Publish workflow auto-detects prerelease versions (e.g., `0.10.0-beta.0`) and uses the prerelease identifier as the npm dist-tag (`--tag beta`)
