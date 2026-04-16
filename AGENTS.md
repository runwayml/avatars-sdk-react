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
AvatarCall (handles session creation + styled container)
└── AvatarSession (WebRTC provider)
    ├── AvatarVideo (remote avatar)
    ├── UserVideo (local camera)
    ├── ControlBar (mic/camera/end)
    └── ScreenShareVideo

AvatarProvider (handles session creation, no container element)
└── AvatarSession (WebRTC provider)
    └── {children}  ← full layout control
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

**Hooks require context:** Must be inside `<AvatarCall>`, `<AvatarProvider>`, or `<AvatarSession>`

## Components

| Component | Purpose |
|-----------|---------|
| `AvatarCall` | High-level component, handles session creation + styled container |
| `AvatarProvider` | Headless provider — same credential handling, no container element |
| `AvatarSession` | Low-level, requires pre-fetched credentials |
| `AvatarVideo` | Renders remote avatar video |
| `UserVideo` | Renders local camera |
| `ControlBar` | Mic/camera/end-call buttons |
| `ScreenShareVideo` | Renders screen share |
| `PageActions` | Handles click/scroll/highlight events from the avatar (renders null) |

## Hooks

| Hook | Purpose |
|------|---------|
| `useAvatarStatus` | Discriminated union of full avatar lifecycle (recommended) |
| `useAvatarSession` | Session state and `end()` control |
| `useAvatar` | Remote avatar video track |
| `useLocalMedia` | Local mic/camera toggles |
| `useClientEvent` | Subscribe to a single client event type by tool name (state + callback) |
| `useClientEvents` | Listen for all client events from the avatar |
| `usePageActions` | Subscribes to page-action events and executes DOM click/scroll/highlight |
| `useTranscription` | Callback for each `RoomEvent.TranscriptionReceived` segment (side effects, logging) |
| `useTranscript` | Accumulated transcript for UI; upserts by LiveKit segment `id` (dedup) with optional buffer cap |

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
| Headless provider | `src/components/AvatarProvider.tsx` |
| Session provider | `src/components/AvatarSession.tsx` |
| Avatar video | `src/components/AvatarVideo.tsx` |
| User video | `src/components/UserVideo.tsx` |
| Controls | `src/components/ControlBar.tsx` |
| Session hook | `src/hooks/useAvatarSession.ts` |
| Avatar hook | `src/hooks/useAvatar.ts` |
| Media hook | `src/hooks/useLocalMedia.ts` |
| Page actions component | `src/components/PageActions.tsx` |
| Page actions hook | `src/hooks/usePageActions.ts` |
| Page actions tools (server) | `src/api/page-actions.ts` |
| Server example | `examples/nextjs/app/api/avatar/connect/route.ts` |

## Design Principles

- **No direct LiveKit imports in examples/consumer code.** If an example needs to import from `@livekit/components-react` or `livekit-client`, that's a signal the SDK isn't exposing enough. Treat every direct LiveKit import as a missing SDK API surface.
- **Default control chrome:** bundled `styles.css` treats mic/camera/screen-share “off” as neutral dimmed (not error red), uses a blue accent while screen sharing, and reserves red for end-call; tune off-state with `--avatar-control-bg-off` and `--avatar-control-color-off`. When sharing, default layout shows screen share as the main region with avatar picture-in-picture; `useLocalMedia.toggleScreenShare` uses `CaptureController` + `setFocusBehavior('no-focus-change')` when the browser supports it so picking another tab to share is less likely to steal focus (otherwise degrades gracefully).

## Learned User Preferences

- Do not merge or close pull requests on the user's behalf unless they explicitly ask; they merge and close PRs themselves.

## Learned Workspace Facts

- Release flow follows `CONTRIBUTING.md` — bump version, update changelog, commit, push, then `gh release create` triggers the NPM publish workflow; changelog only tracks changes that affect the npm package (not examples, tests, or docs); the publish workflow auto-detects prerelease versions (e.g. `0.10.0-beta.0`) and publishes to npm with the prerelease identifier as the dist-tag (`--tag beta`)
- `consumeSession` converts `sessionId + sessionKey` → WebRTC credentials (`serverUrl`, `token`, `roomName`) on the client in the SDK; `@runwayml/avatars-react/api` is the server-safe entry point (no React, no `'use client'`) for Next.js API routes or server components so imports do not pull in the client bundle
- `AvatarSession` connects `LiveKitRoom` with local `audio` and `video` off, then enables the mic and camera after the room reaches `Connected` so exclusive camera/mic use by another app (e.g. Zoom) does not block the session from becoming active; media acquisition failures surface via `MediaDeviceError` context / `useLocalMedia` with retry instead of leaving the room stuck connecting
- Primary quickstart reference is `examples/nextjs/` (API routes, more universally understood than server actions); `examples/nextjs/app/api/avatar/connect/route.ts` may demonstrate optional `baseUrl`, client-event `tools`, and `personality` alongside defaults; documentation lives on an external docs website — `docs/` and `skills/` folders were intentionally removed from the repo; screen share is enabled via `<ControlBar showScreenShare />` (defaults `false` for backwards compatibility) — the quickstart does not render `<ScreenShareVideo />` by default; the avatar stays full-size and the active button state is the sharing indicator
- Dev scripts auto-detect portless (`command -v portless`) and use it when available; VS Code launch configs (`.vscode/launch.json`) bake SDK watch mode into every example via a background `Watch SDK` task — each example's `preLaunchTask` runs `bun run build && bun link`, then a background tsup watch starts automatically; no separate terminal needed for continuous SDK rebuilds; for examples that list `@runwayml/avatars-react` from the registry, prefer that build-and-link flow over changing `package.json` to `file:../..`
- tsup CSS-only entries silently fail to emit in watch mode; the `dev` script pre-copies `src/styles.css` to `dist/` before starting tsup watch, and `rm -rf dist` cleanup only runs during `bun run build` (not during watch)
- Graphite `gt submit` only works after the GitHub repo is added under **Synced repos** in Graphite ([settings](https://app.graphite.dev/settings/synced-repos)); otherwise it errors with “You can only submit to repos synced with Graphite” (org admins may need to enable the Graphite GitHub app for `runwayml/avatars-sdk-react`). The CLI resolves the repo from `git remote origin` — it must match that GitHub slug exactly (do not confuse the NPM package name `@runwayml/avatars-react` with the repo path `runwayml/avatars-sdk-react`, or typo `avatar-sdk-react` vs `avatars-sdk-react`). Until then, use `git push -u origin <branch>` + `gh pr create`. Local commands (`gt ls`, `gt sync`, `gt checkout`, `gt modify`, `gt create`) still work.
- Client events are fire-and-forget messages from the avatar model delivered via LiveKit data channel (`RoomEvent.DataReceived`); exposed through `onClientEvent` prop, `useClientEvents<T>` (catch-all), and `useClientEvent<E, T>` (filtered by tool name; latest args as state + optional callback); server also sends ack messages with `args: { status: "event_sent" }` that `parseClientEvent` filters out; examples with rich UI should include a `/dev` page for testing states (question cards, score, confetti, error) without a live avatar session
- Client tool helpers use the `client` prefix (`clientTool`, `ClientEventsFrom`, etc.) to distinguish from planned "server tools" that can call back and send messages to the model; `clientTool()` only emits `{ type, name, description }` — the `args` field is phantom (TypeScript-only, never sent to the API); when passing tools to `realtimeSessions.create({ tools })`, client event tools need explicit `parameters` arrays for the model to populate args correctly; array-type parameters require an `items` field (e.g. `{ type: 'array', items: { type: 'string' } }`) or the API returns 400; follow-up: accept Standard Schema (Zod, Valibot, ArkType) for `args` to get runtime validation and inferred types without `as` casts
- Session creation avatar field uses `{ type: 'runway-preset', presetId }` for built-in presets and `{ type: 'custom', avatarId }` for custom avatars — passing a UUID as `presetId` will 400; Runway `avatars.retrieve` is only for custom avatar UUIDs, not preset slugs (calling it with a preset id returns 400 — examples should use static preset metadata or hardcoded client data)
- The trivia examples (`examples/nextjs-client-events/`, `examples/nextjs-rpc/`) use a single `next_step` client event per turn with personality/startScript as repo constants in `lib/trivia-personality.ts`; for transcript UI prefer `useTranscript` (accumulates and dedupes by LiveKit segment `id`; `interim` and `bufferSize` are read via refs so changing them does not clear accumulated segments mid-session) over only using `useTranscription` callbacks (append-only logs can show duplicate lines when the same id updates); `personality`/`startScript` are set only in server `realtimeSessions.create` (not passed from the client)—keep `startScript` short so the model does not treat the greeting as already having asked the first question; intro → tool → spoken `question` order is instruction-only (no SDK hook to wait for playback before the client event); keep personality within the API character limit (~2000) and each tool's `timeoutSeconds` ≤8; exceeding the char limit returns a length-specific 400; a *different* 400 ("This text cannot be used for an avatar") is content moderation — avoid pop culture character names and suggestive phrasing in `personality`/`startScript`; realtime create fields may still be cast with `as any` until `@runwayml/sdk` types include them; the RPC trivia example adds `@runwayml/avatars-node-rpc` (GitHub dep) — `next.config.ts` must include `serverExternalPackages: ['@runwayml/avatars-node-rpc', '@livekit/rtc-node']`; `examples/nextjs-rpc-weather/` is a standalone RPC-only example (no client events); `examples/nextjs-rpc-external-api/` demonstrates real external HTTP API calls (ESPN) with instrumented `timed()` logging for isolating tool-call latency vs model-side delay; RPC examples use custom avatars with `personality`/`startScript`/`tools` overrides targeting the production API
- Cross-session audio routing (two avatars hearing each other) is not supported by the SDK; achieving avatar-to-avatar conversation requires Web Audio API bridging in the browser or server-side LiveKit audio forwarding — the SDK intentionally does not expose the underlying LiveKit room object to consumer code
- `AvatarProvider` and `AvatarCall` are parallel implementations (both independently use `useCredentials` + `AvatarSession`) — `AvatarCall` does not delegate to `AvatarProvider`; `useCredentials` is not Suspense-compatible so loading state is via `AvatarProvider`'s `fallback` prop (not `<Suspense>`); `AvatarCallProps` extends `AvatarProviderProps` (minus `fallback`) for type DRYness; recommended hierarchy: `AvatarCall` (default, styled container) → `AvatarProvider` (headless, full layout control) → `AvatarSession` (pre-fetched credentials); `examples/subtitles/` demonstrates the headless pattern with `useTranscript` rendered outside the video container
- Public-facing examples target production API only (`new Runway()` with no `baseURL` override); don't build multi-environment infrastructure — keep `.env.example` minimal (just `RUNWAYML_API_SECRET`); hardcode preset IDs and other constants directly in code rather than env var indirection; keep example code straightforward — don't add defensive error-handling utilities, env-var validation guards, or staging base URL plumbing to committed examples; for internal staging/dev testing, pass `baseUrl` to `AvatarCall`/`AvatarProvider`/`AvatarSession` and set `NEXT_PUBLIC_RUNWAYML_BASE_URL` in `.env.local`; also pass `baseUrl` to `createRpcHandler` since it defaults independently to production and does not auto-read `RUNWAYML_BASE_URL`

## Cursor Cloud specific instructions

The VM update script installs Bun (via `npm install -g bun`) and runs `bun install --frozen-lockfile`. All standard dev commands are documented in `CONTRIBUTING.md` and `package.json` scripts — use those as the primary reference.

**Running examples locally:** To test an example (e.g. `examples/nextjs-simple`), first build and link the SDK: `bun run build && bun link`, then in the example directory run `bun install && bun link @runwayml/avatars-react`. Start the example's dev server with `npx next dev` (or the example's own `dev` script). Examples require `RUNWAYML_API_SECRET` set as an environment variable to create real avatar sessions; without it the UI still loads but connecting to an avatar will fail.

**Gotchas:**
- Bun is not pre-installed on the base VM image — the update script handles this via `npm install -g bun`.
- The `bun run dev` (watch mode) script pre-copies `src/styles.css` to `dist/` because tsup's CSS-only entry silently fails in watch mode. For a clean full build, use `bun run build` instead.
- No Docker, databases, or external services are required for SDK development. The only external dependency is the `RUNWAYML_API_SECRET` for running examples against the Runway API.
- **Network restriction:** The Cloud VM blocks outbound HTTPS to `api.dev.runwayml.com`. This means live avatar sessions cannot be created from the example apps. SDK build, lint, typecheck, and tests all work without network access. To allow examples to connect, add `api.dev.runwayml.com` to the cloud agent's Network Access allowlist.
