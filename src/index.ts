// Components
export {
  AvatarSession,
  useAvatarSessionContext,
  useMaybeAvatarSessionContext,
} from './components/AvatarSession';

export {
  AvatarVideo,
  type AvatarVideoProps,
  type AvatarVideoState,
} from './components/AvatarVideo';

export { UserVideo, type UserVideoProps, type UserVideoState } from './components/UserVideo';

export { ControlBar, type ControlBarProps, type ControlBarState } from './components/ControlBar';

export {
  ScreenShareVideo,
  type ScreenShareVideoProps,
  type ScreenShareVideoState,
} from './components/ScreenShareVideo';

export { AudioRenderer } from './components/AudioRenderer';

// Hooks
export { useAvatarSession, type UseAvatarSessionReturn } from './hooks/useAvatarSession';

export { useAvatar } from './hooks/useAvatar';

export { useLocalMedia } from './hooks/useLocalMedia';

// API Client
export { consumeSession } from './api/consume';

// Types
export type {
  SessionState,
  SessionCredentials,
  ConsumeSessionOptions,
  AvatarSessionContextValue,
  AvatarSessionProps,
  UseAvatarReturn,
  UseLocalMediaReturn,
} from './types';
