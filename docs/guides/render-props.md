# Render Props

All display components in the SDK are **headless** - they manage state but let you control rendering via render props.

## What Are Render Props?

Instead of rendering fixed UI, components accept a function as children that receives state:

```tsx
<AvatarVideo>
  {(state) => (
    // You control what renders
    <YourCustomUI {...state} />
  )}
</AvatarVideo>
```

## Why Render Props?

- **Full control** over markup and styling
- **No CSS overrides** needed for custom designs
- **Access to internal state** (connecting, video availability, etc.)
- **Integrate with any design system**

---

## AvatarVideo Render Prop

### State Object

```typescript
{
  hasVideo: boolean;      // Whether video track exists
  isConnecting: boolean;  // Whether connection is in progress
  trackRef: TrackReferenceOrPlaceholder | null;  // Video track reference
}
```

### Example: Custom Video with Loading State

```tsx
import { VideoTrack } from '@livekit/components-react';

<AvatarVideo>
  {({ hasVideo, isConnecting, trackRef }) => (
    <div className="relative">
      {/* Loading state */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Spinner />
        </div>
      )}

      {/* Video */}
      {hasVideo && trackRef && (
        <VideoTrack
          trackRef={trackRef}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )}
</AvatarVideo>
```

---

## UserVideo Render Prop

### State Object

```typescript
{
  hasVideo: boolean;       // Whether local video track exists
  isCameraEnabled: boolean; // Whether camera is currently on
  trackRef: TrackReferenceOrPlaceholder | null;
}
```

### Example: Camera Off Placeholder

```tsx
import { VideoTrack } from '@livekit/components-react';

<UserVideo>
  {({ hasVideo, isCameraEnabled, trackRef }) => (
    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800">
      {hasVideo && isCameraEnabled && trackRef ? (
        <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <UserIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  )}
</UserVideo>
```

---

## ControlBar Render Prop

### State Object

```typescript
{
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  endCall: () => Promise<void>;
  isActive: boolean;  // Whether session is active
}
```

### Example: Custom Control Buttons

```tsx
<ControlBar>
  {({
    isMicEnabled,
    isCameraEnabled,
    toggleMic,
    toggleCamera,
    endCall,
    isActive,
  }) => (
    <div className="flex gap-4 p-4 bg-black/50 rounded-full">
      {/* Mic button */}
      <button
        onClick={toggleMic}
        className={`p-3 rounded-full ${
          isMicEnabled ? 'bg-gray-700' : 'bg-red-600'
        }`}
      >
        {isMicEnabled ? <MicIcon /> : <MicOffIcon />}
      </button>

      {/* Camera button */}
      <button
        onClick={toggleCamera}
        className={`p-3 rounded-full ${
          isCameraEnabled ? 'bg-gray-700' : 'bg-red-600'
        }`}
      >
        {isCameraEnabled ? <VideoIcon /> : <VideoOffIcon />}
      </button>

      {/* End call */}
      <button
        onClick={endCall}
        disabled={!isActive}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
      >
        <PhoneOffIcon />
      </button>
    </div>
  )}
</ControlBar>
```

---

## ScreenShareVideo Render Prop

### State Object

```typescript
{
  isSharing: boolean;  // Whether screen share is active
  trackRef: TrackReferenceOrPlaceholder | null;
}
```

### Example: Conditional Screen Share Display

```tsx
<ScreenShareVideo>
  {({ isSharing, trackRef }) => (
    isSharing && trackRef ? (
      <div className="absolute inset-0 bg-black">
        <VideoTrack trackRef={trackRef} className="w-full h-full object-contain" />
        <div className="absolute top-4 left-4 px-2 py-1 bg-blue-600 rounded text-sm">
          Screen Share
        </div>
      </div>
    ) : null
  )}
</ScreenShareVideo>
```

---

## Combining Components

Build a complete custom UI by combining render props:

```tsx
<AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
  <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
    {/* Main avatar video */}
    <AvatarVideo>
      {({ hasVideo, isConnecting, trackRef }) => (
        <>
          {isConnecting && <LoadingOverlay />}
          {hasVideo && trackRef && (
            <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
          )}
        </>
      )}
    </AvatarVideo>

    {/* Picture-in-picture user video */}
    <div className="absolute bottom-4 right-4">
      <UserVideo>
        {({ hasVideo, isCameraEnabled, trackRef }) => (
          <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-800">
            {hasVideo && isCameraEnabled && trackRef ? (
              <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
            ) : (
              <CameraOffPlaceholder />
            )}
          </div>
        )}
      </UserVideo>
    </div>

    {/* Custom controls */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
      <ControlBar>
        {(controls) => <CustomControls {...controls} />}
      </ControlBar>
    </div>
  </div>
</AvatarCall>
```

---

## Using VideoTrack

The `trackRef` from render props is used with LiveKit's `VideoTrack` component:

```tsx
import { VideoTrack } from '@livekit/components-react';

// In a render prop
{trackRef && <VideoTrack trackRef={trackRef} />}
```

This is the same component used internally by the default renderers.

---

## When to Use Render Props vs Default Rendering

| Use Case | Approach |
|----------|----------|
| Quick prototype | Default rendering (no children) |
| Minor style tweaks | CSS + data attributes |
| Custom layout, same elements | Custom children with default components |
| Completely custom UI | Render props |
| Design system integration | Render props |
