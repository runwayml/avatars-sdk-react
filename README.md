# @runwayml/avatar-react

React SDK for real-time AI avatar video calls.

## Installation

```bash
npm install @runwayml/avatar-react
```

## Quick Start

Add an avatar call to your app with just a few lines:

```tsx
import { AvatarCall } from '@runwayml/avatar-react';

function App() {
  return (
    <AvatarCall
      avatarId="avatar_abc123"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

That's it! The component handles session creation, WebRTC connection, and renders a default UI with the avatar video and controls.

### Optional: Add Default Styles

Import the optional stylesheet for a polished look out of the box:

```tsx
import '@runwayml/avatar-react/styles.css';
```

The styles use CSS custom properties for easy customization:

```css
:root {
  --avatar-bg: #a78bfa;           /* Video background color */
  --avatar-radius: 16px;          /* Container border radius */
  --avatar-control-size: 48px;    /* Control button size */
  --avatar-end-call-bg: #ef4444;  /* End call button color */
}
```

See [`examples/nextjs`](./examples/nextjs) for a complete working example.

## Server Setup

Your server endpoint receives the `avatarId` and returns session credentials. Use `@runwayml/sdk` to create the session:

```ts
// /api/avatar/connect (Next.js App Router example)
import Runway from '@runwayml/sdk';

const runway = new Runway(); // Uses RUNWAY_API_KEY env var

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const session = await runway.realtime.sessions.create({
    model: 'gen4_turbo',
    options: { avatar: avatarId },
  });

  return Response.json({
    sessionId: session.id,
    livekitUrl: session.livekit_url,
    token: session.token,
    roomName: session.room_name,
  });
}
```

## Customization

### Custom Connect Function

For more control over the connection flow:

```tsx
<AvatarCall
  avatarId="avatar_abc123"
  connect={async (avatarId) => {
    const res = await fetch('/api/avatar/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarId }),
    });
    return res.json();
  }}
/>
```

### Custom UI with Child Components

Use the built-in components for custom layouts:

```tsx
import { AvatarCall, AvatarVideo, ControlBar, UserVideo } from '@runwayml/avatar-react';

<AvatarCall avatarId="avatar_abc123" connectUrl="/api/avatar/connect">
  <div className="call-layout">
    <AvatarVideo className="avatar" />
    <UserVideo className="self-view" />
    <ControlBar className="controls" />
  </div>
</AvatarCall>
```

### Render Props

All components support render props for complete control:

```tsx
<AvatarVideo>
  {({ hasVideo, isConnecting, isSpeaking, trackRef }) => (
    <div className={isSpeaking ? 'speaking' : ''}>
      {isConnecting && <Spinner />}
      {hasVideo && <VideoTrack trackRef={trackRef} />}
    </div>
  )}
</AvatarVideo>
```

### CSS Styling with Data Attributes

Style connection states with CSS:

```tsx
<AvatarCall avatarId="..." connectUrl="..." className="my-avatar" />
```

```css
.my-avatar[data-state="connecting"] {
  opacity: 0.5;
}

.my-avatar[data-state="error"] {
  border: 2px solid red;
}

.my-avatar[data-state="connected"] {
  border: 2px solid green;
}
```

## Callbacks

```tsx
<AvatarCall
  avatarId="avatar_abc123"
  connectUrl="/api/avatar/connect"
  onEnd={() => console.log('Call ended')}
  onError={(error) => console.error('Error:', error)}
/>
```

## Hooks

Use hooks for custom components within an `AvatarCall` or `AvatarSession`:

### useAvatarSession

Access session state and controls:

```tsx
function MyComponent() {
  const { state, sessionId, error, end } = useAvatarSession();

  if (state === 'connecting') return <Loading />;
  if (state === 'error') return <Error message={error.message} />;

  return <button onClick={end}>End Call</button>;
}
```

### useAvatar

Access the remote avatar's video/audio:

```tsx
function CustomAvatar() {
  const { videoTrackRef, isSpeaking, hasVideo, hasAudio } = useAvatar();

  return (
    <div data-speaking={isSpeaking}>
      {hasVideo && <VideoTrack trackRef={videoTrackRef} />}
    </div>
  );
}
```

### useLocalMedia

Control local camera and microphone:

```tsx
function MediaControls() {
  const {
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  } = useLocalMedia();

  return (
    <div>
      <button onClick={toggleMic}>{isMicEnabled ? 'Mute' : 'Unmute'}</button>
      <button onClick={toggleCamera}>{isCameraEnabled ? 'Hide' : 'Show'}</button>
    </div>
  );
}
```

## Advanced: AvatarSession

For full control over session management, use `AvatarSession` directly with pre-fetched credentials:

```tsx
import { AvatarSession, AvatarVideo, ControlBar } from '@runwayml/avatar-react';

function AdvancedUsage({ credentials }) {
  return (
    <AvatarSession
      credentials={credentials}
      audio={true}
      video={true}
      onEnd={() => console.log('Ended')}
      onError={(err) => console.error(err)}
    >
      <AvatarVideo />
      <ControlBar />
    </AvatarSession>
  );
}
```

## Components Reference

| Component | Description |
|-----------|-------------|
| `AvatarCall` | High-level component that handles session creation |
| `AvatarSession` | Low-level wrapper that requires credentials |
| `AvatarVideo` | Renders the remote avatar video |
| `UserVideo` | Renders the local user's camera |
| `ControlBar` | Media control buttons (mic, camera, end call) |
| `ScreenShareVideo` | Renders screen share content |
| `AudioRenderer` | Handles avatar audio playback |

## TypeScript

All components and hooks are fully typed:

```tsx
import type {
  AvatarCallProps,
  SessionCredentials,
  AvatarVideoState,
  ControlBarState,
} from '@runwayml/avatar-react';
```

## License

MIT
