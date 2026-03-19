'use client';

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useRef } from 'react';
import type { ClientEvent, ClientEventHandler } from '../types';
import { parseClientEvent } from '../utils/parseClientEvent';

/**
 * Hook to listen for all client events from the avatar.
 *
 * Use this hook in child components to handle client events without prop drilling.
 * Must be used within an AvatarSession or AvatarCall component.
 *
 * @typeParam E - The expected event type (defaults to ClientEvent for untyped usage)
 *
 * @example
 * ```tsx
 * // Untyped usage
 * useClientEvents((event) => {
 *   console.log('Received:', event.tool, event.args);
 * });
 *
 * // Type-safe usage with discriminated union
 * type MyEvents =
 *   | ClientEvent<'show_caption', { text: string }>
 *   | ClientEvent<'play_sound', { url: string }>;
 *
 * useClientEvents<MyEvents>((event) => {
 *   switch (event.tool) {
 *     case 'show_caption':
 *       setCaption(event.args.text); // TypeScript knows this is string
 *       break;
 *     case 'play_sound':
 *       new Audio(event.args.url).play();
 *       break;
 *   }
 * });
 * ```
 */
export function useClientEvents<E extends ClientEvent = ClientEvent>(
  handler: ClientEventHandler<E>,
): void {
  const room = useRoomContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    function handleDataReceived(payload: Uint8Array) {
      const event = parseClientEvent(payload);
      if (event) {
        handlerRef.current(event as E);
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);
}
