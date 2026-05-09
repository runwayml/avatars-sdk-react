'use client';

import { useAvatar } from './useAvatar';
import { useAvatarSession } from './useAvatarSession';

export type AvatarStatus =
  | 'connecting'
  | 'waiting'
  | 'ready'
  | 'ending'
  | 'ended'
  | 'error';

export function useAvatarStatus(): AvatarStatus {
  const session = useAvatarSession();
  const { hasVideo } = useAvatar();

  if (session.state === 'error') return 'error';
  if (session.state === 'ended') return 'ended';
  if (session.state === 'ending') return 'ending';
  if (session.state === 'active' && hasVideo) return 'ready';
  if (session.state === 'active') return 'waiting';
  return 'connecting';
}
