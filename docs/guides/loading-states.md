# Loading States

Connecting to an AI avatar involves multiple steps that can take **10–30 seconds**. The SDK handles loading states internally for a seamless experience.

## The Loading Phases

```
Phase 1                          Phase 2
┌──────────────────────────┐     ┌─────────────────────────┐
│   Session Setup          │     │   Video Loading          │
│                          │     │                          │
│ • Server creates session │     │ • WebRTC connects        │
│ • Polls until READY      │ ──► │ • Video track arrives    │
│ • Returns credentials    │     │ • First frame renders    │
│                          │     │                          │
│ ~10–30 seconds           │     │ ~1–5 seconds             │
└──────────────────────────┘     └─────────────────────────┘
```

**Phase 1 (Session Setup):** Your server creates a Runway session, polls until ready, and returns WebRTC credentials. `AvatarCall` shows a built-in loading state during this phase.

**Phase 2 (Video Loading):** The client establishes a WebRTC connection and waits for the avatar's video track. Your custom children are rendered during this phase, and you can use `useAvatarStatus` or the `AvatarVideo` render prop to show appropriate UI.

---

## Quick Start

```tsx
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

function App() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
      avatarImageUrl="/avatars/game-host.png"
    />
  );
}
```

That's it. The default styles show a blurred avatar placeholder during loading, which smoothly transitions to the live video when ready.

---

## How Loading Works

### Phase 1: Credential Fetching

During credential fetching, `AvatarCall` renders a minimal loading UI. Your custom `children` are **not** rendered during this phase — this ensures hooks like `useLocalMedia` always have access to the session context.

The built-in loading UI:
- Shows the blurred `avatarImageUrl` as a background (if provided)
- Displays a subtle spinner animation
- Uses the `data-avatar-status="connecting"` attribute for CSS styling

### Phase 2: Video Loading

Once credentials are ready, your `children` are rendered inside the session context. Use `useAvatarStatus` or `AvatarVideo` render props to handle the WebRTC connection and video loading states.

---

## Customizing Loading UI

### With Avatar Placeholder Image

The `avatarImageUrl` prop shows a blurred placeholder during both loading phases:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  avatarImageUrl="/avatars/game-host.png"
/>
```

The default styles automatically:
- Show the blurred image as a background during loading
- Fade it out smoothly when video becomes ready
- Display a subtle pulse animation during connection

### Custom Phase 2 UI with useAvatarStatus

For custom UI during Phase 2 (after credentials are ready), use the `useAvatarStatus` hook:

```tsx
import { AvatarCall, useAvatarStatus, VideoTrack } from '@runwayml/avatars-react';

function App() {
  return (
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
      <CustomAvatarUI />
    </AvatarCall>
  );
}

function CustomAvatarUI() {
  const avatar = useAvatarStatus();

  switch (avatar.status) {
    case 'connecting':
      return <Spinner label="Establishing connection..." />;

    case 'waiting':
      return <Spinner label="Loading avatar video..." />;

    case 'ready':
      return <VideoTrack trackRef={avatar.videoTrackRef} />;

    case 'error':
      return <p>Error: {avatar.error.message}</p>;

    case 'ended':
      return <p>Call ended</p>;

    case 'ending':
      return <p>Disconnecting...</p>;
  }
}
```

### Status Values

| Status | Meaning | Extra fields |
|--------|---------|--------------|
| `connecting` | WebRTC connecting | — |
| `waiting` | Connected, waiting for video track | — |
| `ready` | Avatar video is streaming | `videoTrackRef` |
| `ending` | Disconnect in progress | — |
| `ended` | Session terminated | — |
| `error` | Something went wrong | `error: Error` |

### AvatarVideo Render Prop

`AvatarVideo` also exposes the video-relevant statuses as a render prop:

```tsx
<AvatarVideo>
  {(avatar) => {
    switch (avatar.status) {
      case 'connecting':
        return <Spinner />;
      case 'waiting':
        return <p>Waiting for video...</p>;
      case 'ready':
        return <VideoTrack trackRef={avatar.videoTrackRef} />;
    }
  }}
</AvatarVideo>
```

The render prop provides a subset of statuses relevant to video: `connecting`, `waiting`, and `ready`.

---

## Full Control: AvatarSession

For complete control over **both** loading phases, use `AvatarSession` directly. This lets you:
- Show custom UI during credential fetching (Phase 1)
- Fully control the session lifecycle

```tsx
import { AvatarSession, AvatarVideo, ControlBar } from '@runwayml/avatars-react';
import type { SessionCredentials } from '@runwayml/avatars-react';

function CustomAvatarPage() {
  const [credentials, setCredentials] = useState<SessionCredentials | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/avatar/connect', {
      method: 'POST',
      body: JSON.stringify({ avatarId: 'game-host' }),
    })
      .then((res) => res.json())
      .then(setCredentials)
      .catch(setError);
  }, []);

  // Phase 1: You control this entirely
  if (error) return <p>Failed to connect: {error.message}</p>;
  if (!credentials) return <MyCustomLoadingUI />;

  // Phase 2: Children rendered inside session context
  return (
    <AvatarSession credentials={credentials}>
      <AvatarVideo />
      <ControlBar />
    </AvatarSession>
  );
}
```

---

## Error Handling

Handle errors with the `onError` callback:

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  onError={(error) => {
    console.error('Avatar error:', error);
    // Show error UI, retry, etc.
  }}
/>
```

Or check for errors with `useAvatarStatus` (during Phase 2):

```tsx
function AvatarUI() {
  const avatar = useAvatarStatus();

  if (avatar.status === 'error') {
    return <p>Failed to connect: {avatar.error.message}</p>;
  }

  // ... rest of UI
}
```

---

## Complete Example

Full custom UI with loading states (Phase 2 only — Phase 1 uses default loading UI):

```tsx
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
  useAvatarStatus,
  VideoTrack,
} from '@runwayml/avatars-react';

function AvatarPage() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
      avatarImageUrl="/avatars/game-host.png"
      onError={(error) => console.error(error)}
    >
      <AvatarUI />
    </AvatarCall>
  );
}

function AvatarUI() {
  const avatar = useAvatarStatus();

  if (avatar.status === 'error') {
    return <ErrorScreen message={avatar.error.message} />;
  }

  return (
    <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden bg-gray-900">
      <AvatarVideo>
        {(videoStatus) => {
          switch (videoStatus.status) {
            case 'connecting':
            case 'waiting':
              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
                  <p className="text-white/70 text-sm">
                    {videoStatus.status === 'connecting' ? 'Connecting...' : 'Loading video...'}
                  </p>
                </div>
              );
            case 'ready':
              return <VideoTrack trackRef={videoStatus.videoTrackRef} className="w-full h-full object-cover" />;
          }
        }}
      </AvatarVideo>

      <ControlBar className="absolute bottom-4 left-1/2 -translate-x-1/2" />
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return <p className="text-red-500 text-center p-8">Failed to connect: {message}</p>;
}
```

---

---

## Tips

- **Set user expectations.** Session setup takes 10–30 seconds. Show a message like "This usually takes 10–20 seconds" so users don't think it's broken.
- **Use `avatarImageUrl`** to show who they'll be talking to during loading.
- **Show different messages per phase.** "Setting up session..." vs "Loading video..." helps users understand progress.
- **Add an indeterminate progress indicator** rather than a simple spinner — it better communicates that something is happening during a long wait.
- **Handle errors with `onError`** for credential fetching failures, and check `useAvatarStatus` for connection errors.
