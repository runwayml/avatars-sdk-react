# Agent Guidelines

This document provides context for AI agents working with this codebase.

## Project Overview

`@runwayml/avatar-react` is a headless React component library for Runway real-time avatars. It wraps LiveKit's WebRTC functionality with a clean, React-friendly API.

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
- **LiveKit Integration**: Built on `@livekit/components-react` and `livekit-client`
- **Context-Based State**: `AvatarSession` provides context consumed by child components/hooks
- **Type-Safe Session States**: Uses discriminated unions for session state handling

## Development Commands

```bash
npm run dev        # Watch mode for development
npm run build      # Build the package
npm run typecheck  # TypeScript type checking
npm run lint       # Run ESLint
npm run test       # Run tests
```

## Component Hierarchy

```
<AvatarSession credentials={...}>     # Required wrapper, provides LiveKit room
  <AvatarVideo />                      # Remote avatar video
  <UserVideo />                        # Local user camera
  <ControlBar />                       # Media controls
  <ScreenShareVideo />                 # Screen share display
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

Hooks must be used within `<AvatarSession>`:

- `useAvatarSession()` - Session state and controls
- `useAvatar()` - Remote avatar tracks
- `useLocalMedia()` - Local media controls

## Testing Considerations

- Components require LiveKit room context
- Mock `@livekit/components-react` hooks for unit tests
- Integration tests need LiveKit credentials

## Publishing

- Package is published to npm as `@runwayml/avatar-react`
- Supports React 18+
- Uses tsup for bundling (ESM + CJS)
