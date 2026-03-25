'use client';

/**
 * AvatarSession Component
 *
 * Provides the session context for avatar interactions.
 * Manages the WebRTC connection and exposes a clean API for child components.
 *
 * @example
 * ```tsx
 * <AvatarSession credentials={credentials} onEnd={handleEnd}>
 *   <AvatarVideo />
 *   <ControlBar />
 * </AvatarSession>
 * ```
 */

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useRoomContext,
} from '@livekit/components-react';
import type { RoomOptions } from 'livekit-client';
import { ConnectionState, RoomEvent, Track } from 'livekit-client';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AvatarSessionContextValue,
  AvatarSessionProps,
  ClientEvent,
  ClientEventHandler,
  MediaDeviceErrors,
  SessionState,
} from '../types';
import { parseClientEvent } from '../utils/parseClientEvent';

const DEFAULT_ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: false,
  dynacast: false,
};

/**
 * Maps WebRTC connection state to session state
 */
function mapConnectionState(connectionState: ConnectionState): SessionState {
  switch (connectionState) {
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

const AvatarSessionContext = createContext<AvatarSessionContextValue | null>(
  null,
);

const MediaDeviceErrorContext = createContext<MediaDeviceErrors | null>(null);

/**
 * AvatarSession component - the main entry point for avatar sessions
 *
 * Establishes a WebRTC connection and provides session state to children.
 * This is a headless component that renders minimal DOM.
 */
export function AvatarSession<E extends ClientEvent = ClientEvent>({
  credentials,
  children,
  audio: requestAudio = true,
  video: requestVideo = true,
  onEnd,
  onError,
  onClientEvent,
  initialScreenStream,
  __unstable_roomOptions,
}: AvatarSessionProps<E>) {
  const errorRef = useRef<Error | null>(null);

  const handleError = (error: Error) => {
    onError?.(error);
    errorRef.current = error;
  };

  const roomOptions = {
    ...DEFAULT_ROOM_OPTIONS,
    ...__unstable_roomOptions,
  };

  return (
    <LiveKitRoom
      serverUrl={credentials.serverUrl}
      token={credentials.token}
      connect={true}
      audio={false}
      video={false}
      onDisconnected={() => onEnd?.()}
      onError={handleError}
      options={roomOptions}
      connectOptions={{
        autoSubscribe: true,
      }}
    >
      <AvatarSessionContextInner
        sessionId={credentials.sessionId}
        requestAudio={requestAudio}
        requestVideo={requestVideo}
        onEnd={onEnd}
        onClientEvent={onClientEvent as ClientEventHandler | undefined}
        errorRef={errorRef}
        initialScreenStream={initialScreenStream}
      >
        {children}
      </AvatarSessionContextInner>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

/**
 * Inner context provider that has access to the room context
 */
function AvatarSessionContextInner({
  sessionId,
  requestAudio,
  requestVideo,
  onEnd,
  onClientEvent,
  errorRef,
  initialScreenStream,
  children,
}: {
  sessionId: string;
  requestAudio: boolean;
  requestVideo: boolean;
  onEnd?: () => void;
  onClientEvent?: ClientEventHandler;
  errorRef: React.RefObject<Error | null>;
  initialScreenStream?: MediaStream;
  children: ReactNode;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const onClientEventRef = useRef(onClientEvent);
  onClientEventRef.current = onClientEvent;

  const publishedRef = useRef(false);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;
    if (!initialScreenStream || publishedRef.current) return;
    publishedRef.current = true;

    const videoTrack = initialScreenStream.getVideoTracks()[0];
    if (videoTrack) {
      room.localParticipant.publishTrack(videoTrack, {
        source: Track.Source.ScreenShare,
      });
    }
    const audioTrack = initialScreenStream.getAudioTracks()[0];
    if (audioTrack) {
      room.localParticipant.publishTrack(audioTrack, {
        source: Track.Source.ScreenShareAudio,
      });
    }

    return () => {
      initialScreenStream.getTracks().forEach((t) => {
        t.stop();
      });
    };
  }, [connectionState, initialScreenStream, room]);

  const [micError, setMicError] = useState<Error | null>(null);
  const [cameraError, setCameraError] = useState<Error | null>(null);
  const mediaEnabledRef = useRef(false);

  // Enable audio/video AFTER the room connects — decoupled from the
  // signaling connection so a locked device (e.g. Zoom) can't block it.
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;
    if (mediaEnabledRef.current) return;
    mediaEnabledRef.current = true;

    async function enableMedia() {
      if (requestAudio) {
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch (err) {
          if (err instanceof Error) setMicError(err);
        }
      }
      if (requestVideo) {
        try {
          await room.localParticipant.setCameraEnabled(true);
        } catch (err) {
          if (err instanceof Error) setCameraError(err);
        }
      }
    }

    enableMedia();
  }, [connectionState, room, requestAudio, requestVideo]);

  useEffect(() => {
    function handleMediaDevicesError(error: Error, kind?: MediaDeviceKind) {
      if (kind === 'audioinput') {
        setMicError(error);
      } else if (kind === 'videoinput') {
        setCameraError(error);
      }
    }

    room.on(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    return () => {
      room.off(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    };
  }, [room]);

  const retryMic = useCallback(async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(true);
      setMicError(null);
    } catch (err) {
      if (err instanceof Error) setMicError(err);
    }
  }, [room]);

  const retryCamera = useCallback(async () => {
    try {
      await room.localParticipant.setCameraEnabled(true);
      setCameraError(null);
    } catch (err) {
      if (err instanceof Error) setCameraError(err);
    }
  }, [room]);

  const mediaDeviceErrors = useMemo<MediaDeviceErrors>(
    () => ({ micError, cameraError, retryMic, retryCamera }),
    [micError, cameraError, retryMic, retryCamera],
  );

  useEffect(() => {
    function handleDataReceived(payload: Uint8Array) {
      const event = parseClientEvent(payload);
      if (event) {
        onClientEventRef.current?.(event);
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  const end = useCallback(async () => {
    try {
      // Send END_CALL message to the avatar
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify({ type: 'END_CALL' }));
      await room.localParticipant.publishData(data, { reliable: true });
    } catch {
      // Ignore errors when sending end message
    }

    await room.disconnect();
    onEndRef.current?.();
  }, [room]);

  const contextValue: AvatarSessionContextValue = {
    state: mapConnectionState(connectionState),
    sessionId,
    error: errorRef.current,
    end,
  };

  return (
    <AvatarSessionContext.Provider value={contextValue}>
      <MediaDeviceErrorContext.Provider value={mediaDeviceErrors}>
        {children}
      </MediaDeviceErrorContext.Provider>
    </AvatarSessionContext.Provider>
  );
}

/**
 * Hook to access the avatar session context
 * Must be used within an AvatarSession component
 */
export function useAvatarSessionContext(): AvatarSessionContextValue {
  const context = useContext(AvatarSessionContext);
  if (!context) {
    throw new Error(
      'useAvatarSessionContext must be used within an AvatarSession',
    );
  }
  return context;
}

/**
 * Hook to optionally access the avatar session context
 * Returns null if not within an AvatarSession
 */
export function useMaybeAvatarSessionContext(): AvatarSessionContextValue | null {
  return useContext(AvatarSessionContext);
}

export function useMediaDeviceErrorContext(): MediaDeviceErrors | null {
  return useContext(MediaDeviceErrorContext);
}
