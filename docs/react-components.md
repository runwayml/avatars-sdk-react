# React Components Reference

## Component Hierarchy

```
AvatarCall (handles session creation + styled container)
└── AvatarSession (connection provider)
    ├── AvatarVideo (remote avatar)
    ├── UserVideo (local camera)
    ├── ControlBar (mic/camera/end)
    └── ScreenShareVideo

AvatarProvider (handles session creation, no container)
└── AvatarSession (connection provider)
    └── {children} — full layout control
```

## AvatarCall

High-level component that handles session creation and renders a styled container with default children.

```tsx
<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect" />
```

With custom layout:

```tsx
<AvatarCall avatarId="music-superstar" connectUrl="/api/avatar/connect">
  <AvatarVideo />
  <UserVideo />
  <ControlBar />
</AvatarCall>
```

## AvatarProvider

Headless provider — same credential handling as `AvatarCall`, no container element. Full layout control.

```tsx
<AvatarProvider
  avatarId="fashion-designer"
  connectUrl="/api/avatar/connect"
  fallback={<div>Connecting...</div>}
>
  <div className="video-container">
    <AvatarVideo />
    <ControlBar />
  </div>
  <TranscriptPanel />
</AvatarProvider>
```

## AvatarSession

Low-level wrapper that requires pre-fetched credentials:

```tsx
<AvatarSession
  credentials={{ sessionId, serverUrl, token, roomName }}
  onEnd={() => console.log('Ended')}
  onError={(err) => console.error(err)}
>
  <AvatarVideo />
  <ControlBar />
</AvatarSession>
```

## AvatarVideo

Renders the remote avatar video. Supports render props:

```tsx
<AvatarVideo>
  {(avatar) => {
    switch (avatar.status) {
      case 'connecting': return <Spinner />;
      case 'waiting': return <Placeholder />;
      case 'ready': return <video ref={avatar.videoRef} autoPlay playsInline />;
    }
  }}
</AvatarVideo>
```

## UserVideo

Renders the local user's camera feed (mirrored by default).

## ControlBar

Media control buttons. Pass `showScreenShare` to enable screen sharing:

```tsx
<ControlBar showScreenShare />
```

## ScreenShareVideo

Renders screen share content when active.

## PageActions

Handles click, scroll, and highlight events from the avatar:

```tsx
<PageActions highlightDuration={3000} />
```

## AudioRenderer

No-op component kept for backwards compatibility. Audio is handled automatically by the session.
