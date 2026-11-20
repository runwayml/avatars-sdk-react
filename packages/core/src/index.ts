export { consumeSession } from './api/consume';
export type { PageActionEvent } from './api/page-actions';
export { pageActionTools } from './api/page-actions';
export { AvatarSession, connect, streamTo } from './client';
export type { AvatarErrorCode } from './error';
export { AvatarError } from './error';
export type {
  InferSchemaInput,
  InferSchemaOutput,
  StandardSchemaIssue,
  StandardSchemaResult,
  StandardSchemaV1,
} from './standard-schema';
export type {
  ClientEventFromTool,
  ClientEventsFrom,
  ClientToolArgs,
  ClientToolDef,
} from './tools';
export {
  clientTool,
  getClientToolSchema,
  validateClientToolArgs,
} from './tools';
export { TranscriptAccumulator } from './transcript-accumulator';
export type {
  ActiveSpeaker,
  AvatarEventMap,
  ClientEvent,
  ClientEventHandler,
  ConnectionQuality,
  ConnectResponse,
  ConsumeSessionOptions,
  ConsumeSessionResponse,
  MediaController,
  MicPermissionState,
  ScreenShareController,
  SessionCredentials,
  SessionKeyResponse,
  SessionState,
  TranscriptionEntry,
  TranscriptionHandler,
  TranscriptOptions,
} from './types';
export { AvatarEvent } from './types';
export { FlatDeltaAccumulator } from './utils/flatDeltaAccumulator';
// Utilities needed by framework bindings
export { parseClientEvent } from './utils/parseClientEvent';
export {
  tryDecodeJSON,
  tryParseFlatDelta,
  tryParseSegmentArray,
} from './utils/parseTranscription';
