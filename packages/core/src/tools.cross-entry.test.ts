import { describe, expect, it } from 'bun:test';
import * as api from '../dist/api.js';
import * as core from '../dist/index.js';
import type { StandardSchemaV1 } from './standard-schema';

function captionSchema(): StandardSchemaV1<unknown, { text: string }> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate(value) {
        const text = (value as { text?: unknown } | null)?.text;
        if (typeof text !== 'string') {
          return {
            issues: [{ message: 'text must be a string', path: ['text'] }],
          };
        }
        return { value: { text } };
      },
    },
  };
}

describe('client tool schemas across entry points', () => {
  it('core validates a tool defined with clientTool from /api', () => {
    const caption = api.clientTool('caption', {
      description: 'Display a caption',
      schema: captionSchema(),
    });

    expect(core.getClientToolSchema(caption)).toBeDefined();
    expect(core.validateClientToolArgs(caption, { text: 123 })).toBeNull();
    expect(
      core.validateClientToolArgs(caption, { text: 'Valid caption' }),
    ).toEqual({
      text: 'Valid caption',
    });
  });

  it('/api validates a tool defined with clientTool from core', () => {
    const caption = core.clientTool('caption', {
      description: 'Display a caption',
      schema: captionSchema(),
    });

    expect(api.getClientToolSchema(caption)).toBeDefined();
    expect(api.validateClientToolArgs(caption, { text: 123 })).toBeNull();
    expect(
      api.validateClientToolArgs(caption, { text: 'Valid caption' }),
    ).toEqual({
      text: 'Valid caption',
    });
  });

  it('keeps the schema out of the serialized tool payload', () => {
    const caption = api.clientTool('caption', {
      description: 'Display a caption',
      schema: captionSchema(),
    });

    expect(JSON.parse(JSON.stringify(caption))).toEqual({
      type: 'client_event',
      name: 'caption',
      description: 'Display a caption',
    });
    expect(Object.keys(caption)).toEqual(['type', 'name', 'description']);
  });
});
