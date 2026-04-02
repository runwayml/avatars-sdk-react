'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef } from 'react';
import type { PageActionEvent } from '../api/page-actions';
import { parseClientEvent } from '../utils/parseClientEvent';

const HIGHLIGHT_ATTR = 'data-avatar-highlighted';
const DEFAULT_HIGHLIGHT_DURATION = 2000;

export interface PageActionsOptions {
  /**
   * Custom element resolver. Return `null` to skip the action.
   * Defaults to `getElementById` then `querySelector([data-avatar-target="..."])`.
   */
  resolveElement?: (target: string) => Element | null;
  /** Default highlight duration in milliseconds (default: 2000) */
  highlightDuration?: number;
  /** Scroll behavior passed to `scrollIntoView` (default: 'smooth') */
  scrollBehavior?: ScrollBehavior;
  /** Scroll block alignment passed to `scrollIntoView` (default: 'start') */
  scrollBlock?: ScrollLogicalPosition;
}

function defaultResolveElement(target: string): Element | null {
  return (
    document.getElementById(target) ??
    document.querySelector(`[data-avatar-target="${target}"]`)
  );
}

/**
 * Subscribe to built-in page-action client events (`click`, `scroll_to`,
 * `highlight`) and execute them against the DOM.
 *
 * Must be rendered inside `<AvatarCall>` or `<AvatarSession>`.
 *
 * Prefer `<PageActions />` for the simplest integration — this hook is
 * the lower-level escape hatch for custom composition.
 */
export function usePageActions(options: PageActionsOptions = {}): void {
  const room = useRoomContext();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    function resolve(target: string): Element | null {
      const resolver =
        optionsRef.current.resolveElement ?? defaultResolveElement;
      return resolver(target);
    }

    function handleClick(target: string) {
      const element = resolve(target);
      if (element instanceof HTMLElement) {
        element.click();
      }
    }

    function handleScrollTo(target: string) {
      const element = resolve(target);
      if (!element) return;
      element.scrollIntoView({
        behavior: optionsRef.current.scrollBehavior ?? 'smooth',
        block: optionsRef.current.scrollBlock ?? 'start',
      });
    }

    function handleHighlight(target: string, duration?: number) {
      const element = resolve(target);
      if (!element) return;

      element.setAttribute(HIGHLIGHT_ATTR, 'true');
      const ms =
        duration ??
        optionsRef.current.highlightDuration ??
        DEFAULT_HIGHLIGHT_DURATION;

      const timer = setTimeout(() => {
        element.removeAttribute(HIGHLIGHT_ATTR);
        timersRef.current.delete(timer);
      }, ms);
      timersRef.current.add(timer);
    }

    function handleDataReceived(payload: Uint8Array) {
      const event = parseClientEvent(payload);
      if (!event) return;

      const pageEvent = event as PageActionEvent;
      switch (pageEvent.tool) {
        case 'click':
          handleClick(pageEvent.args.target);
          break;
        case 'scroll_to':
          handleScrollTo(pageEvent.args.target);
          break;
        case 'highlight':
          handleHighlight(pageEvent.args.target, pageEvent.args.duration);
          break;
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      for (const timer of timersRef.current) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, [room]);
}
