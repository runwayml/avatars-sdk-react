# Custom UI Guide

Build custom avatar interfaces using render props and hooks.

## Customization Levels

| Level | Approach | When to Use |
|-------|----------|-------------|
| 1 | CSS styling | Minor visual changes |
| 2 | Custom layout | Different component arrangement |
| 3 | Render props | Full control over individual components |
| 4 | Hooks only | Complete custom implementation |

---

## Level 1: CSS Styling

Use CSS custom properties and data attributes:

```tsx
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  className="my-avatar"
/>
```

```css
:root {
  --avatar-bg: #1a1a2e;
  --avatar-radius: 12px;
  --avatar-end-call-bg: #dc2626;
}

.my-avatar[data-state="connecting"] {
  opacity: 0.7;
}

.my-avatar[data-state="error"] {
  border: 2px solid red;
}
```

---

## Level 2: Custom Layout

Rearrange built-in components:

```tsx
import {
  AvatarCall,
  AvatarVideo,
  UserVideo,
  ControlBar,
} from '@runwayml/avatars-react';

<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  <div className="custom-layout">
    {/* Side by side layout */}
    <div className="videos">
      <AvatarVideo className="main" />
      <UserVideo className="sidebar" />
    </div>

    {/* Controls at top */}
    <ControlBar className="top-controls" showScreenShare />
  </div>
</AvatarCall>
```

---

## Level 3: Render Props

Full control over individual component rendering:

```tsx
import { VideoTrack } from '@livekit/components-react';

<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  {/* Custom avatar display */}
  <AvatarVideo>
    {({ hasVideo, isConnecting, isSpeaking, trackRef }) => (
      <div className={`avatar ${isSpeaking ? 'speaking' : ''}`}>
        {isConnecting && <Spinner />}
        {hasVideo && trackRef && <VideoTrack trackRef={trackRef} />}
        {isSpeaking && <Badge>Speaking</Badge>}
      </div>
    )}
  </AvatarVideo>

  {/* Custom user video */}
  <UserVideo>
    {({ hasVideo, isCameraEnabled, trackRef }) => (
      <div className="pip">
        {hasVideo && isCameraEnabled && trackRef ? (
          <VideoTrack trackRef={trackRef} />
        ) : (
          <Avatar fallback="You" />
        )}
      </div>
    )}
  </UserVideo>

  {/* Custom controls */}
  <ControlBar>
    {({ isMicEnabled, isCameraEnabled, toggleMic, toggleCamera, endCall }) => (
      <div className="controls">
        <Button onClick={toggleMic} variant={isMicEnabled ? 'default' : 'destructive'}>
          {isMicEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button onClick={toggleCamera} variant={isCameraEnabled ? 'default' : 'destructive'}>
          {isCameraEnabled ? <Video /> : <VideoOff />}
        </Button>
        <Button onClick={endCall} variant="destructive">
          <PhoneOff />
        </Button>
      </div>
    )}
  </ControlBar>
</AvatarCall>
```

---

## Level 4: Hooks Only

Build completely from scratch:

```tsx
import { AvatarCall, useAvatarSession, useAvatar, useLocalMedia } from '@runwayml/avatars-react';
import { VideoTrack } from '@livekit/components-react';

function MyCustomUI() {
  const session = useAvatarSession();
  const avatar = useAvatar();
  const media = useLocalMedia();

  if (session.state === 'connecting') {
    return <FullScreenLoader />;
  }

  if (session.state === 'error') {
    return <ErrorScreen error={session.error} />;
  }

  if (session.state === 'ended') {
    return <CallEndedScreen />;
  }

  return (
    <div className="call-screen">
      {/* Avatar */}
      <div className="avatar-container">
        {avatar.hasVideo && avatar.videoTrackRef && (
          <VideoTrack trackRef={avatar.videoTrackRef} />
        )}
        {avatar.isSpeaking && <SpeakingIndicator />}
      </div>

      {/* User PIP */}
      <div className="pip">
        {media.isCameraEnabled && media.localVideoTrackRef && (
          <VideoTrack trackRef={media.localVideoTrackRef} />
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={media.toggleMic}>
          {media.isMicEnabled ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={media.toggleCamera}>
          {media.isCameraEnabled ? 'Hide' : 'Show'}
        </button>
        <button onClick={session.end}>
          End Call
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
      <MyCustomUI />
    </AvatarCall>
  );
}
```

---

## Design System Integration

### With Tailwind CSS

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden
             data-[state=connecting]:opacity-50
             data-[state=error]:ring-2 data-[state=error]:ring-red-500"
>
  <AvatarVideo className="w-full h-full object-cover" />
  <UserVideo className="absolute bottom-4 right-4 w-32 rounded-lg" />
  <ControlBar className="absolute bottom-4 left-1/2 -translate-x-1/2" />
</AvatarCall>
```

### With shadcn/ui

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  <Card className="p-0 overflow-hidden">
    <AvatarVideo className="aspect-video" />

    <ControlBar>
      {({ isMicEnabled, toggleMic, endCall }) => (
        <div className="flex gap-2 p-4 justify-center">
          <Button
            variant={isMicEnabled ? 'outline' : 'destructive'}
            size="icon"
            onClick={toggleMic}
          >
            {isMicEnabled ? <Mic /> : <MicOff />}
          </Button>
          <Button variant="destructive" onClick={endCall}>
            End Call
          </Button>
        </div>
      )}
    </ControlBar>
  </Card>
</AvatarCall>
```

---

## Common Patterns

### Speaking Indicator

```tsx
<AvatarVideo>
  {({ isSpeaking, hasVideo, trackRef }) => (
    <div className="relative">
      {hasVideo && trackRef && <VideoTrack trackRef={trackRef} />}
      {isSpeaking && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1
                        bg-black/50 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-white">Speaking</span>
        </div>
      )}
    </div>
  )}
</AvatarVideo>
```

### Fullscreen Mode

```tsx
function FullscreenAvatar() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div ref={containerRef}>
      <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
        <AvatarVideo />
        <button onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </AvatarCall>
    </div>
  );
}
```

### Loading State

```tsx
<AvatarVideo>
  {({ hasVideo, isConnecting, trackRef }) => (
    <div className="relative aspect-video bg-gray-900">
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-white
                          border-t-transparent rounded-full" />
        </div>
      )}
      {hasVideo && trackRef && (
        <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
      )}
    </div>
  )}
</AvatarVideo>
```
