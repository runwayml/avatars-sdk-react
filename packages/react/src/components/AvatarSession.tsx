'use client';

import {
  AvatarSession as CoreSession,
  AvatarEvent,
  type ClientEvent,
  type ClientEventHandler,
  type SessionState,
} from '@runwayml/avatars';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  AvatarSessionContextValue,
  AvatarSessionProps,
  MediaDeviceErrors,
} from '../types';

const AvatarSessionContext = createContext<AvatarSessionContextValue | null>(
  null,
);

const CoreSessionContext = createContext<CoreSession | null>(null);

const MediaDeviceErrorContext = createContext<MediaDeviceErrors | null>(null);

export function AvatarSession<E extends ClientEvent = ClientEvent>({
  credentials,
  children,
  audio: requestAudio = true,
  video: requestVideo = true,
  onEnd,
  onError,
  onClientEvent,
}: AvatarSessionProps<E>) {
  const [state, setState] = useState<SessionState>('connecting');
  const [error, setError] = useState<Error | null>(null);
  const [micError, setMicError] = useState<Error | null>(null);
  const [cameraError, setCameraError] = useState<Error | null>(null);
  const [coreSession, setCoreSession] = useState<CoreSession | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onClientEventRef = useRef(onClientEvent);
  onClientEventRef.current = onClientEvent;

  useEffect(() => {
    let disposed = false;
    const session = new CoreSession(credentials.sessionId);

    session.on(AvatarEvent.StateChanged, (s: SessionState) => {
      if (disposed) return;
      setState(s);
      if (s === 'ended') onEndRef.current?.();
    });

    session.on(AvatarEvent.Error, (err: Error) => {
      if (disposed) return;
      setError(err);
      onErrorRef.current?.(err);
    });

    session.on(AvatarEvent.ClientEvent, (event: ClientEvent) => {
      (onClientEventRef.current as ClientEventHandler | undefined)?.(event);
    });

    session
      ._connect(credentials.serverUrl, credentials.token, {
        audio: requestAudio,
        video: requestVideo,
      })
      .then(() => {
        if (!disposed) setCoreSession(session);
      })
      .catch((err) => {
        if (disposed) return;
        const sessionError =
          err instanceof Error ? err : new Error(String(err));
        setError(sessionError);
        setState('error');
        onErrorRef.current?.(sessionError);
      });

    return () => {
      disposed = true;
      session.end();
    };
  }, [credentials.sessionId, credentials.serverUrl, credentials.token]);

  const end = async () => {
    await coreSession?.end();
  };

  const retryMic = async () => {
    try {
      await coreSession?.mic.enable();
      setMicError(null);
    } catch (err) {
      if (err instanceof Error) setMicError(err);
    }
  };

  const retryCamera = async () => {
    try {
      await coreSession?.camera.enable();
      setCameraError(null);
    } catch (err) {
      if (err instanceof Error) setCameraError(err);
    }
  };

  const contextValue: AvatarSessionContextValue = {
    state,
    sessionId: credentials.sessionId,
    error,
    end,
  };

  const mediaDeviceErrors: MediaDeviceErrors = {
    micError,
    cameraError,
    retryMic,
    retryCamera,
  };

  return (
    <AvatarSessionContext.Provider value={contextValue}>
      <CoreSessionContext.Provider value={coreSession}>
        <MediaDeviceErrorContext.Provider value={mediaDeviceErrors}>
          {children}
        </MediaDeviceErrorContext.Provider>
      </CoreSessionContext.Provider>
    </AvatarSessionContext.Provider>
  );
}

export function useAvatarSessionContext(): AvatarSessionContextValue {
  const context = useContext(AvatarSessionContext);
  if (!context) {
    throw new Error(
      'useAvatarSessionContext must be used within an AvatarSession',
    );
  }
  return context;
}

export function useMaybeAvatarSessionContext(): AvatarSessionContextValue | null {
  return useContext(AvatarSessionContext);
}

export function useCoreSession(): CoreSession {
  const session = useContext(CoreSessionContext);
  if (!session) {
    throw new Error('useCoreSession must be used within an AvatarSession');
  }
  return session;
}

export function useMaybeCoreSession(): CoreSession | null {
  return useContext(CoreSessionContext);
}

export function useMediaDeviceErrorContext(): MediaDeviceErrors | null {
  return useContext(MediaDeviceErrorContext);
}
