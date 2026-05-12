import { describe, expect, it } from 'bun:test';
import type { StandardSchemaV1 } from './standard-schema';
import {
  type ClientEventsFrom,
  clientTool,
  getClientToolSchema,
  validateClientToolArgs,
} from './tools';

/**
 * Minimal Standard Schema v1 implementation for an object with typed keys.
 * Real consumers pass a Zod / Valibot / ArkType schema.
 */
function objectSchema<Shape extends Record<string, (value: unknown) => unknown>>(
  shape: Shape,
): StandardSchemaV1<
  { [K in keyof Shape]: unknown },
  { [K in keyof Shape]: ReturnType<Shape[K]> }
> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate(value) {
        if (value == null || typeof value !== 'object' || Array.isArray(value)) {
          return { issues: [{ message: 'expected object' }] };
        }
        const record = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(shape)) {
          try {
            out[key] = shape[key](record[key]);
          } catch (error) {
            return {
              issues: [
                {
                  message: error instanceof Error ? error.message : String(error),
                  path: [key],
                },
              ],
            };
          }
        }
        return {
          value: out as { [K in keyof Shape]: ReturnType<Shape[K]> },
        };
      },
    },
  };
}

function str(value: unknown): string {
  if (typeof value !== 'string') throw new Error('expected string');
  return value;
}

function num(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('expected number');
  }
  return value;
}

describe('clientTool', () => {
  it('returns an object with the correct server-facing fields', () => {
    const tool = clientTool('greet', {
      description: 'Say hello',
      args: {} as { name: string },
    });

    expect(tool).toEqual({
      type: 'client_event',
      name: 'greet',
      description: 'Say hello',
    });
  });

  it('produces a JSON-serializable object for the session create payload', () => {
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      args: {} as { text: string },
    });

    const serialized = JSON.parse(JSON.stringify(tool));
    expect(serialized).toEqual({
      type: 'client_event',
      name: 'show_caption',
      description: 'Display a caption',
    });
  });

  it('stays JSON-serializable when defined with a schema', () => {
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      schema: objectSchema({ text: str }),
    });

    expect(JSON.parse(JSON.stringify(tool))).toEqual({
      type: 'client_event',
      name: 'show_caption',
      description: 'Display a caption',
    });
  });

  it('attaches the Standard Schema via getClientToolSchema', () => {
    const schema = objectSchema({ text: str });
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      schema,
    });

    expect(getClientToolSchema(tool)).toBe(schema);
  });

  it('composes into an array of tools and derives event types', () => {
    const showCaption = clientTool('show_caption', {
      description: 'Show caption',
      schema: objectSchema({ text: str }),
    });
    const playSound = clientTool('play_sound', {
      description: 'Play sound',
      args: {} as { url: string },
    });

    const tools = [showCaption, playSound] as const;

    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('show_caption');
    expect(tools[1].name).toBe('play_sound');

    type Events = ClientEventsFrom<typeof tools>;
    const event: Events = {
      type: 'client_event',
      tool: 'show_caption',
      args: { text: 'hi' },
    };
    expect(event.tool).toBe('show_caption');
  });
});

describe('validateClientToolArgs', () => {
  it('returns args unchanged for tools without a schema', () => {
    const tool = clientTool('greet', {
      description: 'Say hello',
      args: {} as { name: string },
    });

    const args = { name: 'Ada' };
    expect(validateClientToolArgs(tool, args)).toBe(args);
  });

  it('returns parsed args for tools with a passing schema', () => {
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      schema: objectSchema({ text: str }),
    });

    expect(validateClientToolArgs(tool, { text: 'hello' })).toEqual({
      text: 'hello',
    });
  });

  it('returns null when schema validation fails', () => {
    const tool = clientTool('update_score', {
      description: 'Update the score',
      schema: objectSchema({ score: num }),
    });

    expect(validateClientToolArgs(tool, { score: 'not a number' })).toBeNull();
    expect(validateClientToolArgs(tool, null)).toBeNull();
  });

  it('returns null and warns exactly once per tool on async validation', () => {
    const asyncTool = clientTool('async_tool', {
      description: 'Async',
      schema: {
        '~standard': {
          version: 1,
          vendor: 'test-async',
          validate: async () => ({ value: {} }),
        },
      },
    });

    const original = console.warn;
    let warnCount = 0;
    console.warn = () => {
      warnCount++;
    };

    try {
      expect(validateClientToolArgs(asyncTool, {})).toBeNull();
      expect(validateClientToolArgs(asyncTool, {})).toBeNull();
      expect(validateClientToolArgs(asyncTool, {})).toBeNull();
      expect(warnCount).toBe(1);
    } finally {
      console.warn = original;
    }
  });
});
