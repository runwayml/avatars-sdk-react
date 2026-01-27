# @runwayml/avatar-react

React SDK for real-time AI avatar interactions with GWM-1.

## Installation

```bash
npm install @runwayml/avatar-react
# or
bun add @runwayml/avatar-react
```

## Quick Start

```tsx
import { AvatarProvider, useAvatar, AvatarCanvas } from '@runwayml/avatar-react';

function App() {
  return (
    <AvatarProvider config={{ apiKey: process.env.RUNWAYML_API_KEY! }}>
      <AvatarDemo />
    </AvatarProvider>
  );
}

function AvatarDemo() {
  const { connect, disconnect, speak, isConnected, isConnecting } = useAvatar();

  const handleConnect = async () => {
    await connect({ modelId: 'gwm-1' });
  };

  return (
    <div>
      <AvatarCanvas fallback={<div>Not connected</div>} showFps />

      {!isConnected ? (
        <button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      ) : (
        <>
          <button onClick={() => speak('Hello, world!')}>Say Hello</button>
          <button onClick={disconnect}>Disconnect</button>
        </>
      )}
    </div>
  );
}
```

## API Reference

### Components

#### `<AvatarProvider>`

Provides the avatar client context to child components.

```tsx
<AvatarProvider config={{ apiKey: 'your-api-key', debug: true }}>{children}</AvatarProvider>
```

**Props:**

- `config.apiKey` (required) - Your RunwayML API key
- `config.baseUrl` - Custom API base URL
- `config.wsUrl` - Custom WebSocket URL
- `config.timeout` - Request timeout in ms (default: 30000)
- `config.maxRetries` - Max retry attempts (default: 2)
- `config.debug` - Enable debug logging (default: false)

#### `<AvatarCanvas>`

Canvas component that automatically renders avatar video frames.

```tsx
<AvatarCanvas showFps targetFps={30} fallback={<Placeholder />} style={{ width: '100%' }} />
```

### Hooks

#### `useAvatar(options?)`

Main hook for managing avatar sessions.

```tsx
const {
  session,
  connectionState,
  avatarState,
  isConnected,
  isConnecting,
  error,
  connect,
  disconnect,
  speak,
  sendAudio,
  setEmotion,
  setGaze,
  interrupt,
} = useAvatar({
  autoConnect: false,
  sessionConfig: { modelId: 'gwm-1' },
  onConnected: () => console.log('Connected!'),
  onError: (error) => console.error(error),
});
```

#### `useAvatarVideo(options?)`

Hook for handling avatar video frames.

```tsx
const { canvasRef, dimensions, fps, isPlaying, frameCount } = useAvatarVideo({
  targetFps: 30,
  autoPlay: true,
  onFrame: (frame) => console.log('Frame received'),
});
```

#### `useAvatarAudio(options?)`

Hook for handling avatar audio output.

```tsx
const { isPlaying, isMuted, volume, setVolume, toggleMute } = useAvatarAudio({
  autoPlay: true,
  volume: 1,
});
```

#### `useAvatarMicrophone(options?)`

Hook for capturing and sending microphone audio.

```tsx
const { isActive, hasPermission, audioLevel, start, stop, toggleMute } = useAvatarMicrophone({
  sampleRate: 48000,
  echoCancellation: true,
  noiseSuppression: true,
});
```

### Types

```typescript
interface AvatarSessionConfig {
  modelId: string;
  resolution?: { width: number; height: number };
  audio?: AudioConfig;
  initialState?: Partial<AvatarState>;
}

interface AvatarState {
  emotion: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry' | 'confused' | 'thinking';
  isSpeaking: boolean;
  isListening: boolean;
  gazeDirection: { x: number; y: number };
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
```

## Direct Client Usage

For advanced use cases, you can use the client directly:

```typescript
import { createAvatarClient } from '@runwayml/avatar-react';

const client = createAvatarClient({ apiKey: 'your-api-key' });

await client.createSession({ modelId: 'gwm-1' });

client.on('videoFrame', (event) => {
  // Handle video frame
});

client.speak('Hello!');
client.disconnect();
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck

# Run tests
bun test
```

## License

MIT
