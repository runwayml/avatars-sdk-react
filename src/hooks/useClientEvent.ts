'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import {
  type ClientToolArgs,
  type ClientToolDef,
  validateClientToolArgs,
} from '../tools';
import type { ClientEvent } from '../types';
import { parseClientEvent } from '../utils/parseClientEvent';

type EventArgs<E extends ClientEvent, T extends E['tool']> = Extract<
  E,
  { tool: T }
>['args'];

/**
 * Subscribe to a single client event type.
 *
 * Returns the latest args as React state (`null` before the first event),
 * and optionally fires a callback on each event for side effects.
 *
 * Must be used within an AvatarSession or AvatarCall component.
 *
 * Accepts either a tool name (legacy, with explicit event type param) or
 * a `clientTool()` definition — the definition form infers args from the
 * tool and runtime-validates them via the tool's Standard Schema when
 * present.
 *
 * @example Tool definition (recommended)
 * ```tsx
 * import { z } from 'zod';
 * const showCaption = clientTool('show_caption', {
 *   description: 'Display a caption',
 *   schema: z.object({ text: z.string() }),
 * });
 *
 * // args is inferred as { text: string } and validated at runtime
 * const caption = useClientEvent(showCaption, (args) => {
 *   console.log(args.text);
 * });
 * ```
 *
 * @example Tool name (legacy)
 * ```tsx
 * const score = useClientEvent<TriviaEvent, 'update_score'>('update_score');
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
): unknown {
  const room = useRoomContext();
  const [state, setState] = useState<unknown>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const tool = typeof toolOrName === 'string' ? null : toolOrName;
  const toolName = typeof toolOrName === 'string' ? toolOrName : toolOrName.name;

  useEffect(() => {
    function handleDataReceived(payload: Uint8Array) {
      const event = parseClientEvent(payload);
      if (!event || event.tool !== toolName) return;

      const args = tool
        ? validateClientToolArgs(tool, event.args)
        : event.args;
      if (args === null) return;

      setState(args);
      onEventRef.current?.(args);
    }

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, tool, toolName]);

  return state;
}
