export { AvatarSession, connect, streamTo } from './client';
export { AvatarError } from './error';
export type { AvatarErrorCode } from './error';
export { TranscriptAccumulator } from './transcript-accumulator';
export { consumeSession } from './api/consume';

export { AvatarEvent } from './types';
export type {
  AvatarEventMap,
  ClientEvent,
  ClientEventHandler,
  ConnectionQuality,
  ConsumeSessionOptions,
  ConsumeSessionResponse,
  ConnectResponse,
  MediaController,
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
