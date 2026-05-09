'use client';

import { AvatarEvent, type TranscriptionEntry, type TranscriptionHandler } from '@runwayml/avatars';
import { useEffect, useRef } from 'react';
import { useMaybeCoreSession } from '../components/AvatarSession';

export function useTranscription(
  handler: TranscriptionHandler,
  options?: { interim?: boolean },
): void {
  const session = useMaybeCoreSession();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const interim = options?.interim ?? false;

  useEffect(() => {
    if (!session) return;

    const onTranscript = (entry: TranscriptionEntry) => {
      if (!interim && !entry.final) return;
      handlerRef.current(entry);
    };

    session.on(AvatarEvent.Transcript, onTranscript);
    return () => {
      session.off(AvatarEvent.Transcript, onTranscript);
    };
  }, [session, interim]);
}
