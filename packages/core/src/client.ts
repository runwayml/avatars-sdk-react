import { ConnectionState, Room, RoomEvent, Track } from 'livekit-client';
import type {
  Participant,
  RemoteTrackPublication,
  TranscriptionSegment,
} from 'livekit-client';

import { consumeSession } from './api/consume';
import { parseClientEvent } from './utils/parseClientEvent';
import { Emitter } from './emitter';
import { TranscriptAccumulator } from './transcript-accumulator';
import {
  AvatarEvent,
  type AvatarEventMap,
  type ClientEvent,
  type MediaController,
  type ScreenShareController,
  type SessionState,
  type TranscriptOptions,
  type TranscriptionEntry,
} from './types';

function toSessionState(cs: ConnectionState): SessionState {
  switch (cs) {
    case ConnectionState.Connecting:
      return 'connecting';
    case ConnectionState.Connected:
      return 'active';
    case ConnectionState.Reconnecting:
      return 'connecting';
    case ConnectionState.Disconnected:
      return 'ended';
    default:
      return 'ended';
  }
}

/**
 * A live avatar session. Returned by `streamTo` or `connect`.
 *
 * Wraps a LiveKit Room behind a clean event-driven API. No LiveKit
 * types are exposed — tracks are standard `MediaStreamTrack` objects.
 */
export class AvatarSession extends Emitter<AvatarEventMap> {
  private room: Room | null = null;
  private _sessionId: string;
  private _state: SessionState = 'idle';
  private _error: Error | null = null;
  private _micEnabled = false;
  private _cameraEnabled = false;
  private _screenShareActive = false;
  private attachedVideoElement: HTMLVideoElement | null = null;
  private attachedAudioElement: HTMLAudioElement | null = null;
  private avatarVideoTrack: MediaStreamTrack | null = null;
  private avatarAudioTrack: MediaStreamTrack | null = null;
  private autoAudioElement: HTMLAudioElement | null = null;

  readonly mic: MediaController;
  readonly camera: MediaController;
  readonly screenShare: ScreenShareController;

  constructor(sessionId: string) {
    super();
    this._sessionId = sessionId;

    const self = this;

    this.mic = {
      get isEnabled() {
        return self._micEnabled;
      },
      enable: () => this.setMic(true),
      disable: () => this.setMic(false),
      toggle: () => this.setMic(!this._micEnabled),
    };

    this.camera = {
      get isEnabled() {
        return self._cameraEnabled;
      },
      enable: () => this.setCamera(true),
      disable: () => this.setCamera(false),
      toggle: () => this.setCamera(!this._cameraEnabled),
    };

    this.screenShare = {
      get isActive() {
        return self._screenShareActive;
      },
      start: () => this.setScreenShare(true),
      stop: () => this.setScreenShare(false),
      toggle: () => this.setScreenShare(!this._screenShareActive),
    };
  }

  get state(): SessionState {
    return this._state;
  }

  get sessionId(): string {
    return this._sessionId;
  }

  get error(): Error | null {
    return this._error;
  }

  streamTo(element: HTMLVideoElement): void {
    this.attachedVideoElement = element;
    if (this.avatarVideoTrack) {
      element.srcObject = new MediaStream([this.avatarVideoTrack]);
      element.play().catch(() => {});
    }
  }

  stopStreaming(): void {
    if (this.attachedVideoElement) {
      this.attachedVideoElement.srcObject = null;
    }
    this.attachedVideoElement = null;
  }

  attachAudio(element: HTMLAudioElement): void {
    this.attachedAudioElement = element;
    if (this.avatarAudioTrack) {
      element.srcObject = new MediaStream([this.avatarAudioTrack]);
      element.play().catch(() => {});
    }
  }

  detachAudio(): void {
    if (this.attachedAudioElement) {
      this.attachedAudioElement.srcObject = null;
    }
    this.attachedAudioElement = null;
  }

  async end(): Promise<void> {
    if (!this.room) return;
    this.setState('ending');

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify({ type: 'END_CALL' }));
      await this.room.localParticipant.publishData(data, { reliable: true });
    } catch {
      // Best-effort end message
    }

    this.cleanup();
  }

  transcript(options?: TranscriptOptions): TranscriptAccumulator {
    const acc = new TranscriptAccumulator(options);

    const handleTranscript = (entry: TranscriptionEntry) => {
      acc.ingestNative(
        [{ id: entry.id, text: entry.text, final: entry.final }],
        entry.participantIdentity,
      );
    };

    this.on(AvatarEvent.Transcript, handleTranscript);

    const originalDispose = acc.dispose.bind(acc);
    acc.dispose = () => {
      this.off(AvatarEvent.Transcript, handleTranscript);
      originalDispose();
    };

    return acc;
  }

  onClientEvent<T extends string, A>(
    toolOrName: { name: T } | T,
    handler: (args: A) => void,
  ): () => void {
    const name = typeof toolOrName === 'string' ? toolOrName : toolOrName.name;
    const wrappedHandler = (event: ClientEvent) => {
      if (event.tool === name) {
        handler(event.args as A);
      }
    };
    this.on(AvatarEvent.ClientEvent, wrappedHandler);
    return () => this.off(AvatarEvent.ClientEvent, wrappedHandler);
  }

  /** @internal Called by `streamTo` and `connect` entry points. */
  async _connect(
    serverUrl: string,
    token: string,
    options: { audio?: boolean; video?: boolean },
  ): Promise<void> {
    this.setState('connecting');

    const room = new Room({
      adaptiveStream: false,
      dynacast: false,
    });

    this.room = room;
    this.bindRoomEvents(room);

    await room.connect(serverUrl, token, { autoSubscribe: true });
    await this.enableInitialMedia(room, options);
  }

  async publishScreenShare(stream: MediaStream): Promise<void> {
    if (!this.room) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      await this.room.localParticipant.publishTrack(videoTrack, {
        source: Track.Source.ScreenShare,
      });
    }
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      await this.room.localParticipant.publishTrack(audioTrack, {
        source: Track.Source.ScreenShareAudio,
      });
    }
  }

  private bindRoomEvents(room: Room): void {
    room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      this.setState(toSessionState(state));
    });

    room.on(RoomEvent.Disconnected, () => {
      this.setState('ended');
    });

    room.on(RoomEvent.Reconnected, () => {
      this.reattachTracks();
    });

    room.on(
      RoomEvent.TrackSubscribed,
      (track, publication: RemoteTrackPublication) => {
        if (track.kind === 'video' && publication.source === Track.Source.Camera) {
          const mediaTrack = track.mediaStreamTrack;
          this.avatarVideoTrack = mediaTrack;
          this.emit(AvatarEvent.AvatarVideoReady, mediaTrack);
          this.syncVideoElement(mediaTrack);
        }

        if (track.kind === 'audio' && publication.source === Track.Source.Microphone) {
          const mediaTrack = track.mediaStreamTrack;
          this.avatarAudioTrack = mediaTrack;
          this.emit(AvatarEvent.AvatarAudioReady, mediaTrack);

          if (this.attachedAudioElement) {
            this.attachedAudioElement.srcObject = new MediaStream([mediaTrack]);
            this.attachedAudioElement.play().catch(() => {});
          } else {
            this.autoPlayAudio(mediaTrack);
          }
        }

        if (track.kind === 'video' && publication.source === Track.Source.ScreenShare) {
          this.emit(AvatarEvent.ScreenShareReady, track.mediaStreamTrack);
        }
      },
    );

    room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
      const event = parseClientEvent(payload);
      if (event) {
        this.emit(AvatarEvent.ClientEvent, event);
      }
    });

    room.on(
      RoomEvent.TranscriptionReceived,
      (segments: Array<TranscriptionSegment>, participant?: Participant) => {
        const identity = participant?.identity ?? 'unknown';
        for (const segment of segments) {
          this.emit(AvatarEvent.Transcript, {
            id: segment.id,
            text: segment.text,
            final: segment.final,
            participantIdentity: identity,
            channel: 'native',
          });
        }
      },
    );

    room.on(RoomEvent.MediaDevicesError, (error: Error) => {
      this.emit(AvatarEvent.Error, error);
    });
  }

  private reattachTracks(): void {
    if (this.avatarVideoTrack) {
      this.syncVideoElement(this.avatarVideoTrack);
    }
    if (this.avatarAudioTrack) {
      if (this.attachedAudioElement) {
        this.attachedAudioElement.srcObject = new MediaStream([this.avatarAudioTrack]);
        this.attachedAudioElement.play().catch(() => {});
      } else {
        this.autoPlayAudio(this.avatarAudioTrack);
      }
    }
  }

  private syncVideoElement(track: MediaStreamTrack): void {
    if (this.attachedVideoElement) {
      this.attachedVideoElement.srcObject = new MediaStream([track]);
      this.attachedVideoElement.play().catch(() => {});
    }
  }

  private async enableInitialMedia(
    room: Room,
    options: { audio?: boolean; video?: boolean },
  ): Promise<void> {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      console.warn(
        '[@runwayml/avatars] mediaDevices not available (requires secure context). Skipping mic/camera.',
      );
      return;
    }

    const { audio = true, video = true } = options;

    if (audio) {
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
        this._micEnabled = true;
      } catch (err) {
        this.emit(AvatarEvent.Error, err instanceof Error ? err : new Error(String(err)));
      }
    }

    if (video) {
      try {
        await room.localParticipant.setCameraEnabled(true);
        this._cameraEnabled = true;
      } catch (err) {
        this.emit(AvatarEvent.Error, err instanceof Error ? err : new Error(String(err)));
      }
    }

    this.emit(AvatarEvent.MediaChanged);
  }

  private async setMic(enabled: boolean): Promise<void> {
    if (!this.room || !navigator.mediaDevices?.getUserMedia) return;
    await this.room.localParticipant.setMicrophoneEnabled(enabled);
    this._micEnabled = enabled;
    this.emit(AvatarEvent.MediaChanged);
  }

  private async setCamera(enabled: boolean): Promise<void> {
    if (!this.room || !navigator.mediaDevices?.getUserMedia) return;
    await this.room.localParticipant.setCameraEnabled(enabled);
    this._cameraEnabled = enabled;
    this.emit(AvatarEvent.MediaChanged);
  }

  private async setScreenShare(active: boolean): Promise<void> {
    if (!this.room || !navigator.mediaDevices?.getDisplayMedia) return;
    await this.room.localParticipant.setScreenShareEnabled(active);
    this._screenShareActive = active;
    this.emit(AvatarEvent.MediaChanged);
  }

  private autoPlayAudio(track: MediaStreamTrack): void {
    if (!this.autoAudioElement) {
      this.autoAudioElement = document.createElement('audio');
      this.autoAudioElement.autoplay = true;
    }
    this.autoAudioElement.srcObject = new MediaStream([track]);
    this.autoAudioElement.play().catch(() => {});
  }

  private setState(state: SessionState): void {
    if (this._state === state) return;
    this._state = state;
    this.emit(AvatarEvent.StateChanged, state);
  }

  private cleanup(): void {
    this.stopStreaming();
    this.detachAudio();
    if (this.autoAudioElement) {
      this.autoAudioElement.srcObject = null;
      this.autoAudioElement = null;
    }
    this.avatarVideoTrack = null;
    this.avatarAudioTrack = null;

    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }

    this._micEnabled = false;
    this._cameraEnabled = false;
    this._screenShareActive = false;
    this.setState('ended');
  }
}

async function resolveCredentials(options: {
  sessionId: string;
  sessionKey: string;
  baseUrl?: string;
}) {
  const { url: serverUrl, token } = await consumeSession({
    sessionId: options.sessionId,
    sessionKey: options.sessionKey,
    baseUrl: options.baseUrl,
  });
  return { serverUrl, token };
}

/**
 * Start an avatar session and stream video to an element.
 *
 * Handles the consume call, LiveKit connection, and media setup
 * in one call. Returns an `AvatarSession` for media controls,
 * events, and ending the call.
 *
 * @example
 * ```ts
 * const credentials = await fetch('/api/connect').then(r => r.json());
 * const session = await streamTo({ credentials, target: document.getElementById('avatar') });
 *
 * session.mic.toggle();
 * session.end();
 * ```
 */
export async function streamTo(options: {
  credentials: { sessionId: string; sessionKey: string; baseUrl?: string };
  target: HTMLVideoElement;
  audio?: boolean;
  video?: boolean;
}): Promise<AvatarSession> {
  const { credentials, target, audio, video } = options;
  const { sessionId, sessionKey, baseUrl } = credentials;
  const { serverUrl, token } = await resolveCredentials({ sessionId, sessionKey, baseUrl });

  const session = new AvatarSession(sessionId);
  session.streamTo(target);
  await session._connect(serverUrl, token, { audio, video });

  return session;
}

/**
 * Start an avatar session without a video element (headless).
 *
 * Use `avatar.streamTo(element)` later to attach video, or use
 * this for audio-only sessions.
 *
 * @example
 * ```ts
 * const credentials = await fetch('/api/connect').then(r => r.json());
 * const session = await connect({ credentials });
 * ```
 */
export async function connect(options: {
  credentials: { sessionId: string; sessionKey: string; baseUrl?: string };
  audio?: boolean;
  video?: boolean;
}): Promise<AvatarSession> {
  const { credentials, audio, video } = options;
  const { sessionId, sessionKey, baseUrl } = credentials;
  const { serverUrl, token } = await resolveCredentials({ sessionId, sessionKey, baseUrl });

  const session = new AvatarSession(sessionId);
  await session._connect(serverUrl, token, { audio, video });

  return session;
}
