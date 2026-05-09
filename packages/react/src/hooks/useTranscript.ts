'use client';

import {
  type TranscriptAccumulator,
  type TranscriptionEntry,
} from '@runwayml/avatars';
import { useEffect, useMemo, useState } from 'react';
import { useMaybeCoreSession } from '../components/AvatarSession';

export interface UseTranscriptOptions {
  interim?: boolean;
  bufferSize?: number;
}

export function useTranscript(
  options?: UseTranscriptOptions,
): Array<TranscriptionEntry> {
  const session = useMaybeCoreSession();
  const [entries, setEntries] = useState<Array<TranscriptionEntry>>([]);

  const acc = useMemo<TranscriptAccumulator | null>(() => {
    if (!session) return null;
    return session.transcript({
      interim: options?.interim,
      bufferSize: options?.bufferSize,
    });
  }, [session, options?.interim, options?.bufferSize]);

  useEffect(() => {
    if (!acc) return;

    const handler = (updated: ReadonlyArray<TranscriptionEntry>) => {
      setEntries(Array.from(updated));
    };

    acc.on('update', handler);
    return () => {
      acc.off('update', handler);
      acc.dispose();
    };
  }, [acc]);

  return entries;
}
