# Agent Guidelines

This document provides context for AI agents working with this codebase.

## Project Overview

`@runwayml/avatar-react` is a React SDK for real-time AI avatar interactions with GWM-1. It provides WebRTC video functionality with a clean, React-friendly API. Components are headless by default but include optional default styles.

## Architecture

```
src/
├── api/           # API clients (session consumption)
├── components/    # React components (headless, render-prop pattern)
├── hooks/         # React hooks for state access
├── index.ts       # Public API exports
└── types.ts       # TypeScript type definitions
```

### Key Design Decisions

- **Headless Components**: Components expose state via render props, allowing full UI customization
- **WebRTC Integration**: Uses WebRTC for real-time video communication
- **Context-Based State**: `AvatarSession` provides context consumed by child components/hooks
- **Type-Safe Session States**: Uses discriminated unions for session state handling

## Development Commands

This project uses Bun for development. Commands also work with npm.

```bash
bun run dev        # Watch mode for development
bun run build      # Build the package
bun run typecheck  # TypeScript type checking
bun run lint       # Run linter (Biome)
bun test           # Run tests
```

## Component Hierarchy

```
# Primary API (recommended)
<AvatarCall avatarId={...} connectUrl={...}>  # Handles session creation
  <AvatarVideo />                              # Remote avatar video
  <UserVideo />                                # Local user camera
  <ControlBar />                               # Media controls
  <ScreenShareVideo />                         # Screen share display
</AvatarCall>

# Advanced API (full control)
<AvatarSession credentials={...}>     # Requires pre-fetched credentials
  <AvatarVideo />
  <UserVideo />
  <ControlBar />
  <ScreenShareVideo />
</AvatarSession>
```

## Important Patterns

### Render Props for Customization

All components support render props for custom rendering:

```tsx
<AvatarVideo>
  {({ hasVideo, isConnecting, isSpeaking }) => (
    <CustomVideoPlayer ... />
  )}
</AvatarVideo>
```

### Hook Usage

Hooks must be used within `<AvatarCall>` or `<AvatarSession>`:

- `useAvatarSession()` - Session state and controls
- `useAvatar()` - Remote avatar tracks
- `useLocalMedia()` - Local media controls

## Testing Considerations

- Components require room context from AvatarSession
- Mock internal hooks for unit tests
- Integration tests need Runway API credentials

## Publishing

- Package is published to npm as `@runwayml/avatar-react`
- Supports React 18+
- Uses tsup for bundling (ESM + CJS)
