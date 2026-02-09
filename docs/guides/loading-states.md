# Loading States

Connecting to an AI avatar involves multiple steps that can take **10–30 seconds**. The SDK uses React Suspense to make loading states easy to handle.

## The Two Loading Phases

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
│ Handled by: Suspense     │     │ Handled by: useAvatarStatus │
└──────────────────────────┘     └─────────────────────────┘
```

**Phase 1 (Session Setup):** Your server creates a Runway session, polls until ready, and returns WebRTC credentials. `AvatarCall` **suspends** during this phase — wrap it in `<Suspense>` to show a loading fallback.

**Phase 2 (Video Loading):** The client establishes a WebRTC connection and waits for the avatar's video track. Use the `useAvatarStatus` hook or `AvatarVideo` render prop to show appropriate UI.

---

## Quick Start

```tsx
import { Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect" />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-lg">Setting up your session...</p>
      <p className="text-sm text-gray-400">This usually takes 10–20 seconds</p>
      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
    </div>
  );
}
```

That's it. When credentials are ready, `AvatarCall` renders. While fetching, React shows your `<Suspense>` fallback.

---

## Phase 1: Session Setup (Suspense)

`AvatarCall` suspends during credential fetching, integrating with React's built-in `<Suspense>` component. This means:

- **Loading UI** is defined at the call site, not buried in a prop
- **Error handling** works with Error Boundaries
- **Composition** — nest boundaries, share fallbacks, combine with other suspending components

### With Error Boundary

Handle both loading and error states declaratively:

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <Suspense fallback={<LoadingScreen />}>
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect" />
  </Suspense>
</ErrorBoundary>
```

### With Avatar Placeholder Image

Combine `<Suspense>` with `avatarImageUrl` for a polished loading experience:

```tsx
<Suspense
  fallback={
    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
      <img
        src="/avatars/game-host.png"
        alt=""
        className="w-full h-full object-cover opacity-40 blur-sm"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-white text-lg font-medium">Connecting to avatar...</p>
        <div className="mt-3 animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    </div>
  }
>
  <AvatarCall
    avatarId="game-host"
    connectUrl="/api/avatar/connect"
    avatarImageUrl="/avatars/game-host.png"
  />
</Suspense>
```

---

## Phase 2: Video Loading (useAvatarStatus)

After credentials arrive, the WebRTC connection begins. Use the `useAvatarStatus` hook inside `<AvatarCall>` to track the full lifecycle as a single discriminated union:

```tsx
import { useAvatarStatus } from '@runwayml/avatars-react';
import { VideoTrack } from '@runwayml/avatars-react';

function MyAvatarUI() {
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
| `connecting` | WebRTC connection in progress | — |
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

## Complete Example

Handling both phases with full custom UI:

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
  useAvatarStatus,
} from '@runwayml/avatars-react';
import { VideoTrack } from '@runwayml/avatars-react';

function AvatarPage() {
  return (
    <ErrorBoundary fallback={<ErrorScreen />}>
      <Suspense fallback={<SessionSetupLoading />}>
        <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
          <AvatarUI />
        </AvatarCall>
      </Suspense>
    </ErrorBoundary>
  );
}

/** Phase 1 fallback — shown during server-side session creation */
function SessionSetupLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-900 rounded-xl gap-3">
      <div className="animate-pulse">
        <img src="/avatars/game-host.png" alt="" className="w-20 h-20 rounded-full opacity-80" />
      </div>
      <p className="text-white font-medium">Setting up your session...</p>
      <p className="text-white/50 text-sm">This usually takes 10–20 seconds</p>
    </div>
  );
}

/** Phase 2 — shown after credentials arrive */
function AvatarUI() {
  return (
    <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden bg-gray-900">
      <AvatarVideo>
        {(avatar) => {
          switch (avatar.status) {
            case 'connecting':
            case 'waiting':
              return (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
                  <p className="text-white/70 text-sm">
                    {avatar.status === 'connecting' ? 'Connecting...' : 'Loading video...'}
                  </p>
                </div>
              );
            case 'ready':
              return <VideoTrack trackRef={avatar.videoTrackRef} className="w-full h-full object-cover" />;
          }
        }}
      </AvatarVideo>

      <ControlBar className="absolute bottom-4 left-1/2 -translate-x-1/2" />
    </div>
  );
}

function ErrorScreen() {
  return <p className="text-red-500 text-center p-8">Failed to connect. Please try again.</p>;
}
```

---

## Low-Level: AvatarSession

If you manage credentials yourself with `AvatarSession`, you handle Phase 1 entirely in your own code:

```tsx
import { AvatarSession, AvatarVideo, ControlBar, useAvatarStatus } from '@runwayml/avatars-react';
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
  if (!credentials) return <Spinner label="Creating avatar session..." />;

  // Phase 2: useAvatarStatus handles the rest inside AvatarSession
  return (
    <AvatarSession credentials={credentials}>
      <CustomVideoUI />
      <ControlBar />
    </AvatarSession>
  );
}

function CustomVideoUI() {
  const avatar = useAvatarStatus();

  switch (avatar.status) {
    case 'connecting':
    case 'waiting':
      return <Spinner />;
    case 'ready':
      return <VideoTrack trackRef={avatar.videoTrackRef} />;
    case 'error':
      return <p>{avatar.error.message}</p>;
    default:
      return null;
  }
}
```

---

## Tips

- **Set user expectations.** Session setup takes 10–30 seconds. Show a message like "This usually takes 10–20 seconds" so users don't think it's broken.
- **Use `avatarImageUrl`** to show who they'll be talking to during the Suspense fallback.
- **Show different messages per phase.** "Setting up session..." for Phase 1 (Suspense fallback) vs "Loading video..." for Phase 2 (`useAvatarStatus`) helps users understand progress.
- **Add an indeterminate progress indicator** rather than a simple spinner — it better communicates that something is happening during a long wait.
- **Handle errors with Error Boundaries.** Phase 1 errors (credential fetching failures) throw to the nearest Error Boundary. Phase 2 errors are available via `useAvatarStatus` with `status: 'error'`.
