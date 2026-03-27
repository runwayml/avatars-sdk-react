import { describe, expect, it } from 'bun:test';
import {
  type ClientEventsFrom,
  clientTool,
  clientToolParam,
  isClientToolEvent,
} from './tools';

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

  it('generates runtime parameters from a schema-backed tool', () => {
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      parameters: {
        text: clientToolParam.string('Caption text'),
        emphasized: clientToolParam.boolean(
          'Whether the caption is emphasized',
          { optional: true },
        ),
        tags: clientToolParam.array(
          clientToolParam.string(),
          'Tag labels to attach to the caption',
          { optional: true },
        ),
      },
    });

    expect(tool).toEqual({
      type: 'client_event',
      name: 'show_caption',
      description: 'Display a caption',
      parameters: [
        {
          name: 'text',
          type: 'string',
          description: 'Caption text',
        },
        {
          name: 'emphasized',
          type: 'boolean',
          description: 'Whether the caption is emphasized',
        },
        {
          name: 'tags',
          type: 'array',
          description: 'Tag labels to attach to the caption',
          items: { type: 'string' },
        },
      ],
    });
  });

  it('produces a JSON-serializable object for the session create payload', () => {
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      parameters: {
        text: clientToolParam.string('Caption text'),
      },
    });

    const serialized = JSON.parse(JSON.stringify(tool));
    expect(serialized).toEqual({
      type: 'client_event',
      name: 'show_caption',
      description: 'Display a caption',
      parameters: [
        {
          name: 'text',
          type: 'string',
          description: 'Caption text',
        },
      ],
    });
  });

  it('composes into an array of tools for the session create payload', () => {
    const showCaption = clientTool('show_caption', {
      description: 'Show caption',
      parameters: {
        text: clientToolParam.string('Caption text'),
      },
    });
    const playSound = clientTool('play_sound', {
      description: 'Play sound',
      parameters: {
        url: clientToolParam.string('Audio file URL'),
      },
    });

    const tools = [showCaption, playSound];

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

  it('validates runtime client events against the tool schema', () => {
    const tool = clientTool('show_caption', {
      description: 'Display a caption',
      parameters: {
        text: clientToolParam.string('Caption text'),
        tags: clientToolParam.array(
          clientToolParam.string(),
          'Optional tag labels',
          { optional: true },
        ),
      },
    });

    expect(
      isClientToolEvent(tool, {
        type: 'client_event',
        tool: 'show_caption',
        args: { text: 'hello', tags: ['a', 'b'] },
      }),
    ).toBe(true);

    expect(
      isClientToolEvent(tool, {
        type: 'client_event',
        tool: 'show_caption',
        args: { text: 123 },
      } as never),
    ).toBe(false);

    expect(
      isClientToolEvent(tool, {
        type: 'client_event',
        tool: 'other_tool',
        args: { text: 'hello' },
      }),
    ).toBe(false);
  });
});
