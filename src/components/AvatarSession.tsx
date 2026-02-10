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
import { ConnectionState } from 'livekit-client';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  AvatarSessionContextValue,
  AvatarSessionProps,
  SessionState,
} from '../types';

/**
 * Check if a media device of the given kind is available
 */
async function hasMediaDevice(
  kind: 'audioinput' | 'videoinput',
): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === kind);
  } catch {
    return false;
  }
}

/**
 * Hook to check device availability before connecting
 */
function useDeviceAvailability(
  requestAudio: boolean,
  requestVideo: boolean,
): { audio: boolean; video: boolean; isChecking: boolean } {
  const [state, setState] = useState({
    audio: false,
    video: false,
    isChecking: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkDevices() {
      const [hasAudio, hasVideo] = await Promise.all([
        requestAudio ? hasMediaDevice('audioinput') : Promise.resolve(false),
        requestVideo ? hasMediaDevice('videoinput') : Promise.resolve(false),
      ]);

      if (!cancelled) {
        setState({
          audio: requestAudio && hasAudio,
          video: requestVideo && hasVideo,
          isChecking: false,
        });
      }
    }

    checkDevices();

    return () => {
      cancelled = true;
    };
  }, [requestAudio, requestVideo]);

  return state;
}

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

/**
 * AvatarSession component - the main entry point for avatar sessions
 *
 * Establishes a WebRTC connection and provides session state to children.
 * This is a headless component that renders minimal DOM.
 */
export function AvatarSession({
  credentials,
  children,
  audio: requestAudio = true,
  video: requestVideo = true,
  onEnd,
  onError,
  __unstable_roomOptions,
}: AvatarSessionProps) {
  const errorRef = useRef<Error | null>(null);

  // Check device availability to avoid "Requested device not found" errors
  const deviceAvailability = useDeviceAvailability(requestAudio, requestVideo);

  const handleError = (error: Error) => {
    errorRef.current = error;
    onError?.(error);
  };

  const roomOptions = {
    ...DEFAULT_ROOM_OPTIONS,
    ...__unstable_roomOptions,
  };

  // Don't connect until we've checked device availability
  if (deviceAvailability.isChecking) {
    return null;
  }

  return (
    <LiveKitRoom
      serverUrl={credentials.serverUrl}
      token={credentials.token}
      connect={true}
      audio={deviceAvailability.audio}
      video={deviceAvailability.video}
      onDisconnected={() => onEnd?.()}
      onError={handleError}
      options={roomOptions}
      connectOptions={{
        autoSubscribe: true,
      }}
    >
      <AvatarSessionContextInner
        sessionId={credentials.sessionId}
        onEnd={onEnd}
        errorRef={errorRef}
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
  onEnd,
  errorRef,
  children,
}: {
  sessionId: string;
  onEnd?: () => void;
  errorRef: React.RefObject<Error | null>;
  children: ReactNode;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

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
      {children}
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
