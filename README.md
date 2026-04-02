# @runwayml/avatars-react

React SDK for real-time AI avatar interactions with GWM-1.

## Requirements

- React 18+
- A Runway API secret ([get one here](https://dev.runwayml.com/))
- A server-side endpoint to create sessions (API secrets must not be exposed to the client)

## Installation

```bash
npm install @runwayml/avatars-react
```

## Quick Start

Add an avatar call to your app with just a few lines:

```tsx
import { AvatarCall } from '@runwayml/avatars-react';

function App() {
  return (
    <AvatarCall
      avatarId="music-superstar"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

That's it! The component handles session creation, WebRTC connection, and renders a default UI with the avatar video and controls.

You can use preset avatars like `music-superstar`, `cat-character`, `fashion-designer`, `cooking-teacher`, and more. See the [Runway Developer Portal](https://dev.runwayml.com/) for the full list and creating custom avatars.

### Optional: Add Default Styles

Import the optional stylesheet for a polished look out of the box:

```tsx
import '@runwayml/avatars-react/styles.css';
```

The styles use CSS custom properties for easy customization:

```css
[data-avatar-call] {
  --avatar-bg-connecting: #8b5cf6;         /* Video background color */
  --avatar-radius: 16px;                   /* Container border radius */
  --avatar-control-size: 40px;             /* Control button size */
  --avatar-end-call-bg: #ff552f;           /* End call button color */
  --avatar-screen-share-active-bg: #fff;   /* Active share button background */
}
```

See [`examples/`](./examples) for complete working examples:
- [`nextjs`](./examples/nextjs) - Next.js App Router
- [`nextjs-client-events`](./examples/nextjs-client-events) - Client event tools (trivia game)
- [`nextjs-rpc`](./examples/nextjs-rpc) - Backend RPC + client events (trivia with server-side questions)
- [`nextjs-rpc-weather`](./examples/nextjs-rpc-weather) - Backend RPC only (weather assistant)
- [`nextjs-server-actions`](./examples/nextjs-server-actions) - Next.js with Server Actions
- [`react-router`](./examples/react-router) - React Router v7 framework mode
- [`express`](./examples/express) - Express + Vite

Scaffold an example with one command:

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs my-avatar-app
cd my-avatar-app
npm install
```

## How It Works

1. **Client** calls your server endpoint with the `avatarId`
2. **Server** uses your Runway API secret to create a realtime session via `@runwayml/sdk`
3. **Server** polls until the session is ready, then returns `sessionId` and `sessionKey` to the client
4. **Client** establishes a WebRTC connection for real-time video/audio

This flow keeps your API secret secure on the server while enabling low-latency communication.

## Server Setup

Your server endpoint receives the `avatarId` and returns session credentials. Use `@runwayml/sdk` to create and poll the session:

```ts
// /api/avatar/connect (Next.js App Router example)
import Runway from '@runwayml/sdk';

const client = new Runway(); // Uses RUNWAYML_API_SECRET env var

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar: { type: 'runway-preset', presetId: avatarId },
  });

  // Poll until the session is ready
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const session = await client.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') {
      return Response.json({ sessionId, sessionKey: session.sessionKey });
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  return Response.json({ error: 'Session creation timed out' }, { status: 504 });
}
```

## Customization

### Custom Connect Function

For more control over the connection flow:

```tsx
<AvatarCall
  avatarId="music-superstar"
  connect={async (avatarId) => {
    const res = await fetch('/api/avatar/connect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarId }),
    });
    return res.json();
  }}
/>
```

### Custom UI with Child Components

Use the built-in components for custom layouts:

```tsx
import { AvatarCall, AvatarVideo, ControlBar, UserVideo } from '@runwayml/avatars-react';

<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect">
  <div className="call-layout">
    <AvatarVideo className="avatar" />
    <UserVideo className="self-view" />
    <ControlBar className="controls" />
  </div>
</AvatarCall>
```

### Render Props

All display components support render props for complete control. `AvatarVideo` receives a discriminated union with `status`:

```tsx
<AvatarVideo>
  {(avatar) => {
    switch (avatar.status) {
      case 'connecting': return <Spinner />;
      case 'waiting': return <Placeholder />;
      case 'ready': return <VideoTrack trackRef={avatar.videoTrackRef} />;
    }
  }}
</AvatarVideo>
```

### CSS Styling with Data Attributes

Style components with the namespaced `data-avatar-*` attributes:

```tsx
<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect" className="my-avatar" />
```

```css
/* Style avatar video by connection status */
[data-avatar-video][data-avatar-status="connecting"] {
  opacity: 0.5;
}

[data-avatar-video][data-avatar-status="ready"] {
  opacity: 1;
}

/* Style control buttons */
[data-avatar-control][data-avatar-enabled="false"] {
  opacity: 0.5;
}
```

## Callbacks

```tsx
<AvatarCall
  avatarId="music-superstar"
  connectUrl="/api/avatar/connect"
  onEnd={() => console.log('Call ended')}
  onError={(error) => console.error('Error:', error)}
/>
```

## Webcam & Screen Sharing

The avatar can see your webcam feed or screen share, enabling visual interactions — show a plant for identification, [hold up a Pokémon card for trivia](https://x.com/technofantasyy/status/2031124673552097412), get [real-time coaching while you play a game](https://x.com/iamneubert/status/2031160102452081046), walk through a presentation, or ask for feedback on a design you're working on.

**Compatibility:** Webcam and screen sharing are supported by all preset avatars and custom avatars that use a preset voice. Custom avatars with a custom voice do not support webcam or screen sharing.

### Webcam

The webcam is enabled by default. The `video` prop controls whether the camera activates on connect, and the `<UserVideo>` component renders the local camera feed:

```tsx
<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect">
  <AvatarVideo />
  <UserVideo />
  <ControlBar />
</AvatarCall>
```

To disable the webcam, set `video={false}`:

```tsx
<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect" video={false} />
```

### Screen Sharing

Enable the screen share button by passing `showScreenShare` to `ControlBar`, and use `<ScreenShareVideo>` to display the shared content:

```tsx
<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect">
  <AvatarVideo />
  <ScreenShareVideo />
  <ControlBar showScreenShare />
</AvatarCall>
```

While sharing is active, the default `ControlBar` UI shows a sharing banner with a quick `Stop` action.

You can also start screen sharing automatically by passing a pre-captured stream via `initialScreenStream`. This is useful when you want to prompt the user for screen share permission before the session connects:

```tsx
function ScreenShareCall() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  async function startWithScreenShare() {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    setStream(mediaStream);
  }

  if (!stream) {
    return <button onClick={startWithScreenShare}>Share Screen & Start Call</button>;
  }

  return (
    <AvatarCall
      avatarId="music-superstar"
      connectUrl="/api/avatar/connect"
      initialScreenStream={stream}
    >
      <AvatarVideo />
      <ScreenShareVideo />
      <ControlBar showScreenShare />
    </AvatarCall>
  );
}
```

### Programmatic Control

Use the `useLocalMedia` hook for full programmatic control over camera and screen sharing:

```tsx
function MediaControls() {
  const {
    isCameraEnabled,
    isScreenShareEnabled,
    toggleCamera,
    toggleScreenShare,
  } = useLocalMedia();

  return (
    <div>
      <button onClick={toggleCamera}>{isCameraEnabled ? 'Hide Camera' : 'Show Camera'}</button>
      <button onClick={toggleScreenShare}>{isScreenShareEnabled ? 'Stop Sharing' : 'Share Screen'}</button>
    </div>
  );
}
```

## Hooks

Use hooks for custom components within an `AvatarCall` or `AvatarSession`. Also available: `useClientEvent` and `useClientEvents` for [client events](#client-events), and `useTranscription` for real-time transcription.

### useAvatarSession

Access session state and controls:

```tsx
function MyComponent() {
  const { state, sessionId, error, end } = useAvatarSession();

  if (state === 'connecting') return <Loading />;
  if (state === 'error') return <Error message={error.message} />;

  return <button onClick={end}>End Call</button>;
}
```

### useAvatar

Access the remote avatar's video:

```tsx
function CustomAvatar() {
  const { videoTrackRef, hasVideo } = useAvatar();

  return (
    <div>
      {hasVideo && <VideoTrack trackRef={videoTrackRef} />}
    </div>
  );
}
```

### useLocalMedia

Control local camera, microphone, and screen sharing:

```tsx
function MediaControls() {
  const {
    isMicEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  } = useLocalMedia();

  return (
    <div>
      <button onClick={toggleMic}>{isMicEnabled ? 'Mute' : 'Unmute'}</button>
      <button onClick={toggleCamera}>{isCameraEnabled ? 'Hide' : 'Show'}</button>
      <button onClick={toggleScreenShare}>{isScreenShareEnabled ? 'Stop Sharing' : 'Share Screen'}</button>
    </div>
  );
}
```

## Client Events

> **Compatibility:** Client events (tool calling) are supported on avatars that use a **preset voice**. Custom voice avatars do not currently support client events.

Avatars can trigger UI events via tool calls sent over the data channel. Define tools, pass them when creating a session, and subscribe on the client:

```ts
// lib/tools.ts — shared between server and client
import { clientTool, type ClientEventsFrom } from '@runwayml/avatars-react/api';

export const showCaption = clientTool('show_caption', {
  description: 'Display a caption overlay',
  args: {} as { text: string },
});

export const tools = [showCaption];
export type MyEvent = ClientEventsFrom<typeof tools>;
```

```ts
// Server — pass tools when creating the session
const { id } = await client.realtimeSessions.create({
  model: 'gwm1_avatars',
  avatar: { type: 'custom', avatarId: '...' },
  tools,
});
```

```tsx
// Client — subscribe to events inside AvatarCall
import { useClientEvent } from '@runwayml/avatars-react';
import type { MyEvent } from '@/lib/tools';

function CaptionOverlay() {
  const caption = useClientEvent<MyEvent, 'show_caption'>('show_caption');
  return caption ? <p>{caption.text}</p> : null;
}
```

See the [`nextjs-client-events`](./examples/nextjs-client-events) example for a full working demo.

## Page Actions

Let the avatar click buttons, scroll to sections, and highlight elements on your page. The SDK provides pre-built tool definitions and a component that handles the DOM interactions automatically.

### Server — add `pageActionTools` to the session

```ts
import { pageActionTools } from '@runwayml/avatars-react/api';

const { id } = await client.realtimeSessions.create({
  model: 'gwm1_avatars',
  avatar: { type: 'runway-preset', presetId: 'music-superstar' },
  tools: pageActionTools,
});
```

Combine with your own tools by spreading both arrays:

```ts
import { pageActionTools } from '@runwayml/avatars-react/api';
import { clientEventTools } from '@/lib/tools';

tools: [...pageActionTools, ...clientEventTools],
```

### Client — drop in the `<PageActions />` component

```tsx
import { AvatarCall, AvatarVideo, ControlBar, PageActions } from '@runwayml/avatars-react';

function App() {
  return (
    <AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect">
      <AvatarVideo />
      <ControlBar />
      <PageActions />
    </AvatarCall>
  );
}
```

The avatar can now reference elements by `id` or by a `data-avatar-target` attribute:

```html
<button id="signup">Sign Up</button>
<section data-avatar-target="pricing">...</section>
```

### Available actions

| Action | What it does |
|--------|-------------|
| `click` | Calls `.click()` on the target element |
| `scroll_to` | Scrolls the target into view with smooth scrolling |
| `highlight` | Pulses an outline around the target, then removes it |

### Highlight styling

Import the default stylesheet for a ready-made highlight animation:

```tsx
import '@runwayml/avatars-react/styles.css';
```

Elements are highlighted via the `data-avatar-highlighted="true"` attribute. Override the defaults with CSS:

```css
[data-avatar-highlighted="true"] {
  outline-color: hotpink;
}
```

The animation respects `prefers-reduced-motion`.

### Configuration

```tsx
<PageActions
  highlightDuration={3000}
  scrollBehavior="instant"
  scrollBlock="center"
  resolveElement={(target) => document.querySelector(`[data-custom="${target}"]`)}
/>
```

| Prop | Default | Description |
|------|---------|-------------|
| `highlightDuration` | `2000` | Milliseconds before the highlight clears |
| `scrollBehavior` | `'smooth'` | `'smooth'` or `'instant'` |
| `scrollBlock` | `'start'` | `'start'`, `'center'`, `'end'`, or `'nearest'` |
| `resolveElement` | by `id` then `data-avatar-target` | Custom function to find the target DOM element |

For advanced use cases, the underlying `usePageActions` hook accepts the same options:

```tsx
import { usePageActions } from '@runwayml/avatars-react';

function MyCustomPageActions() {
  usePageActions({ highlightDuration: 5000 });
  return null;
}
```

## Advanced: AvatarSession

For full control over session management, use `AvatarSession` directly with pre-fetched credentials:

```tsx
import { AvatarSession, AvatarVideo, ControlBar } from '@runwayml/avatars-react';

function AdvancedUsage({ credentials }) {
  return (
    <AvatarSession
      credentials={credentials}
      audio={true}
      video={true}
      onEnd={() => console.log('Ended')}
      onError={(err) => console.error(err)}
    >
      <AvatarVideo />
      <ControlBar />
    </AvatarSession>
  );
}
```

## Components Reference

| Component | Description |
|-----------|-------------|
| `AvatarCall` | High-level component that handles session creation |
| `AvatarSession` | Low-level wrapper that requires credentials |
| `AvatarVideo` | Renders the remote avatar video |
| `UserVideo` | Renders the local user's camera |
| `ControlBar` | Media control buttons (mic, camera, screen share, end call) |
| `ScreenShareVideo` | Renders screen share content |
| `PageActions` | Handles click, scroll, and highlight events from the avatar |
| `AudioRenderer` | Handles avatar audio playback |

## TypeScript

All components and hooks are fully typed:

```tsx
import type {
  AvatarCallProps,
  SessionCredentials,
  SessionState,
} from '@runwayml/avatars-react';
```

## Browser Support

This SDK uses WebRTC for real-time communication. Supported browsers:

- Chrome 74+
- Firefox 78+
- Safari 14.1+
- Edge 79+

Users must grant camera and microphone permissions when prompted.

## Troubleshooting

**"Failed to connect" or timeout errors**
- Verify your server endpoint is returning the correct credential format
- Check that `RUNWAYML_API_SECRET` is set correctly on your server

**No video/audio**
- Ensure the user has granted camera/microphone permissions
- Check browser console for WebRTC errors
- Verify the device has a working camera/microphone

**CORS errors**
- Your server endpoint must accept requests from your client's origin
- For local development, ensure both client and server are on compatible origins

## Agent Skill

This SDK includes an [Agent Skill](https://agentskills.io/) that teaches AI agents how to use the Runway Avatar SDK effectively. Install it with:

```bash
npx skills add runwayml/avatars-sdk-react
```

Once installed, AI coding assistants like Claude Code, Cursor, Cline, and others will have access to SDK documentation, patterns, and best practices when helping you build avatar-powered applications.

## License

MIT
