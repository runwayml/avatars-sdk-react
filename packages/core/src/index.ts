export { checkAvatarConnection } from './connection-check';
export type {
  AvatarConnectionCheckOptions,
  AvatarConnectionCheckResult,
  ConnectionCheckStatus,
  ConnectionCheckStep,
} from './connection-check';
export {
  CONNECTION_QUALITY_HIDE_DELAY_MS,
  CONNECTION_QUALITY_SHOW_DELAY_MS,
  connectionQualityWarningMessage,
  isDegradedConnectionQuality,
  shouldShowConnectionQualityWarning,
} from './connection-quality';
export {
  CONNECTION_STATS_PACKET_LOSS_RATIO,
  CONNECTION_STATS_RTT_THRESHOLD_MS,
  isRtcStatsDegraded,
  summarizeRtcStats,
} from './connection-stats';
export type { RtcStatsSummary } from './connection-stats';
export { AvatarSession, connect, streamTo } from './client';
export { AvatarError } from './error';
export type { AvatarErrorCode } from './error';
export { TranscriptAccumulator } from './transcript-accumulator';
export { consumeSession } from './api/consume';

export { AvatarEvent } from './types';
export type {
  ActiveSpeaker,
  AvatarEventMap,
  ClientEvent,
  ClientEventHandler,
  ConnectionQuality,
  ConsumeSessionOptions,
  ConsumeSessionResponse,
  ConnectResponse,
  MediaController,
  MicPermissionState,
  ScreenShareController,
  SessionCredentials,
  SessionKeyResponse,
  SessionState,
  TranscriptOptions,
  TranscriptionEntry,
  TranscriptionHandler,
} from './types';

export {
  clientTool,
  getClientToolSchema,
  validateClientToolArgs,
} from './tools';
export type {
  ClientEventFromTool,
  ClientEventsFrom,
  ClientToolArgs,
  ClientToolDef,
} from './tools';

export type {
  InferSchemaInput,
  InferSchemaOutput,
  StandardSchemaIssue,
  StandardSchemaResult,
  StandardSchemaV1,
} from './standard-schema';

// Utilities needed by framework bindings
export { parseClientEvent } from './utils/parseClientEvent';
export { FlatDeltaAccumulator } from './utils/flatDeltaAccumulator';
export {
  tryDecodeJSON,
  tryParseFlatDelta,
  tryParseSegmentArray,
} from './utils/parseTranscription';
export { pageActionTools } from './api/page-actions';
export type { PageActionEvent } from './api/page-actions';
