import { describe, expect, it } from 'bun:test';
import { parseClientEvent } from './parseClientEvent';

function encode(obj: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj));
}

describe('parseClientEvent', () => {
  it('parses a valid client event', () => {
    const result = parseClientEvent(
      encode({
        type: 'client_event',
        tool: 'show_caption',
        args: { text: 'Hello' },
      }),
    );
    expect(result).toEqual({
      type: 'client_event',
      tool: 'show_caption',
      args: { text: 'Hello' },
    });
  });

  it('returns null for non-client-event type', () => {
    expect(
      parseClientEvent(encode({ type: 'other', tool: 'x', args: {} })),
    ).toBeNull();
  });

  it('returns null when tool is not a string', () => {
    expect(
      parseClientEvent(encode({ type: 'client_event', tool: 123, args: {} })),
    ).toBeNull();
  });

  it('returns null when args is null', () => {
    expect(
      parseClientEvent(encode({ type: 'client_event', tool: 'x', args: null })),
    ).toBeNull();
  });

  it('returns null when args is a primitive', () => {
    expect(
      parseClientEvent(
        encode({ type: 'client_event', tool: 'x', args: 'string' }),
      ),
    ).toBeNull();
  });

  it('filters out server ack messages', () => {
    expect(
      parseClientEvent(
        encode({
          type: 'client_event',
          tool: 'show_caption',
          args: { status: 'event_sent' },
        }),
      ),
    ).toBeNull();
  });

  it('allows args that contain status with a non-ack value', () => {
    const result = parseClientEvent(
      encode({
        type: 'client_event',
        tool: 'update',
        args: { status: 'active' },
      }),
    );
    expect(result).toEqual({
      type: 'client_event',
      tool: 'update',
      args: { status: 'active' },
    });
  });

  it('returns null for invalid JSON', () => {
    const garbage = new TextEncoder().encode('not json{{{');
    expect(parseClientEvent(garbage)).toBeNull();
  });

  it('returns null for empty payload', () => {
    expect(parseClientEvent(new Uint8Array(0))).toBeNull();
  });

  it('returns null when message is missing required fields', () => {
    expect(parseClientEvent(encode({}))).toBeNull();
    expect(parseClientEvent(encode({ type: 'client_event' }))).toBeNull();
    expect(
      parseClientEvent(encode({ type: 'client_event', tool: 'x' })),
    ).toBeNull();
  });
});
