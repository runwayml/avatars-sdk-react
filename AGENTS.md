# Agent Guidelines

Context for AI agents working with the Runway Avatar SDK monorepo.

## Repository Structure

```
packages/
  core/    → @runwayml/avatars (framework-agnostic)
  react/   → @runwayml/avatars-react (React bindings)
examples/
  vanilla-js/          Pure JS demo
  nextjs-simple/       Minimal Next.js
  nextjs/              Full Next.js with presets
  nextjs-client-events/  Client event tools
  express/             Express + Vite
  ...
docs/                  Reference docs (holding files)
```

## Package Architecture

**Core (`packages/core/`)** — No React, no framework dependency. LiveKit is the only runtime dep but fully abstracted from the public API.

```
src/
├── client.ts              # AvatarSession class + streamTo/connect entry points
├── emitter.ts             # Tiny typed event emitter
├── transcript-accumulator.ts
├── types.ts               # All shared types + AvatarEvent enum
├── tools.ts               # clientTool / Standard Schema
├── standard-schema.ts
├── api/
│   ├── consume.ts         # consumeSession HTTP call
│   ├── config.ts          # DEFAULT_BASE_URL
│   ├── page-actions.ts    # Page action tool definitions
│   └── index.ts           # /api subpath entry
└── utils/
    ├── parseClientEvent.ts
    ├── parseTranscription.ts
    └── flatDeltaAccumulator.ts
```

**React (`packages/react/`)** — Components and hooks. Depends on `@runwayml/avatars` as a regular dependency. No direct LiveKit imports.

```
src/
├── components/            # AvatarCall, AvatarProvider, AvatarSession, AvatarVideo, etc.
├── hooks/                 # useAvatarSession, useAvatar, useLocalMedia, useTranscript, etc.
├── api/index.ts           # Re-exports from core /api for backwards compat
├── types.ts               # React-specific types (props, context values)
├── styles.css
└── index.ts
```

## Key Patterns

**Core SDK API:**
```ts
const session = await streamTo({ credentials, target: videoEl });
session.mic.toggle();
session.on(AvatarEvent.AvatarVideoReady, (track) => { ... });
session.end();
```

**React hooks subscribe to core events** via `useCoreSession()` context — no LiveKit React hooks.

**Session states:** `idle` → `connecting` → `active` → `ending` → `ended` (or `error`)

## Commands

```bash
bun install                          # Install all workspace deps
bun run build                        # Build core then react
bun test packages/                   # Run all tests (94 tests)
cd packages/core && bun run build    # Build core only (needed before react typecheck)
cd packages/react && bun run typecheck  # Typecheck react
```

## Build Order

Core must be built before react (react imports from the built core package):
1. `cd packages/core && bun run build`
2. `cd packages/react && bun run typecheck` (or build)

CI handles this automatically.

## Design Principles

- **No leaked LiveKit abstractions.** Tracks are `MediaStreamTrack`, not LiveKit `TrackReference`. Session state is `SessionState`, not `ConnectionState`.
- **No direct LiveKit imports in examples/consumer code.** Every direct LiveKit import is a missing SDK API surface.
- **Core is functional.** `streamTo` and `connect` are the entry points — no client object to create for the happy path.
- **React wraps core.** Every React hook subscribes to core `AvatarEvent` emissions. Components render with raw `<video>` + `MediaStreamTrack`.

## Learned User Preferences

- Do not merge or close pull requests on the user's behalf unless they explicitly ask.
- Changelog entries should stay user-facing — no internal event names, JSON shapes, or transport details.
- No section divider comments in code (no `// ---- Section ----` blocks).
- Prefer named parameters over positional args for functions with 2+ params.
- Keep README slim — reference docs live in `docs/` or on the official docs site.

## Learned Workspace Facts

- Monorepo uses bun workspaces; root `package.json` has `"workspaces": ["packages/*"]`
- Both packages version together; publish workflow deploys both on GitHub release
- `@runwayml/avatars-react` lists `@runwayml/avatars` as a regular dep (not peer) so React users only install one package
- Release flow: bump version in both `packages/*/package.json`, update CHANGELOG, commit, `gh release create` triggers publish
- `consumeSession` lives in core and is called client-side by `streamTo`/`connect`; servers return `{ sessionId, sessionKey }` and the SDK handles the consume call
- The `/api` subpath is exported from both packages for backwards compat
- Test runner: `bun:test` imports, Bun's native runner. ~94 tests in ~700ms.
- Graphite `gt submit` needs the repo synced in Graphite settings; fall back to `git push -u origin HEAD` + `gh pr create` if not set up
- Client events: fire-and-forget via data channel; `parseClientEvent` filters server acks; `clientTool()` returns `{ type, name, description }` safe to spread into session create payload
- Session creation: preset avatars use `{ type: 'runway-preset', presetId }`, custom use `{ type: 'custom', avatarId }`
- Transcription arrives via `DataReceived` (not native `TranscriptionReceived`) for Runway sessions; flat deltas for assistant, whole packets for user STT
- LiveKit Agents integration is in private beta — do not disclose publicly
- Public examples target production API only; hardcode preset IDs, keep `.env.example` minimal

## Cursor Cloud specific instructions

The VM update script installs Bun (`npm install -g bun`) and runs `bun install --frozen-lockfile`. Build core before running react typecheck or tests.

To test an example: `cd packages/core && bun run build`, then in the example directory `bun install && bun link @runwayml/avatars-react`. Examples need `RUNWAYML_API_SECRET` set.

No Docker, databases, or external services needed. The only external dep is the Runway API secret for live sessions.
