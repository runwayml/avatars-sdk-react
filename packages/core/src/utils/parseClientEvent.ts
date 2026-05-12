import type { ClientEvent } from '../types';

/**
 * Server-side ack messages contain `status: "event_sent"` — they echo back
 * tool calls and should not be surfaced as client events.
 */
function isAckMessage(args: Record<string, unknown>): boolean {
  return 'status' in args && args.status === 'event_sent';
}

/**
 * Parse and validate a data channel payload as a ClientEvent.
 * Returns null for non-client-event messages, ack messages, or malformed payloads.
 */
export function parseClientEvent(payload: Uint8Array): ClientEvent | null {
  try {
    const message = JSON.parse(new TextDecoder().decode(payload));

    if (
      message?.type === 'client_event' &&
      typeof message.tool === 'string' &&
      message.args != null &&
      typeof message.args === 'object' &&
      !isAckMessage(message.args)
    ) {
      return message as ClientEvent;
    }

    return null;
  } catch {
    return null;
  }
}
