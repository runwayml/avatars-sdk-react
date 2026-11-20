import { describe, expect, it } from 'bun:test';
import { pageActionTools } from '../api';
import { getPageActionTool } from './getPageActionTool';

describe('getPageActionTool', () => {
  it('returns the tool with the given name', () => {
    expect(getPageActionTool('click').name).toBe('click');
  });

  it('returns the same object as pageActionTools', () => {
    for (const tool of pageActionTools) {
      expect(getPageActionTool(tool.name)).toBe(tool);
    }
  });

  it('throws for an unknown tool name', () => {
    expect(() => getPageActionTool('does_not_exist')).toThrow(
      'Missing page action tool: does_not_exist',
    );
  });
});
