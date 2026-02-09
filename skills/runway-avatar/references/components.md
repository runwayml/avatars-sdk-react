# Components

## Overview

| Component | Description |
|-----------|-------------|
| `AvatarCall` | High-level component that handles session creation |
| `AvatarSession` | Low-level wrapper requiring pre-fetched credentials |
| `AvatarVideo` | Renders the remote avatar video |
| `UserVideo` | Renders the local user's camera |
| `ControlBar` | Media control buttons |
| `ScreenShareVideo` | Renders screen share content |
| `AudioRenderer` | Handles avatar audio playback |

---

## AvatarCall

High-level component that handles the complete session lifecycle. **Recommended for most use cases.**

### Props

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `avatarId` | `string` | ✓ | Avatar preset ID (e.g., `"game-host"`) |
| `connectUrl` | `string` | ✓* | URL to POST `{ avatarId }` for credentials |
| `connect` | `(avatarId: string) => Promise<SessionCredentials>` | ✓* | Custom function to fetch credentials |
| `avatarImageUrl` | `string` | | Placeholder image during connection |
| `onEnd` | `() => void` | | Called when session ends |
| `onError` | `(error: Error) => void` | | Called on error |
| `children` | `ReactNode` | | Custom layout (defaults to AvatarVideo + UserVideo + ControlBar) |

*Either `connectUrl` or `connect` is required.

### Basic Usage

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
/>
```

### Custom Connect Function

```tsx
<AvatarCall
  avatarId="game-host"
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

### Custom Layout

```tsx
<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  <div className="my-layout">
    <AvatarVideo className="main-video" />
    <UserVideo className="pip" />
    <ControlBar className="bottom-bar" />
  </div>
</AvatarCall>
```

---

## AvatarSession

Low-level component for custom session management. Use when you need to fetch credentials yourself.

### Props

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `credentials` | `SessionCredentials` | ✓ | Pre-fetched session credentials |
| `children` | `ReactNode` | ✓ | Components to render inside session |
| `audio` | `boolean` | | Enable audio on connect (default: `true`) |
| `video` | `boolean` | | Enable video on connect (default: `true`) |
| `onEnd` | `() => void` | | Called when session ends |
| `onError` | `(error: Error) => void` | | Called on error |

### Usage

```tsx
function CustomSession() {
  const [credentials, setCredentials] = useState<SessionCredentials | null>(null);

  useEffect(() => {
    fetch('/api/avatar/connect', {
      method: 'POST',
      body: JSON.stringify({ avatarId: 'game-host' }),
    })
      .then((res) => res.json())
      .then(setCredentials);
  }, []);

  if (!credentials) return <Loading />;

  return (
    <AvatarSession
      credentials={credentials}
      onEnd={() => console.log('Ended')}
      onError={(err) => console.error(err)}
    >
      <AvatarVideo />
      <ControlBar />
    </AvatarSession>
  );
}
```

---

## AvatarVideo

Renders the remote avatar's video stream.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class name |
| `style` | `CSSProperties` | Inline styles |
| `children` | Render prop | Custom rendering function |

### Default Usage

```tsx
<AvatarVideo className="avatar" />
```

### Render Prop

```tsx
<AvatarVideo>
  {({ hasVideo, isConnecting, trackRef }) => (
    <div>
      {isConnecting && <Spinner />}
      {hasVideo && <VideoTrack trackRef={trackRef} />}
    </div>
  )}
</AvatarVideo>
```

---

## UserVideo

Renders the local user's camera feed.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `mirror` | `boolean` | Mirror the video (default: `true`) |
| `className` | `string` | CSS class name |
| `style` | `CSSProperties` | Inline styles |
| `children` | Render prop | Custom rendering function |

### Render Prop

```tsx
<UserVideo>
  {({ hasVideo, isCameraEnabled, trackRef }) => (
    <div>
      {hasVideo && isCameraEnabled && <VideoTrack trackRef={trackRef} />}
      {!isCameraEnabled && <CameraOffIcon />}
    </div>
  )}
</UserVideo>
```

---

## ControlBar

Media control buttons for microphone, camera, screen share, and end call.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showMicrophone` | `boolean` | `true` | Show mic toggle button |
| `showCamera` | `boolean` | `true` | Show camera toggle button |
| `showScreenShare` | `boolean` | `false` | Show screen share button |
| `showEndCall` | `boolean` | `true` | Show end call button |
| `className` | `string` | | CSS class name |
| `children` | Render prop | | Custom rendering function |

### Render Prop

```tsx
<ControlBar>
  {({ isMicEnabled, isCameraEnabled, toggleMic, toggleCamera, endCall, isActive }) => (
    <div className="custom-controls">
      <button onClick={toggleMic}>
        {isMicEnabled ? <MicIcon /> : <MicOffIcon />}
      </button>
      <button onClick={toggleCamera}>
        {isCameraEnabled ? <CameraIcon /> : <CameraOffIcon />}
      </button>
      <button onClick={endCall} disabled={!isActive}>
        End
      </button>
    </div>
  )}
</ControlBar>
```

---

## ScreenShareVideo

Renders the local user's screen share.

### Usage

```tsx
<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  <AvatarVideo />
  <ScreenShareVideo />
  <ControlBar showScreenShare />
</AvatarCall>
```

---

## AudioRenderer

Handles avatar audio playback. Included automatically in `AvatarSession`.

```tsx
import { AudioRenderer } from '@runwayml/avatars-react';

<AudioRenderer />
```
