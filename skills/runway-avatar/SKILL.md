---
name: runway-avatar
description: React SDK for building real-time AI avatar experiences via WebRTC. Use when integrating Runway's GWM-1 avatar API into React applications, building video calling apps with AI avatars, or implementing real-time avatar interactions with LiveKit.
license: MIT
metadata:
  author: runwayml
  version: "0.1.0"
---

# Runway Avatar SDK

React SDK for building real-time AI avatar experiences via WebRTC.

## Reference Documentation

| Topic | File |
|-------|------|
| Quick start | `references/getting-started.md` |
| Components | `references/components.md` |
| Hooks | `references/hooks.md` |
| Types | `references/types.md` |
| Server setup | `references/server-setup.md` |
| Styling | `references/styling.md` |
| Render props | `references/render-props.md` |
| Next.js | `references/nextjs.md` |
| Preset avatars | `references/preset-avatars.md` |
| Troubleshooting | `references/troubleshooting.md` |

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

## Quick Start

```tsx
import { AvatarCall, AvatarVideo, ControlBar } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

function App() {
  return (
    <AvatarCall
      apiEndpoint="/api/avatar/connect"
      avatarId="river"
    >
      <AvatarVideo />
      <ControlBar />
    </AvatarCall>
  );
}
```

## Server Setup

The SDK requires a server endpoint to securely create sessions:

```ts
import Runway from '@runwayml/sdk';
import { consumeSession } from '@runwayml/avatars-react/api';

const runway = new Runway();

// Create session
const session = await runway.avatars.createSession({
  avatarId: 'river',
  greeting: 'Hello!',
});

// Consume and return credentials
const credentials = await consumeSession(session);
```

## Workflows

### Future Workflows

- Project scaffolding (create new avatar app)
- Version migration guides
- Integration templates (Express, Remix, etc.)
