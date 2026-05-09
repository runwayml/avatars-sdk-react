# @runwayml/avatars

Framework-agnostic SDK for real-time AI avatar interactions. Works with any JavaScript framework or none at all.

## Quick start

```javascript
import { streamTo } from '@runwayml/avatars';

// Fetch credentials from your server
const res = await fetch('/api/avatar/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ avatarId: 'influencer' }),
});
const credentials = await res.json();

// Start streaming to a video element
const session = await streamTo({ credentials, target: document.getElementById('avatar') });

// Control the session
session.mic.toggle();
session.end();
```

## API

### Entry points

- **`streamTo({ credentials, target })`** -- Start a session and stream video to an element. Handles the consume call, LiveKit connection, and media setup. Returns an `AvatarSession`.
- **`connect({ credentials })`** -- Start a session without a video element (headless). Use `session.streamTo(element)` later to attach video.

### `AvatarSession`

Returned by `streamTo` and `connect`. Provides:

- **`session.state`** -- `'idle' | 'connecting' | 'active' | 'ending' | 'ended' | 'error'`
- **`session.sessionId`** -- The session identifier
- **`session.mic`** -- `{ isEnabled, enable(), disable(), toggle() }`
- **`session.camera`** -- `{ isEnabled, enable(), disable(), toggle() }`
- **`session.screenShare`** -- `{ isActive, start(), stop(), toggle() }`
- **`session.end()`** -- End the session
- **`session.transcript(options?)`** -- Create a transcript accumulator
- **`session.onClientEvent(tool, handler)`** -- Listen for typed client events
- **`session.on(event, handler)`** / **`session.off(event, handler)`** -- Event emitter

### Events

```javascript
import { AvatarEvent } from '@runwayml/avatars';

session.on(AvatarEvent.StateChanged, (state) => {});
session.on(AvatarEvent.Transcript, (entry) => {});
session.on(AvatarEvent.ClientEvent, (event) => {});
session.on(AvatarEvent.Error, (error) => {});
session.on(AvatarEvent.AvatarVideoReady, (track) => {});
session.on(AvatarEvent.AvatarAudioReady, (track) => {});
session.on(AvatarEvent.MediaChanged, () => {});
```

### Server subpath

```javascript
import { consumeSession, clientTool, pageActionTools } from '@runwayml/avatars/api';
```

Server-safe utilities with no browser APIs. Use in Next.js API routes, Express handlers, etc.

## React

For React apps, use [`@runwayml/avatars-react`](../react/) which provides components and hooks on top of this package.
