/**
 * @runwayml/avatars-react Types
 *
 * React-specific types. Core types are re-exported from @runwayml/avatars.
 */

import type {
  ClientEvent,
  ClientEventHandler,
  ConnectResponse,
  SessionCredentials,
  SessionState,
} from '@runwayml/avatars';

export type {
  ClientEvent,
  ClientEventHandler,
  ConnectResponse,
  SessionCredentials,
  SessionKeyResponse,
  SessionState,
  ConsumeSessionOptions,
  ConsumeSessionResponse,
  TranscriptionEntry,
  TranscriptionHandler,
} from '@runwayml/avatars';

export interface AvatarSessionContextValue {
  state: SessionState;
  sessionId: string;
  error: Error | null;
  end: () => Promise<void>;
}

export interface AvatarSessionProps<E extends ClientEvent = ClientEvent> {
  credentials: SessionCredentials;
  children: React.ReactNode;
  audio?: boolean;
  video?: boolean;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onClientEvent?: ClientEventHandler<E>;
  initialScreenStream?: MediaStream;
  /** @internal */
  __unstable_roomOptions?: import('livekit-client').RoomOptions;
}

export interface AvatarProviderProps<E extends ClientEvent = ClientEvent> {
  avatarId: string;
  sessionId?: string;
  sessionKey?: string;
  credentials?: SessionCredentials;
  connectUrl?: string;
  connect?: (avatarId: string) => Promise<ConnectResponse>;
  baseUrl?: string;
  audio?: boolean;
  video?: boolean;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onClientEvent?: ClientEventHandler<E>;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  initialScreenStream?: MediaStream;
  /** @internal */
  __unstable_roomOptions?: import('livekit-client').RoomOptions;
}

export interface AvatarCallProps<E extends ClientEvent = ClientEvent>
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onError'>,
    Omit<AvatarProviderProps<E>, 'fallback'> {
  avatarImageUrl?: string;
}

export interface UseAvatarReturn {
  participant: import('livekit-client').RemoteParticipant | null;
  videoTrackRef:
    | import('@livekit/components-react').TrackReferenceOrPlaceholder
    | null;
  hasVideo: boolean;
}

export interface MediaDeviceErrors {
  micError: Error | null;
  cameraError: Error | null;
  retryMic: () => Promise<void>;
  retryCamera: () => Promise<void>;
}

export interface UseLocalMediaReturn extends MediaDeviceErrors {
  hasMic: boolean;
  hasCamera: boolean;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  localVideoTrackRef:
    | import('@livekit/components-react').TrackReferenceOrPlaceholder
    | null;
}
