/**
 * @runwayml/avatars Types
 *
 * Core types for the avatar SDK. No React or framework dependencies.
 */

export type SessionState =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'ending'
  | 'ended'
  | 'error';

export interface ConsumeSessionResponse {
  url: string;
  token: string;
  roomName: string;
}

export interface SessionCredentials {
  sessionId: string;
  serverUrl: string;
  token: string;
  roomName: string;
}

export interface SessionKeyResponse {
  sessionId: string;
  sessionKey: string;
}

export type ConnectResponse = SessionCredentials | SessionKeyResponse;

export interface ConsumeSessionOptions {
  sessionId: string;
  sessionKey: string;
  baseUrl?: string;
}

export interface ClientEvent<
  T extends string = string,
  A = Record<string, unknown>,
> {
  type: 'client_event';
  tool: T;
  args: A;
}

export type ClientEventHandler<E extends ClientEvent = ClientEvent> = (
  event: E,
) => void;

export interface TranscriptionEntry {
  id: string;
  text: string;
  final: boolean;
  participantIdentity: string;
  channel?: 'native' | 'custom';
}

export type TranscriptionHandler = (entry: TranscriptionEntry) => void;

export const AvatarEvent = {
  StateChanged: 'stateChanged',
  Transcript: 'transcript',
  ClientEvent: 'clientEvent',
  Error: 'error',
  AvatarVideoReady: 'avatarVideoReady',
  AvatarAudioReady: 'avatarAudioReady',
  ScreenShareReady: 'screenShareReady',
  LocalVideoReady: 'localVideoReady',
  MediaChanged: 'mediaChanged',
  UserSpeechStarted: 'userSpeechStarted',
  UserSpeechEnded: 'userSpeechEnded',
  AvatarSpeechStarted: 'avatarSpeechStarted',
  AvatarSpeechEnded: 'avatarSpeechEnded',
  ConnectionQualityChanged: 'connectionQualityChanged',
} as const;

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'lost' | 'unknown';

export type AvatarEventMap = {
  [AvatarEvent.StateChanged]: [state: SessionState];
  [AvatarEvent.Transcript]: [entry: TranscriptionEntry];
  [AvatarEvent.ClientEvent]: [event: ClientEvent];
  [AvatarEvent.Error]: [error: Error];
  [AvatarEvent.AvatarVideoReady]: [track: MediaStreamTrack];
  [AvatarEvent.AvatarAudioReady]: [track: MediaStreamTrack];
  [AvatarEvent.ScreenShareReady]: [track: MediaStreamTrack];
  [AvatarEvent.LocalVideoReady]: [track: MediaStreamTrack];
  [AvatarEvent.MediaChanged]: [];
  [AvatarEvent.UserSpeechStarted]: [];
  [AvatarEvent.UserSpeechEnded]: [];
  [AvatarEvent.AvatarSpeechStarted]: [];
  [AvatarEvent.AvatarSpeechEnded]: [];
  [AvatarEvent.ConnectionQualityChanged]: [quality: ConnectionQuality];
};

export interface MediaController {
  readonly isEnabled: boolean;
  enable(): Promise<void>;
  disable(): Promise<void>;
  toggle(): Promise<void>;
  setDevice(deviceId: string): Promise<void>;
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
