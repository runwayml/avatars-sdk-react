'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import type { ClientEvent } from '../types';
import { parseClientEvent } from '../utils/parseClientEvent';

type EventArgs<E extends ClientEvent, T extends E['tool']> = Extract<
  E,
  { tool: T }
>['args'];

/**
 * Subscribe to a single client event type by tool name.
 *
 * Returns the latest args as React state (`null` before the first event),
 * and optionally fires a callback on each event for side effects.
 *
 * Must be used within an AvatarSession or AvatarCall component.
 *
 * @example
 * ```tsx
 * // State only — returns latest args
 * const score = useClientEvent<TriviaEvent, 'update_score'>('update_score');
 * // score: { score: number; streak: number } | null
 *
 * // State + side effect
 * const result = useClientEvent<TriviaEvent, 'reveal_answer'>('reveal_answer', (args) => {
 *   if (args.correct) fireConfetti();
 * });
 *
 * // Side effect only — ignore the return value
 * useClientEvent<TriviaEvent, 'play_sound'>('play_sound', (args) => {
 *   new Audio(SOUNDS[args.sound]).play();
 * });
 * ```
 */
export function useClientEvent<E extends ClientEvent, T extends E['tool']>(
  toolName: T,
  onEvent?: (args: EventArgs<E, T>) => void,
): EventArgs<E, T> | null {
  const room = useRoomContext();
  const [state, setState] = useState<EventArgs<E, T> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    function handleDataReceived(payload: Uint8Array) {
      const event = parseClientEvent(payload);
      if (event && event.tool === toolName) {
        const args = event.args as EventArgs<E, T>;
        setState(args);
        onEventRef.current?.(args);
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, toolName]);

  return state;
}
