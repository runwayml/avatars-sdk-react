# Hooks

All hooks must be used within an `AvatarCall` or `AvatarSession` component.

## Overview

| Hook | Purpose |
|------|---------|
| `useAvatarStatus` | **Recommended.** Single discriminated union of the full avatar lifecycle |
| `useAvatarSession` | Access session state and controls |
| `useAvatar` | Access remote avatar tracks and state |
| `useLocalMedia` | Control local camera and microphone |

---

## useAvatarStatus

**Recommended for most use cases.** Returns a single discriminated union that combines session connection state and video availability into one status value.

### Return Type

```typescript
type AvatarStatus =
  | { status: 'connecting' }
  | { status: 'waiting' }
  | { status: 'ready'; videoTrackRef: TrackReferenceOrPlaceholder }
  | { status: 'ending' }
  | { status: 'ended' }
  | { status: 'error'; error: Error };
```

### Status Values

| Status | Meaning | Extra fields |
|--------|---------|--------------|
| `connecting` | WebRTC connection in progress | — |
| `waiting` | Connected, waiting for video track to arrive | — |
| `ready` | Avatar video is streaming | `videoTrackRef` |
| `ending` | Disconnect in progress | — |
| `ended` | Session terminated | — |
| `error` | Something went wrong | `error: Error` |

### Usage

```tsx
import { VideoTrack } from '@runwayml/avatars-react';

function MyAvatar() {
  const avatar = useAvatarStatus();

  switch (avatar.status) {
    case 'connecting':
      return <Spinner label="Connecting..." />;

    case 'waiting':
      return <Spinner label="Loading video..." />;

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

### When to Use

Use `useAvatarStatus` when you want a simple, switch-based approach to rendering different UI for each phase. For lower-level control (e.g., accessing the raw participant, ending the session), combine with `useAvatarSession` and `useAvatar`.

---

## useAvatarSession

Access the current session state and control the session.

### Return Type

Returns a discriminated union based on state:

```typescript
type UseAvatarSessionReturn =
  | { state: 'idle'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'connecting'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'active'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'ending'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'ended'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'error'; sessionId: string; error: Error; end: () => Promise<void> };
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | `SessionState` | Current session state |
| `sessionId` | `string` | Unique session identifier |
| `error` | `Error \| null` | Error object when state is `'error'` |
| `end` | `() => Promise<void>` | End the session |

### Usage

```tsx
function SessionStatus() {
  const { state, sessionId, error, end } = useAvatarSession();

  return (
    <div>
      <p>State: {state}</p>
      <p>Session: {sessionId}</p>
      {error && <p>Error: {error.message}</p>}
      {state === 'active' && (
        <button onClick={end}>End Call</button>
      )}
    </div>
  );
}
```

### Type-Safe State Handling

```tsx
function MyComponent() {
  const session = useAvatarSession();

  // TypeScript narrows the type based on state
  switch (session.state) {
    case 'connecting':
      return <Spinner />;

    case 'active':
      return <ActiveCall onEnd={session.end} />;

    case 'error':
      // session.error is guaranteed to be Error here
      return <ErrorMessage error={session.error} />;

    case 'ended':
      return <CallEnded />;

    default:
      return null;
  }
}
```

---

## useAvatar

Access the remote avatar's participant data and video track. Audio is handled automatically by the session.

### Return Type

```typescript
interface UseAvatarReturn {
  participant: RemoteParticipant | null;
  videoTrackRef: TrackReferenceOrPlaceholder | null;
  hasVideo: boolean;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `participant` | `RemoteParticipant \| null` | Remote avatar participant |
| `videoTrackRef` | `TrackReferenceOrPlaceholder \| null` | Video track for rendering |
| `hasVideo` | `boolean` | Whether avatar has video |

### Usage

```tsx
function AvatarStatus() {
  const { hasVideo } = useAvatar();

  return (
    <div>
      <p>Video: {hasVideo ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Custom Video Rendering

```tsx
import { VideoTrack } from '@runwayml/avatars-react';

function CustomAvatarVideo() {
  const { videoTrackRef, hasVideo } = useAvatar();

  if (!hasVideo || !videoTrackRef) {
    return <Placeholder />;
  }

  return (
    <div>
      <VideoTrack trackRef={videoTrackRef} />
    </div>
  );
}
```

---

## useLocalMedia

Control the local user's camera and microphone.

### Return Type

```typescript
interface UseLocalMediaReturn {
  hasMic: boolean;
  hasCamera: boolean;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  localVideoTrackRef: TrackReferenceOrPlaceholder | null;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `hasMic` | `boolean` | Whether a microphone device exists |
| `hasCamera` | `boolean` | Whether a camera device exists |
| `isMicEnabled` | `boolean` | Whether microphone is currently on |
| `isCameraEnabled` | `boolean` | Whether camera is currently on |
| `isScreenShareEnabled` | `boolean` | Whether screen share is active |
| `toggleMic` | `() => void` | Toggle microphone on/off |
| `toggleCamera` | `() => void` | Toggle camera on/off |
| `toggleScreenShare` | `() => void` | Toggle screen share on/off |
| `localVideoTrackRef` | `TrackReferenceOrPlaceholder \| null` | Local video track |

### Usage

```tsx
function MediaControls() {
  const {
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    hasMic,
    hasCamera,
  } = useLocalMedia();

  return (
    <div>
      <button onClick={toggleMic} disabled={!hasMic}>
        {isMicEnabled ? 'Mute' : 'Unmute'}
      </button>
      <button onClick={toggleCamera} disabled={!hasCamera}>
        {isCameraEnabled ? 'Hide Camera' : 'Show Camera'}
      </button>
    </div>
  );
}
```

### Screen Share Control

```tsx
function ScreenShareButton() {
  const { isScreenShareEnabled, toggleScreenShare } = useLocalMedia();

  return (
    <button onClick={toggleScreenShare}>
      {isScreenShareEnabled ? 'Stop Sharing' : 'Share Screen'}
    </button>
  );
}
```

### Device Availability

```tsx
function DeviceStatus() {
  const { hasMic, hasCamera } = useLocalMedia();

  return (
    <div>
      {!hasMic && <p>No microphone detected</p>}
      {!hasCamera && <p>No camera detected</p>}
    </div>
  );
}
```

---

## Combining Hooks

Use `useAvatarStatus` for rendering and `useAvatarSession` for controls:

```tsx
function FullCustomUI() {
  const avatar = useAvatarStatus();
  const session = useAvatarSession();
  const media = useLocalMedia();

  switch (avatar.status) {
    case 'connecting':
    case 'waiting':
      return <Loading />;

    case 'error':
      return <Error message={avatar.error.message} />;

    case 'ended':
      return <CallEnded />;

    case 'ready':
      return (
        <div>
          {/* Avatar video */}
          <VideoTrack trackRef={avatar.videoTrackRef} />

          {/* Controls */}
          <div>
            <button onClick={media.toggleMic}>
              {media.isMicEnabled ? 'Mute' : 'Unmute'}
            </button>
            <button onClick={session.end}>End Call</button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
```
