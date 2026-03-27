import { describe, expect, it } from 'bun:test';

describe('package exports', () => {
  it('exports components', async () => {
    const exports = await import('./index');
    expect(exports.AvatarCall).toBeDefined();
    expect(exports.AvatarSession).toBeDefined();
    expect(exports.AvatarVideo).toBeDefined();
    expect(exports.ControlBar).toBeDefined();
    expect(exports.UserVideo).toBeDefined();
    expect(exports.ScreenShareVideo).toBeDefined();
    expect(exports.AudioRenderer).toBeDefined();
  });

  it('exports hooks', async () => {
    const exports = await import('./index');
    expect(exports.useAvatar).toBeDefined();
    expect(exports.useAvatarSession).toBeDefined();
    expect(exports.useAvatarStatus).toBeDefined();
    expect(exports.useLocalMedia).toBeDefined();
    expect(exports.useTranscription).toBeDefined();
  });

  it('exports client event hooks and helpers', async () => {
    const exports = await import('./index');
    expect(exports.useClientEvent).toBeDefined();
    expect(exports.useClientEvents).toBeDefined();
    expect(exports.clientTool).toBeDefined();
    expect(exports.clientToolParam).toBeDefined();
    expect(exports.isClientToolEvent).toBeDefined();
    expect(typeof exports.clientTool).toBe('function');
  });

  it('exports LiveKit re-exports', async () => {
    const exports = await import('./index');
    expect(exports.VideoTrack).toBeDefined();
    expect(exports.isTrackReference).toBeDefined();
  });
});

describe('api subpath exports', () => {
  it('exports server-safe client event utilities', async () => {
    const api = await import('./api/index');
    expect(api.clientTool).toBeDefined();
    expect(api.clientToolParam).toBeDefined();
    expect(api.isClientToolEvent).toBeDefined();
    expect(api.consumeSession).toBeDefined();
    expect(typeof api.clientTool).toBe('function');
  });
});
