/**
 * @runwayml/avatars-react Types
 *
 * Shared types for the avatar session library.
 */

/**
 * Client-side session states for UI rendering
 */
export type SessionState =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'ending'
  | 'ended'
  | 'error';

/**
 * Connection credentials returned from the Runway API consume endpoint
 */
export interface ConsumeSessionResponse {
  /** WebRTC server URL */
  url: string;
  /** Authentication token */
  token: string;
  /** Room name for the session */
  roomName: string;
}

/**
 * Connection credentials for AvatarSession component
 */
export interface SessionCredentials {
  /** Unique session identifier */
  sessionId: string;
  /** WebRTC server URL */
  serverUrl: string;
  /** Authentication token */
  token: string;
  /** Room name for the session */
  roomName: string;
}

/**
 * Options for consuming a session from the Runway API
 */
export interface ConsumeSessionOptions {
  /** The session ID to consume */
  sessionId: string;
  /** The session key for authentication (from GET session response when READY) */
  sessionKey: string;
  /** Optional base URL for the Runway API (defaults to production) */
  baseUrl?: string;
}

/**
 * Avatar session context value exposed to consumers
 */
export interface AvatarSessionContextValue {
  /** Current session state */
  state: SessionState;
  /** Session identifier */
  sessionId: string;
  /** Current error, if any */
  error: Error | null;
  /** End the current session */
  end: () => Promise<void>;
}

/**
 * Props for the AvatarSession component
 */
export interface AvatarSessionProps {
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

/**
 * Props for the AvatarCall component
 */
export interface AvatarCallProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onError'> {
  /** The avatar ID to connect to */
  avatarId: string;
  /** Session ID (use with sessionKey - package will call consumeSession) */
  sessionId?: string;
  /** Session key (use with sessionId - package will call consumeSession) */
  sessionKey?: string;
  /** Pre-fetched credentials (for advanced users who called consumeSession themselves) */
  credentials?: SessionCredentials;
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

/**
 * Return type for useAvatar hook
 */
export interface UseAvatarReturn {
  /** The remote avatar participant */
  participant: import('livekit-client').RemoteParticipant | null;
  /** The avatar's video track reference (for use with VideoTrack component) */
  videoTrackRef:
    | import('@livekit/components-react').TrackReferenceOrPlaceholder
    | null;
  /** The avatar's audio track reference */
  audioTrackRef:
    | import('@livekit/components-react').TrackReferenceOrPlaceholder
    | null;
  /** Whether the avatar is currently speaking */
  isSpeaking: boolean;
  /** Whether the avatar has video */
  hasVideo: boolean;
  /** Whether the avatar has audio */
  hasAudio: boolean;
}

/**
 * Return type for useLocalMedia hook
 */
export interface UseLocalMediaReturn {
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
  localVideoTrackRef:
    | import('@livekit/components-react').TrackReferenceOrPlaceholder
    | null;
}
