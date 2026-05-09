export { AvatarSession, connect, streamTo } from './client';
export { TranscriptAccumulator } from './transcript-accumulator';
export { AvatarEvent } from './types';
export type {
  AvatarEventMap,
  MediaController,
  ScreenShareController,
  SessionState,
  TranscriptOptions,
} from './types';

export type {
  ClientEvent,
  ClientEventHandler,
  TranscriptionEntry,
  TranscriptionHandler,
} from '../types';

export {
  clientTool,
  getClientToolSchema,
  validateClientToolArgs,
} from '../tools';
export type {
  ClientEventFromTool,
  ClientEventsFrom,
  ClientToolArgs,
  ClientToolDef,
} from '../tools';
