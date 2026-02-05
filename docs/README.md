# Runway Avatar SDK Documentation

React SDK for building real-time AI avatar experiences with WebRTC.

## Overview

The `@runwayml/avatars-react` SDK provides React components and hooks for integrating real-time AI avatar interactions into your application. Built on WebRTC for low-latency video communication.

## Quick Start

### Installation

```bash
npm install @runwayml/avatars-react @runwayml/sdk
```

### Environment Setup

```bash
# Server-side only - never expose to client
export RUNWAYML_API_SECRET="your-api-secret"
```

### Basic Usage

```tsx
// Client component
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

function App() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

```ts
// Server endpoint (Next.js example)
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const created = await client.post('/v1/realtime_sessions', {
    body: {
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: avatarId },
    },
  });

  // Poll until ready...
  // Consume session...

  return Response.json({ sessionId, serverUrl, token, roomName });
}
```

## Architecture

```
Client (React)              Your Server              Runway API
     │                           │                        │
     │  POST {avatarId}          │                        │
     │ ─────────────────────────►│                        │
     │                           │  Create + Poll + Consume
     │                           │ ──────────────────────►│
     │  SessionCredentials       │                        │
     │ ◄─────────────────────────│◄───────────────────────│
     │                           │                        │
     │  WebRTC Connection        │                        │
     │ ──────────────────────────────────────────────────►│
```

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](api-reference.md) | Complete component and hook reference |
| [Server Setup](server-setup.md) | Server-side session creation guide |
| [Custom UI Guide](custom-ui-guide.md) | Building custom interfaces with render props |
| [Examples](examples.md) | Code examples for common patterns |

## Key Concepts

### Components

- **AvatarCall** - High-level component handling the full session lifecycle
- **AvatarSession** - Low-level component for custom session management
- **AvatarVideo** - Renders the remote avatar video stream
- **UserVideo** - Renders the local user's camera
- **ControlBar** - Media control buttons

### Hooks

- **useAvatarSession** - Access session state and controls
- **useAvatar** - Access remote avatar video track
- **useLocalMedia** - Control local camera and microphone

### Session States

```
idle → connecting → active → ending → ended
                ↘         ↘
                 → error ←
```

## Browser Support

- Chrome 74+
- Firefox 78+
- Safari 14.1+
- Edge 79+

## Resources

- [Runway Developer Portal](https://dev.runwayml.com/)
- [GitHub Repository](https://github.com/runwayml/avatars-sdk-react)
- [SDK Examples](https://github.com/runwayml/avatars-sdk-react/tree/main/examples)
