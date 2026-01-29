import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DOM APIs
beforeEach(() => {
  // Mock document.body.appendChild
  vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('div'));

  // Mock document.getElementById
  vi.spyOn(document, 'getElementById').mockImplementation(() => null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('widget exports', () => {
  it('exports RunwayCharacters API', async () => {
    const exports = await import('./index');
    expect(exports.RunwayCharacters).toBeDefined();
    expect(exports.RunwayCharacters.init).toBeDefined();
    expect(exports.RunwayCharacters.destroy).toBeDefined();
    expect(exports.RunwayCharacters.version).toBeDefined();
  });

  it('has correct version', async () => {
    const { RunwayCharacters } = await import('./index');
    expect(RunwayCharacters.version).toBe('0.1.0');
  });

  it('throws error when config is invalid', async () => {
    const { RunwayCharacters } = await import('./index');

    expect(() => {
      RunwayCharacters.init({});
    }).toThrow('RunwayCharacters.init requires sessionId, apiKey, or serverUrl');

    expect(() => {
      RunwayCharacters.init({ apiKey: 'test-key' }); // Missing avatarId or presetId
    }).toThrow('RunwayCharacters.init requires either avatarId or presetId');

    expect(() => {
      RunwayCharacters.init({ serverUrl: '/api/sessions' }); // Missing avatarId or presetId
    }).toThrow('RunwayCharacters.init requires either avatarId or presetId');
  });
});

describe('widget types', () => {
  it('exports types correctly', async () => {
    // This test verifies TypeScript types compile correctly
    const exports = await import('./types');
    // Types don't have runtime values, but we can verify the module loads
    expect(exports).toBeDefined();
  });
});
