'use client';

import { useEffect, useRef, useState } from 'react';
import { useLatest } from '../hooks/useLatest';
import type { AvatarCallProps, SessionCredentials } from '../types';
import { AvatarSession } from './AvatarSession';
import { AvatarVideo } from './AvatarVideo';
import { ControlBar } from './ControlBar';
import { UserVideo } from './UserVideo';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

export function AvatarCall({
  avatarId,
  connectUrl,
  connect,
  avatarImageUrl,
  onEnd,
  onError,
  children,
  ...props
}: AvatarCallProps) {
  const [credentials, setCredentials] = useState<SessionCredentials | null>(
    null,
  );
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const fetchedForRef = useRef<string | null>(null);
  const connectRef = useLatest(connect);
  const onErrorRef = useLatest(onError);

  useEffect(() => {
    if (fetchedForRef.current === avatarId) return;
    fetchedForRef.current = avatarId;

    async function fetchCredentials() {
      setConnectionState('connecting');
      setError(null);
      setCredentials(null);

      try {
        let creds: SessionCredentials;

        if (connectRef.current) {
          creds = await connectRef.current(avatarId);
        } else if (connectUrl) {
          const response = await fetch(connectUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarId }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to connect: ${response.status} ${errorText}`,
            );
          }

          creds = await response.json();
        } else {
          throw new Error(
            'AvatarCall requires either connectUrl or connect prop',
          );
        }

        setCredentials(creds);
        setConnectionState('connected');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setConnectionState('error');
        onErrorRef.current?.(error);
      }
    }

    fetchCredentials();
  }, [avatarId, connectUrl, connectRef, onErrorRef]);

  const handleError = (err: Error) => {
    setError(err);
    setConnectionState('error');
    onErrorRef.current?.(err);
  };

  const backgroundStyle = avatarImageUrl
    ? { '--avatar-image': `url(${avatarImageUrl})` } as React.CSSProperties
    : undefined;

  if (connectionState === 'idle' || connectionState === 'connecting') {
    return (
      <div
        {...props}
        data-avatar-call=""
        data-state="connecting"
        data-avatar-id={avatarId}
        style={{ ...props.style, ...backgroundStyle }}
      />
    );
  }

  if (connectionState === 'error' || !credentials) {
    return (
      <div
        {...props}
        data-avatar-call=""
        data-state="error"
        data-avatar-id={avatarId}
        data-error={error?.message}
        style={{ ...props.style, ...backgroundStyle }}
      />
    );
  }

  return (
    <div
      {...props}
      data-avatar-call=""
      data-state="connected"
      data-avatar-id={avatarId}
      style={{ ...props.style, ...backgroundStyle }}
    >
      <AvatarSession
        credentials={credentials}
        onEnd={onEnd}
        onError={handleError}
      >
        {children ?? (
          <>
            <AvatarVideo />
            <UserVideo />
            <ControlBar />
          </>
        )}
      </AvatarSession>
    </div>
  );
}
