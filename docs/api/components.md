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

Handles credential fetching and loading states internally — just render it and the SDK manages the rest. During credential fetching, a built-in loading UI is shown. Once credentials are ready, your `children` are rendered inside the session context. See the [Loading States guide](../guides/loading-states.md) for details.

### Props

| Prop | Type | Required | Description |
|------|------|:--------:|-------------|
| `avatarId` | `string` | ✓ | Avatar preset ID (e.g., `"game-host"`) |
| `connectUrl` | `string` | ✓* | URL to POST `{ avatarId }` for credentials |
| `connect` | `(avatarId: string) => Promise<SessionCredentials>` | ✓* | Custom function to fetch credentials |
| `sessionId` | `string` | ✓* | Session ID (use with `sessionKey`) |
| `sessionKey` | `string` | ✓* | Session key (use with `sessionId`) |
| `credentials` | `SessionCredentials` | ✓* | Pre-fetched credentials |
| `baseUrl` | `string` | | Runway API base URL (defaults to `https://api.runwayml.com`) |
| `avatarImageUrl` | `string` | | Avatar image URL for loading placeholder (available as `--avatar-image` CSS variable) |
| `className` | `string` | | CSS class name |
| `style` | `CSSProperties` | | Inline styles |
| `onEnd` | `() => void` | | Called when session ends |
| `onError` | `(error: Error) => void` | | Called on credential or WebRTC error |
| `children` | `ReactNode` | | Custom layout (defaults to AvatarVideo + UserVideo + ControlBar) |

*One of these is required: `connectUrl`, `connect`, `sessionId`+`sessionKey`, or `credentials`.

### Basic Usage

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  avatarImageUrl="/avatars/game-host.png"
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

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-avatar-call` | `""` | Always present |
| `data-avatar-id` | Avatar ID | The requested avatar |

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

The render prop receives a discriminated union (`AvatarVideoStatus`) with three possible statuses:

```tsx
<AvatarVideo>
  {(avatar) => {
    switch (avatar.status) {
      case 'connecting':
        return <Spinner />;
      case 'waiting':
        return <p>Waiting for video...</p>;
      case 'ready':
        return <VideoTrack trackRef={avatar.videoTrackRef} />;
    }
  }}
</AvatarVideo>
```

### Render Prop Status

| Status | Extra fields | Description |
|--------|-------------|-------------|
| `connecting` | — | WebRTC connection in progress |
| `waiting` | — | Connected, waiting for video track |
| `ready` | `videoTrackRef: TrackReferenceOrPlaceholder` | Video is streaming |

### Data Attributes

| Attribute | Values |
|-----------|--------|
| `data-avatar-video` | `""` |
| `data-avatar-status` | `"connecting"`, `"waiting"`, `"ready"` |

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

### Default Usage

```tsx
<UserVideo className="self-view" />
```

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

### Render Prop State

| Property | Type | Description |
|----------|------|-------------|
| `hasVideo` | `boolean` | Whether local video track exists |
| `isCameraEnabled` | `boolean` | Whether camera is currently on |
| `trackRef` | `TrackReferenceOrPlaceholder` | Video track reference |

### Data Attributes

| Attribute | Values |
|-----------|--------|
| `data-avatar-user-video` | `""` |
| `data-avatar-has-video` | `"true"`, `"false"` |
| `data-avatar-camera-enabled` | `"true"`, `"false"` |
| `data-avatar-mirror` | `"true"`, `"false"` |

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

### Default Usage

```tsx
<ControlBar />
```

### With Screen Share

```tsx
<ControlBar showScreenShare />
```

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

### Render Prop State

| Property | Type | Description |
|----------|------|-------------|
| `isMicEnabled` | `boolean` | Microphone state |
| `isCameraEnabled` | `boolean` | Camera state |
| `isScreenShareEnabled` | `boolean` | Screen share state |
| `toggleMic` | `() => void` | Toggle microphone |
| `toggleCamera` | `() => void` | Toggle camera |
| `toggleScreenShare` | `() => void` | Toggle screen share |
| `endCall` | `() => Promise<void>` | End the session |
| `isActive` | `boolean` | Whether session is active |

### Data Attributes

| Attribute | Values |
|-----------|--------|
| `data-avatar-control-bar` | `""` |
| `data-avatar-active` | `"true"`, `"false"` |

### Control Button Attributes

| Attribute | Values |
|-----------|--------|
| `data-avatar-control` | `"microphone"`, `"camera"`, `"screen-share"`, `"end-call"` |
| `data-avatar-enabled` | `"true"`, `"false"` |

---

## ScreenShareVideo

Renders the local user's screen share.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class name |
| `children` | Render prop | Custom rendering function |

### Usage

```tsx
<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  <AvatarVideo />
  <ScreenShareVideo />
  <ControlBar showScreenShare />
</AvatarCall>
```

### Render Prop

```tsx
<ScreenShareVideo>
  {({ isSharing, trackRef }) => (
    isSharing ? <VideoTrack trackRef={trackRef} /> : null
  )}
</ScreenShareVideo>
```

### Data Attributes

| Attribute | Values |
|-----------|--------|
| `data-avatar-screen-share` | `""` |
| `data-avatar-sharing` | `"true"`, `"false"` |

---

## AudioRenderer

Handles avatar audio playback. Included automatically in `AvatarSession`.

Usually not needed directly, but available for custom session implementations:

```tsx
import { AudioRenderer } from '@runwayml/avatars-react';

<AudioRenderer />
```
