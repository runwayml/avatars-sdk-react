import { pageActionTools } from '../api';

/**
 * Look up a page action tool by name, throwing if it doesn't exist.
 * Avoids non-null assertions when a test needs a specific tool.
 */
export function getPageActionTool(name: string) {
  const tool = pageActionTools.find((t) => t.name === name);
  if (!tool) throw new Error(`Missing page action tool: ${name}`);
  return tool;
}
