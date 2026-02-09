# API Reference

Complete reference for all components, hooks, and types in `@runwayml/avatars-react`.

## Components

### AvatarCall

High-level component that manages the complete session lifecycle.

```tsx
import { AvatarCall } from '@runwayml/avatars-react';

<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  onEnd={() => console.log('Ended')}
  onError={(error) => console.error(error)}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `avatarId` | `string` | ✓ | Avatar preset ID |
| `connectUrl` | `string` | * | URL to POST for credentials |
| `connect` | `(avatarId: string) => Promise<SessionCredentials>` | * | Custom connect function |
| `sessionId` | `string` | * | Session ID (use with `sessionKey`) |
| `sessionKey` | `string` | * | Session key (use with `sessionId`) |
| `credentials` | `SessionCredentials` | * | Pre-fetched credentials |
| `baseUrl` | `string` | | Runway API base URL |
| `avatarImageUrl` | `string` | | Placeholder image URL |
| `onEnd` | `() => void` | | Called when session ends |
| `onError` | `(error: Error) => void` | | Called on error |
| `children` | `ReactNode` | | Custom layout |

*One of these is required: `connectUrl`, `connect`, `sessionId`+`sessionKey`, or `credentials`.

---

### AvatarSession

Low-level component for custom session management.

```tsx
import { AvatarSession } from '@runwayml/avatars-react';

<AvatarSession
  credentials={credentials}
  onEnd={() => console.log('Ended')}
>
  <AvatarVideo />
  <ControlBar />
</AvatarSession>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `credentials` | `SessionCredentials` | ✓ | Session credentials |
| `children` | `ReactNode` | ✓ | Child components |
| `audio` | `boolean` | | Enable audio (default: true) |
| `video` | `boolean` | | Enable video (default: true) |
| `onEnd` | `() => void` | | Called when session ends |
| `onError` | `(error: Error) => void` | | Called on error |

---

### AvatarVideo

Renders the remote avatar video stream.

```tsx
// Default rendering
<AvatarVideo className="avatar" />

// With render prop
<AvatarVideo>
  {({ hasVideo, isConnecting, trackRef }) => (
    // Custom rendering
  )}
</AvatarVideo>
```

**Render Prop State:**

| Property | Type | Description |
|----------|------|-------------|
| `hasVideo` | `boolean` | Video track available |
| `isConnecting` | `boolean` | Connection in progress |
| `trackRef` | `TrackReferenceOrPlaceholder \| null` | Video track |

---

### UserVideo

Renders the local user's camera.

```tsx
<UserVideo mirror={true} className="self-view" />

<UserVideo>
  {({ hasVideo, isCameraEnabled, trackRef }) => (
    // Custom rendering
  )}
</UserVideo>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mirror` | `boolean` | `true` | Mirror the video |

---

### ControlBar

Media control buttons.

```tsx
<ControlBar
  showMicrophone
  showCamera
  showScreenShare
  showEndCall
/>

<ControlBar>
  {({ isMicEnabled, toggleMic, endCall }) => (
    // Custom controls
  )}
</ControlBar>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showMicrophone` | `boolean` | `true` | Show mic button |
| `showCamera` | `boolean` | `true` | Show camera button |
| `showScreenShare` | `boolean` | `false` | Show screen share button |
| `showEndCall` | `boolean` | `true` | Show end call button |

---

### ScreenShareVideo

Renders screen share content.

```tsx
<ScreenShareVideo>
  {({ isSharing, trackRef }) => (
    isSharing && <VideoTrack trackRef={trackRef} />
  )}
</ScreenShareVideo>
```

---

## Hooks

### useAvatarSession

Access session state and controls. Must be used within `AvatarCall` or `AvatarSession`.

```tsx
const { state, sessionId, error, end } = useAvatarSession();
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `state` | `SessionState` | Current state |
| `sessionId` | `string` | Session ID |
| `error` | `Error \| null` | Error (when state is 'error') |
| `end` | `() => Promise<void>` | End session |

---

### useAvatar

Access remote avatar video track. Must be used within `AvatarCall` or `AvatarSession`. Audio is handled automatically by the session.

```tsx
const { participant, videoTrackRef, hasVideo } = useAvatar();
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `participant` | `RemoteParticipant \| null` | Remote avatar participant |
| `videoTrackRef` | `TrackReferenceOrPlaceholder \| null` | Video track |
| `hasVideo` | `boolean` | Has video track |

---

### useLocalMedia

Control local camera and microphone. Must be used within `AvatarCall` or `AvatarSession`.

```tsx
const {
  hasMic,
  hasCamera,
  isMicEnabled,
  isCameraEnabled,
  isScreenShareEnabled,
  toggleMic,
  toggleCamera,
  toggleScreenShare,
  localVideoTrackRef,
} = useLocalMedia();
```

---

## Types

### SessionCredentials

```typescript
interface SessionCredentials {
  sessionId: string;
  serverUrl: string;
  token: string;
  roomName: string;
}
```

### SessionState

```typescript
type SessionState =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'ending'
  | 'ended'
  | 'error';
```

---

## Importing

```typescript
// Components
import {
  AvatarCall,
  AvatarSession,
  AvatarVideo,
  UserVideo,
  ControlBar,
  ScreenShareVideo,
  AudioRenderer,
} from '@runwayml/avatars-react';

// Hooks
import {
  useAvatarSession,
  useAvatar,
  useLocalMedia,
} from '@runwayml/avatars-react';

// Types
import type {
  SessionCredentials,
  SessionState,
  AvatarCallProps,
  AvatarSessionProps,
} from '@runwayml/avatars-react';

// Styles (optional)
import '@runwayml/avatars-react/styles.css';
```
