'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import {
  type ClientToolArgs,
  type ClientToolDef,
  isClientToolEvent,
} from '../tools';
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
 * // Tool-definition form — validates args at runtime when the tool
 * // was created with `clientTool({ parameters: ... })`
 * const caption = useClientEvent(showCaptionTool);
 *
 * // State + side effect
 * const result = useClientEvent<TriviaEvent, 'reveal_answer'>('reveal_answer', (args) => {
 *   if (args.correct) fireConfetti();
 * });
 * ```
 */
export function useClientEvent<Tool extends ClientToolDef>(
  tool: Tool,
  onEvent?: (args: ClientToolArgs<Tool>) => void,
): ClientToolArgs<Tool> | null;
export function useClientEvent<E extends ClientEvent, T extends E['tool']>(
  toolName: T,
  onEvent?: (args: EventArgs<E, T>) => void,
): EventArgs<E, T> | null;
export function useClientEvent(
  toolOrName: string | ClientToolDef,
  onEvent?: (args: unknown) => void,
): unknown | null {
  const room = useRoomContext();
  const [state, setState] = useState<unknown>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    function handleDataReceived(payload: Uint8Array) {
      const event = parseClientEvent(payload);
      if (!event) return;

      if (typeof toolOrName === 'string') {
        if (event.tool !== toolOrName) return;

        setState(event.args);
        onEventRef.current?.(event.args);
        return;
      }

      if (!isClientToolEvent(toolOrName, event)) return;

      setState(event.args);
      onEventRef.current?.(event.args);
    }

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, toolOrName]);

  return state;
}
