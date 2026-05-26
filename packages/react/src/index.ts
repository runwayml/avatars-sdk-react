export { isTrackReference, VideoTrack } from '@livekit/components-react';
export { AudioRenderer } from './components/AudioRenderer';
export { AvatarCall } from './components/AvatarCall';
export { AvatarProvider } from './components/AvatarProvider';
export { AvatarSession } from './components/AvatarSession';
export type { AvatarVideoStatus } from './components/AvatarVideo';
export { AvatarVideo } from './components/AvatarVideo';
export { ConnectionIndicator } from './components/ConnectionIndicator';
export type { ConnectionIndicatorProps } from './components/ConnectionIndicator';
export { ConnectionQualityDevTools } from './components/ConnectionQualityDevTools';
export type { ConnectionQualityDevToolsProps } from './components/ConnectionQualityDevTools';
export { ControlBar } from './components/ControlBar';
export { PageActions } from './components/PageActions';
export { ScreenShareVideo } from './components/ScreenShareVideo';
export { UserVideo } from './components/UserVideo';
export { useConnectionCheck } from './hooks/useConnectionCheck';
export type { UseConnectionCheckReturn } from './hooks/useConnectionCheck';
export type {
  ConnectionQualityDiagnostics,
  ConnectionQualityWarningReason,
  UseConnectionQualityReturn,
} from './hooks/useConnectionQuality';
export { useConnectionQuality } from './hooks/useConnectionQuality';
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

// Re-export core types and utilities
export type {
  AvatarConnectionCheckOptions,
  AvatarConnectionCheckResult,
  ClientEvent,
  ClientEventFromTool,
  ClientEventHandler,
  ClientEventsFrom,
  ClientToolArgs,
  ClientToolDef,
  ConnectionCheckStatus,
  ConnectionCheckStep,
  ConnectionQuality,
  ConnectResponse,
  InferSchemaInput,
  InferSchemaOutput,
  SessionCredentials,
  SessionKeyResponse,
  SessionState,
  StandardSchemaIssue,
  StandardSchemaResult,
  StandardSchemaV1,
  TranscriptionEntry,
  TranscriptionHandler,
} from '@runwayml/avatars';
export {
  checkAvatarConnection,
  clientTool,
  connectionQualityWarningMessage,
  getClientToolSchema,
  isDegradedConnectionQuality,
  validateClientToolArgs,
} from '@runwayml/avatars';

// React-specific types
export type {
  AvatarCallProps,
  AvatarProviderProps,
  MediaDeviceErrors,
} from './types';
