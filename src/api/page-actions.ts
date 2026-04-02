import { clientTool, type ClientEventsFrom } from '../tools';

export const clickTool = clientTool('click', {
  description: 'Clicks an interactive element on the page by its target ID',
  args: {} as { target: string },
});

export const scrollToTool = clientTool('scroll_to', {
  description: 'Scrolls the page to an element by its target ID',
  args: {} as { target: string },
});

export const highlightTool = clientTool('highlight', {
  description:
    'Highlights an element on the page to draw attention to it by its target ID',
  args: {} as { target: string; duration?: number },
});

const toolDefs = [clickTool, scrollToTool, highlightTool] as const;

export type PageActionEvent = ClientEventsFrom<typeof toolDefs>;

/**
 * Pre-built tool definitions with `parameters` arrays, ready to spread
 * into `realtimeSessions.create({ tools })`.
 *
 * @example
 * ```ts
 * import { pageActionTools } from '@runwayml/avatars-react/api';
 *
 * await client.realtimeSessions.create({
 *   model: 'gwm1_avatars',
 *   avatar: { type: 'runway-preset', presetId: 'music-superstar' },
 *   tools: [...pageActionTools, ...myCustomTools],
 * });
 * ```
 */
export const pageActionTools = [
  {
    ...clickTool,
    parameters: [
      {
        name: 'target',
        type: 'string',
        description:
          'The ID or data-avatar-target value of the element to click',
      },
    ],
  },
  {
    ...scrollToTool,
    parameters: [
      {
        name: 'target',
        type: 'string',
        description:
          'The ID or data-avatar-target value of the element to scroll to',
      },
    ],
  },
  {
    ...highlightTool,
    parameters: [
      {
        name: 'target',
        type: 'string',
        description:
          'The ID or data-avatar-target value of the element to highlight',
      },
      {
        name: 'duration',
        type: 'number',
        description: 'How long to highlight in milliseconds. Defaults to 2000',
      },
    ],
  },
];
