'use client';

import { AvatarEvent, type ClientEvent, type ClientEventHandler } from '@runwayml/avatars';
import { useEffect, useRef } from 'react';
import { useMaybeCoreSession } from '../components/AvatarSession';

export function useClientEvents<E extends ClientEvent = ClientEvent>(
  handler: ClientEventHandler<E>,
): void {
  const session = useMaybeCoreSession();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!session) return;

    const onEvent = (event: ClientEvent) => {
      handlerRef.current(event as E);
    };

    session.on(AvatarEvent.ClientEvent, onEvent);
    return () => {
      session.off(AvatarEvent.ClientEvent, onEvent);
    };
  }, [session]);
}
