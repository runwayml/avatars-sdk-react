# Agent Guidelines

Context for AI agents working with `@runwayml/avatars-react` - a React SDK for real-time AI avatar interactions via WebRTC.

## Documentation Index

Prefer docs-led reasoning. Read relevant files before implementation.

| Topic | File |
|-------|------|
| Quick start | `docs/getting-started.md` |
| Components (AvatarCall, AvatarVideo, etc.) | `docs/api/components.md` |
| Hooks (useAvatarSession, useAvatar, useLocalMedia) | `docs/api/hooks.md` |
| TypeScript types | `docs/api/types.md` |
| Server-side SDK (@runwayml/sdk) | `docs/guides/server-setup.md` |
| CSS styling & data attributes | `docs/guides/styling.md` |
| Render prop patterns | `docs/guides/render-props.md` |
| Next.js integration | `docs/guides/nextjs.md` |
| Available avatar presets | `docs/reference/preset-avatars.md` |
| Troubleshooting | `docs/reference/troubleshooting.md` |

## Architecture

```
src/
├── components/    # Headless React components with render props
├── hooks/         # useAvatarSession, useAvatar, useLocalMedia
├── api/           # Session consumption endpoint
├── types.ts       # SessionCredentials, SessionState, Props types
└── index.ts       # Public exports
```

## Key Patterns

**Component hierarchy:**
```
AvatarCall (handles session creation)
└── AvatarSession (LiveKit provider)
    ├── AvatarVideo (remote avatar)
    ├── UserVideo (local camera)
    ├── ControlBar (mic/camera/end)
    └── ScreenShareVideo
```

**Session states:** `idle` → `connecting` → `active` → `ending` → `ended` (or `error`)

**Render props:** All display components accept `children` as render function:
```tsx
<AvatarVideo>
  {({ hasVideo, isSpeaking, trackRef }) => <CustomUI />}
</AvatarVideo>
```

**Hooks require context:** Must be inside `<AvatarCall>` or `<AvatarSession>`

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
