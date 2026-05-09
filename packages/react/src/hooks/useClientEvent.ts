'use client';

import {
  type ClientEvent,
  type ClientToolDef,
  validateClientToolArgs,
} from '@runwayml/avatars';
import { useEffect, useRef, useState } from 'react';
import { useMaybeCoreSession } from '../components/AvatarSession';

type EventArgs<E extends ClientEvent, T extends E['tool']> = Extract<
  E,
  { tool: T }
>['args'];

export function useClientEvent<
  E extends ClientEvent = ClientEvent,
  T extends E['tool'] = E['tool'],
>(
  toolOrDef: T | ClientToolDef<T, EventArgs<E, T>>,
  onEvent?: (args: EventArgs<E, T>) => void,
): EventArgs<E, T> | null {
  const session = useMaybeCoreSession();
  const [latestArgs, setLatestArgs] = useState<EventArgs<E, T> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const toolDef =
    typeof toolOrDef === 'object' && toolOrDef !== null && 'name' in toolOrDef
      ? (toolOrDef as ClientToolDef)
      : null;
  const toolName = toolDef ? toolDef.name : (toolOrDef as string);

  useEffect(() => {
    if (!session) return;

    const unsub = session.onClientEvent<T, EventArgs<E, T>>(
      toolName as T,
      (args) => {
        if (toolDef) {
          const validated = validateClientToolArgs(toolDef, args);
          if (validated === null) return;
          setLatestArgs(validated as EventArgs<E, T>);
          onEventRef.current?.(validated as EventArgs<E, T>);
        } else {
          setLatestArgs(args);
          onEventRef.current?.(args);
        }
      },
    );

    return unsub;
  }, [session, toolName, toolDef]);

  return latestArgs;
}
