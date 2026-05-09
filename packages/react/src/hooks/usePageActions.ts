'use client';

import { AvatarEvent, type ClientEvent, type PageActionEvent } from '@runwayml/avatars';
import { useEffect, useRef } from 'react';
import { useMaybeCoreSession } from '../components/AvatarSession';

export interface PageActionsOptions {
  enabled?: boolean;
  highlightDuration?: number;
}

function resolveTarget(target: string): HTMLElement | null {
  return (
    document.getElementById(target) ??
    document.querySelector(`[data-avatar-target="${target}"]`)
  );
}

export function usePageActions(options?: PageActionsOptions): void {
  const session = useMaybeCoreSession();
  const enabled = options?.enabled ?? true;
  const highlightDuration = options?.highlightDuration ?? 3000;
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session || !enabled) return;

    const handleEvent = (event: ClientEvent) => {
      const { tool, args } = event as unknown as PageActionEvent;

      if (tool === 'click') {
        const el = resolveTarget((args as { target: string }).target);
        if (el instanceof HTMLElement) el.click();
      } else if (tool === 'scroll_to') {
        const el = resolveTarget((args as { target: string }).target);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (tool === 'highlight') {
        const { target, duration } = args as {
          target: string;
          duration?: number;
        };
        const el = resolveTarget(target);
        if (!el) return;

        el.setAttribute('data-avatar-highlight', 'true');
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(
          () => el.removeAttribute('data-avatar-highlight'),
          duration ?? highlightDuration,
        );
      }
    };

    session.on(AvatarEvent.ClientEvent, handleEvent);
    return () => {
      session.off(AvatarEvent.ClientEvent, handleEvent);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [session, enabled, highlightDuration]);
}
