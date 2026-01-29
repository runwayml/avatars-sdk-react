import { describe, it, expect } from 'vitest';

describe('package', () => {
  it('exports components', async () => {
    const exports = await import('./index');
    expect(exports.AvatarSession).toBeDefined();
    expect(exports.AvatarVideo).toBeDefined();
    expect(exports.useAvatar).toBeDefined();
    expect(exports.useAvatarSession).toBeDefined();
  });
});
