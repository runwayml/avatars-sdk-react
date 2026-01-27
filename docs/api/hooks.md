# Hooks

All hooks must be used within an `AvatarCall` or `AvatarSession` component.

## Overview

| Hook | Purpose |
|------|---------|
| `useAvatarSession` | Access session state and controls |
| `useAvatar` | Access remote avatar tracks and state |
| `useLocalMedia` | Control local camera and microphone |

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

Access the remote avatar's participant data and media tracks.

### Return Type

```typescript
interface UseAvatarReturn {
  participant: RemoteParticipant | null;
  videoTrackRef: TrackReferenceOrPlaceholder | null;
  audioTrackRef: TrackReferenceOrPlaceholder | null;
  isSpeaking: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `participant` | `RemoteParticipant \| null` | LiveKit remote participant |
| `videoTrackRef` | `TrackReferenceOrPlaceholder \| null` | Video track for rendering |
| `audioTrackRef` | `TrackReferenceOrPlaceholder \| null` | Audio track reference |
| `isSpeaking` | `boolean` | Whether avatar is currently speaking |
| `hasVideo` | `boolean` | Whether avatar has video |
| `hasAudio` | `boolean` | Whether avatar has audio |

### Usage

```tsx
function AvatarStatus() {
  const { isSpeaking, hasVideo, hasAudio } = useAvatar();

  return (
    <div>
      <p>Video: {hasVideo ? 'Yes' : 'No'}</p>
      <p>Audio: {hasAudio ? 'Yes' : 'No'}</p>
      <p>Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Custom Video Rendering

```tsx
import { VideoTrack } from '@livekit/components-react';

function CustomAvatarVideo() {
  const { videoTrackRef, isSpeaking, hasVideo } = useAvatar();

  if (!hasVideo || !videoTrackRef) {
    return <Placeholder />;
  }

  return (
    <div className={isSpeaking ? 'speaking' : ''}>
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

```tsx
function FullCustomUI() {
  const session = useAvatarSession();
  const avatar = useAvatar();
  const media = useLocalMedia();

  if (session.state === 'connecting') {
    return <Loading />;
  }

  if (session.state === 'error') {
    return <Error message={session.error.message} />;
  }

  return (
    <div>
      {/* Avatar video with speaking indicator */}
      <div className={avatar.isSpeaking ? 'speaking' : ''}>
        {avatar.hasVideo && avatar.videoTrackRef && (
          <VideoTrack trackRef={avatar.videoTrackRef} />
        )}
      </div>

      {/* Controls */}
      <div>
        <button onClick={media.toggleMic}>
          {media.isMicEnabled ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={session.end}>End Call</button>
      </div>
    </div>
  );
}
```
