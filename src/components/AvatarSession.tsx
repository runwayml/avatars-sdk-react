'use client';

/**
 * AvatarSession Component
 *
 * Provides the session context for avatar interactions.
 * Wraps LiveKit's LiveKitRoom internally while exposing a clean API.
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
import { ConnectionState } from 'livekit-client';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
} from 'react';
import type {
  AvatarSessionContextValue,
  AvatarSessionProps,
  SessionState,
} from '../types';

/**
 * Maps LiveKit connection state to our session state
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
 * Renders children within a LiveKit room context and provides session state.
 * This is a headless component that renders minimal DOM.
 */
export function AvatarSession({
  credentials,
  children,
  audio = true,
  video = true,
  onEnd,
  onError,
}: AvatarSessionProps) {
  const errorRef = useRef<Error | null>(null);

  const handleError = (error: Error) => {
    errorRef.current = error;
    onError?.(error);
  };

  return (
    <LiveKitRoom
      serverUrl={credentials.serverUrl}
      token={credentials.token}
      connect={true}
      audio={audio}
      video={video}
      onDisconnected={() => onEnd?.()}
      onError={handleError}
      options={{
        adaptiveStream: true,
        dynacast: true,
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
 * Inner context provider that has access to LiveKit room context
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
