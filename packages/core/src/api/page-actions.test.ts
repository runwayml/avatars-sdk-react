import { describe, expect, it } from 'bun:test';
import { pageActionTools } from './page-actions';

describe('pageActionTools', () => {
  it('exports three tool definitions', () => {
    expect(pageActionTools).toHaveLength(3);
  });

  it('includes click, scroll_to, and highlight tools', () => {
    const names = pageActionTools.map((t) => t.name);
    expect(names).toEqual(['click', 'scroll_to', 'highlight']);
  });

  it('all tools have type client_event', () => {
    for (const tool of pageActionTools) {
      expect(tool.type).toBe('client_event');
    }
  });

  it('all tools have non-empty descriptions', () => {
    for (const tool of pageActionTools) {
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
    }
  });

  it('all tools have parameters arrays', () => {
    for (const tool of pageActionTools) {
      expect(Array.isArray(tool.parameters)).toBe(true);
      expect(tool.parameters.length).toBeGreaterThan(0);
    }
  });

  it('click has a single target parameter', () => {
    const click = pageActionTools.find((t) => t.name === 'click')!;
    expect(click.parameters).toHaveLength(1);
    expect(click.parameters[0].name).toBe('target');
    expect(click.parameters[0].type).toBe('string');
  });

  it('scroll_to has a single target parameter', () => {
    const scrollTo = pageActionTools.find((t) => t.name === 'scroll_to')!;
    expect(scrollTo.parameters).toHaveLength(1);
    expect(scrollTo.parameters[0].name).toBe('target');
    expect(scrollTo.parameters[0].type).toBe('string');
  });

  it('highlight has target and duration parameters', () => {
    const highlight = pageActionTools.find((t) => t.name === 'highlight')!;
    expect(highlight.parameters).toHaveLength(2);
    expect(highlight.parameters[0].name).toBe('target');
    expect(highlight.parameters[1].name).toBe('duration');
    expect(highlight.parameters[1].type).toBe('number');
  });

  it('serializes cleanly for the session create payload', () => {
    const serialized = JSON.parse(JSON.stringify(pageActionTools));
    expect(serialized).toHaveLength(3);
    for (const tool of serialized) {
      expect(tool.type).toBe('client_event');
      expect(tool.parameters).toBeDefined();
    }
  });
});
