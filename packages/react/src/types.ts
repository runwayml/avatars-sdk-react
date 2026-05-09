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
}

export interface AvatarCallProps<E extends ClientEvent = ClientEvent>
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onError'>,
    Omit<AvatarProviderProps<E>, 'fallback'> {
  avatarImageUrl?: string;
}

export interface MediaDeviceErrors {
  micError: Error | null;
  cameraError: Error | null;
  retryMic: () => Promise<void>;
  retryCamera: () => Promise<void>;
}
