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
 * Connection credentials returned from the Runway API
 * Used to connect to the LiveKit room for the avatar session
 */
export interface SessionCredentials {
  /** Unique session identifier */
  sessionId: string;
  /** LiveKit server URL */
  livekitUrl: string;
  /** Authentication token for the LiveKit room */
  token: string;
  /** Name of the LiveKit room */
  roomName: string;
}

/**
 * Options for consuming a session from the Runway API
 */
export interface ConsumeSessionOptions {
  /** The session ID to consume */
  sessionId: string;
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
 * Return type for useAvatar hook
 */
export interface UseAvatarReturn {
  /** The remote avatar participant */
  participant: import('livekit-client').RemoteParticipant | null;
  /** The avatar's video track reference (for use with VideoTrack component) */
  videoTrackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder | null;
  /** The avatar's audio track reference */
  audioTrackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder | null;
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
  localVideoTrackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder | null;
}
