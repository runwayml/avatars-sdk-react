# TypeScript Types

## Session Types

### SessionState

```typescript
type SessionState =
  | 'idle'        // Initial state, not connected
  | 'connecting'  // Fetching credentials or establishing WebRTC
  | 'active'      // Connected and streaming
  | 'ending'      // Disconnection in progress
  | 'ended'       // Session terminated
  | 'error';      // An error occurred
```

### SessionCredentials

Credentials returned from your server endpoint:

```typescript
interface SessionCredentials {
  /** Unique session identifier */
  sessionId: string;
  /** WebRTC server URL */
  serverUrl: string;
  /** Authentication token */
  token: string;
  /** Room name for the session */
  roomName: string;
}
```

---

## Component Props

### AvatarCallProps

```typescript
interface AvatarCallProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onError'> {
  /** The avatar ID to connect to */
  avatarId: string;
  /** URL to POST { avatarId } to get SessionCredentials */
  connectUrl?: string;
  /** Custom function to fetch SessionCredentials */
  connect?: (avatarId: string) => Promise<SessionCredentials>;
  /** Avatar image URL for placeholder/loading states */
  avatarImageUrl?: string;
  /** Callback when session ends */
  onEnd?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Custom children - defaults to AvatarVideo + ControlBar if not provided */
  children?: React.ReactNode;
}
```

### AvatarSessionProps

```typescript
interface AvatarSessionProps {
  /** Connection credentials from Runway API */
  credentials: SessionCredentials;
  /** Children to render inside the session */
  children: React.ReactNode;
  /** Enable audio on connect (default: true) */
  audio?: boolean;
  /** Enable video on connect (default: true) */
  video?: boolean;
  /** Callback when session ends */
  onEnd?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}
```

---

## Hook Return Types

### UseAvatarSessionReturn

Discriminated union for type-safe state handling:

```typescript
type UseAvatarSessionReturn =
  | { state: 'idle'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'connecting'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'active'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'ending'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'ended'; sessionId: string; error: null; end: () => Promise<void> }
  | { state: 'error'; sessionId: string; error: Error; end: () => Promise<void> };
```

### UseAvatarReturn

```typescript
interface UseAvatarReturn {
  /** The remote avatar participant */
  participant: import('livekit-client').RemoteParticipant | null;
  /** The avatar's video track reference */
  videoTrackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder | null;
  /** Whether the avatar has video */
  hasVideo: boolean;
}
```

### UseLocalMediaReturn

```typescript
interface UseLocalMediaReturn {
  /** Whether a microphone device is available */
  hasMic: boolean;
  /** Whether a camera device is available */
  hasCamera: boolean;
  /** Whether the microphone is currently enabled */
  isMicEnabled: boolean;
  /** Whether the camera is currently enabled */
  isCameraEnabled: boolean;
  /** Whether screen sharing is currently enabled */
  isScreenShareEnabled: boolean;
  /** Toggle the microphone on/off */
  toggleMic: () => void;
  /** Toggle the camera on/off */
  toggleCamera: () => void;
  /** Toggle screen sharing on/off */
  toggleScreenShare: () => void;
  /** The local video track reference */
  localVideoTrackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder | null;
}
```

---

## Importing Types

```typescript
import type {
  SessionState,
  SessionCredentials,
  AvatarCallProps,
  AvatarSessionProps,
  UseAvatarReturn,
  UseLocalMediaReturn,
  AvatarSessionContextValue,
} from '@runwayml/avatars-react';
```
