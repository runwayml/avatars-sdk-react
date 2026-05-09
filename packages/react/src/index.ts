export { isTrackReference, VideoTrack } from '@livekit/components-react';
export { AudioRenderer } from './components/AudioRenderer';
export { AvatarCall } from './components/AvatarCall';
export { AvatarProvider } from './components/AvatarProvider';
export { AvatarSession } from './components/AvatarSession';
export type { AvatarVideoStatus } from './components/AvatarVideo';
export { AvatarVideo } from './components/AvatarVideo';
export { ControlBar } from './components/ControlBar';
export { PageActions } from './components/PageActions';
export { ScreenShareVideo } from './components/ScreenShareVideo';
export { UserVideo } from './components/UserVideo';
export { useAvatar } from './hooks/useAvatar';
export { useAvatarSession } from './hooks/useAvatarSession';
export type { AvatarStatus } from './hooks/useAvatarStatus';
export { useAvatarStatus } from './hooks/useAvatarStatus';
export { useClientEvent } from './hooks/useClientEvent';
export { useClientEvents } from './hooks/useClientEvents';
export { useLocalMedia } from './hooks/useLocalMedia';
export type { PageActionsOptions } from './hooks/usePageActions';
export { usePageActions } from './hooks/usePageActions';
export type { UseTranscriptOptions } from './hooks/useTranscript';
export { useTranscript } from './hooks/useTranscript';
export { useTranscription } from './hooks/useTranscription';

// Re-export core types and utilities so React users don't need to install @runwayml/avatars separately
export type {
  InferSchemaInput,
  InferSchemaOutput,
  StandardSchemaIssue,
  StandardSchemaResult,
  StandardSchemaV1,
} from '@runwayml/avatars';
export type {
  ClientEventFromTool,
  ClientEventsFrom,
  ClientToolArgs,
  ClientToolDef,
} from '@runwayml/avatars';
export {
  clientTool,
  getClientToolSchema,
  validateClientToolArgs,
} from '@runwayml/avatars';
export type {
  ClientEvent,
  ClientEventHandler,
  ConnectResponse,
  SessionCredentials,
  SessionKeyResponse,
  SessionState,
  TranscriptionEntry,
  TranscriptionHandler,
} from '@runwayml/avatars';

// React-specific types
export type {
  AvatarCallProps,
  AvatarProviderProps,
  MediaDeviceErrors,
} from './types';
