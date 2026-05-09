import type {
  ClientEvent,
  SessionState,
  TranscriptionEntry,
} from '../types';

export type { SessionState };

export const AvatarEvent = {
  StateChanged: 'stateChanged',
  Transcript: 'transcript',
  ClientEvent: 'clientEvent',
  Error: 'error',
  AvatarVideoReady: 'avatarVideoReady',
  AvatarAudioReady: 'avatarAudioReady',
  MediaChanged: 'mediaChanged',
} as const;

export type AvatarEventMap = {
  [AvatarEvent.StateChanged]: [state: SessionState];
  [AvatarEvent.Transcript]: [entry: TranscriptionEntry];
  [AvatarEvent.ClientEvent]: [event: ClientEvent];
  [AvatarEvent.Error]: [error: Error];
  [AvatarEvent.AvatarVideoReady]: [track: MediaStreamTrack];
  [AvatarEvent.AvatarAudioReady]: [track: MediaStreamTrack];
  [AvatarEvent.MediaChanged]: [];
};

export interface MediaController {
  readonly isEnabled: boolean;
  enable(): Promise<void>;
  disable(): Promise<void>;
  toggle(): Promise<void>;
}

export interface ScreenShareController {
  readonly isActive: boolean;
  start(): Promise<void>;
  stop(): Promise<void>;
  toggle(): Promise<void>;
}

export interface TranscriptOptions {
  interim?: boolean;
  bufferSize?: number;
}
