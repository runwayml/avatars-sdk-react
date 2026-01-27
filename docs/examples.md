# Examples

Code examples for common Runway Avatar SDK patterns.

## Basic Usage

### Minimal Setup

```tsx
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

function App() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
    />
  );
}
```

### With Callbacks

```tsx
function App() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
      onEnd={() => {
        console.log('Call ended');
        // Navigate away, show feedback, etc.
      }}
      onError={(error) => {
        console.error('Call error:', error.message);
        // Show error toast, retry logic, etc.
      }}
    />
  );
}
```

---

## Custom Layouts

### Side-by-Side

```tsx
import { AvatarCall, AvatarVideo, UserVideo, ControlBar } from '@runwayml/avatars-react';

function SideBySide() {
  return (
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
      <div style={{ display: 'flex', gap: '16px' }}>
        <AvatarVideo style={{ flex: 2 }} />
        <UserVideo style={{ flex: 1 }} />
      </div>
      <ControlBar />
    </AvatarCall>
  );
}
```

### Picture-in-Picture

```tsx
function PictureInPicture() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
      style={{ position: 'relative', width: '100%', maxWidth: '800px' }}
    >
      <AvatarVideo style={{ width: '100%', aspectRatio: '16/9' }} />
      <UserVideo
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '16px',
          width: '120px',
          borderRadius: '8px',
        }}
      />
      <ControlBar
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </AvatarCall>
  );
}
```

---

## State Handling

### Show Different UI Per State

```tsx
import { AvatarCall, useAvatarSession, AvatarVideo, ControlBar } from '@runwayml/avatars-react';

function CallUI() {
  const { state, error } = useAvatarSession();

  if (state === 'connecting') {
    return (
      <div className="loading">
        <Spinner />
        <p>Connecting to avatar...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="error">
        <p>Connection failed: {error?.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (state === 'ended') {
    return (
      <div className="ended">
        <p>Thanks for chatting!</p>
        <button onClick={() => window.location.reload()}>Start New Call</button>
      </div>
    );
  }

  return (
    <>
      <AvatarVideo />
      <ControlBar />
    </>
  );
}

function App() {
  return (
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
      <CallUI />
    </AvatarCall>
  );
}
```

---

## Custom Controls

### Minimal Controls

```tsx
import { AvatarCall, AvatarVideo, useAvatarSession, useLocalMedia } from '@runwayml/avatars-react';

function MinimalControls() {
  const { end } = useAvatarSession();
  const { isMicEnabled, toggleMic } = useLocalMedia();

  return (
    <div className="controls">
      <button onClick={toggleMic}>
        {isMicEnabled ? '🎤' : '🔇'}
      </button>
      <button onClick={end} className="end-call">
        📞
      </button>
    </div>
  );
}

function App() {
  return (
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
      <AvatarVideo />
      <MinimalControls />
    </AvatarCall>
  );
}
```

### With Screen Share

```tsx
import { AvatarCall, AvatarVideo, ScreenShareVideo, ControlBar } from '@runwayml/avatars-react';

function WithScreenShare() {
  return (
    <AvatarCall avatarId="coding-teacher" connectUrl="/api/avatar/connect">
      <div className="layout">
        <AvatarVideo className="avatar" />
        <ScreenShareVideo className="screen-share" />
      </div>
      <ControlBar showScreenShare />
    </AvatarCall>
  );
}
```

---

## Speaking Detection

### Visual Feedback

```tsx
import { AvatarCall, AvatarVideo } from '@runwayml/avatars-react';
import { VideoTrack } from '@livekit/components-react';

function SpeakingAvatar() {
  return (
    <AvatarCall avatarId="game-host" connectUrl="/api/avatar/connect">
      <AvatarVideo>
        {({ hasVideo, isSpeaking, trackRef }) => (
          <div
            style={{
              border: isSpeaking ? '3px solid #22c55e' : '3px solid transparent',
              transition: 'border-color 0.2s',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {hasVideo && trackRef && <VideoTrack trackRef={trackRef} />}
          </div>
        )}
      </AvatarVideo>
    </AvatarCall>
  );
}
```

---

## Authentication

### With User Auth Token

```tsx
import { AvatarCall } from '@runwayml/avatars-react';
import { useAuth } from './auth-context';

function AuthenticatedAvatar() {
  const { token } = useAuth();

  return (
    <AvatarCall
      avatarId="customer-service"
      connect={async (avatarId) => {
        const response = await fetch('/api/avatar/connect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatarId }),
        });

        if (!response.ok) {
          throw new Error('Failed to connect');
        }

        return response.json();
      }}
    />
  );
}
```

---

## Next.js Examples

### App Router Page

```tsx
// app/avatar/page.tsx
'use client';

import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export default function AvatarPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AvatarCall
        avatarId="game-host"
        connectUrl="/api/avatar/connect"
        className="w-full max-w-3xl"
      />
    </main>
  );
}
```

### With Server Action

```tsx
// app/actions/avatar.ts
'use server';
import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function createSession(avatarId: string) {
  // ... session creation logic
  return { sessionId, serverUrl, token, roomName };
}

// app/avatar/page.tsx
'use client';
import { AvatarCall } from '@runwayml/avatars-react';
import { createSession } from '../actions/avatar';

export default function AvatarPage() {
  return (
    <AvatarCall
      avatarId="game-host"
      connect={createSession}
    />
  );
}
```

---

## Error Handling

### Retry on Error

```tsx
import { useState } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';

function RetryableAvatar() {
  const [key, setKey] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => {
          setError(null);
          setKey(k => k + 1);
        }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <AvatarCall
      key={key}
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
      onError={setError}
    />
  );
}
```

---

## Responsive Design

### Mobile-Friendly

```tsx
import { AvatarCall, AvatarVideo, UserVideo, ControlBar } from '@runwayml/avatars-react';

function ResponsiveAvatar() {
  return (
    <AvatarCall
      avatarId="game-host"
      connectUrl="/api/avatar/connect"
      className="avatar-container"
    >
      <AvatarVideo className="avatar-video" />
      <UserVideo className="user-video" />
      <ControlBar className="controls" />
    </AvatarCall>
  );
}
```

```css
.avatar-container {
  width: 100%;
  max-width: 100vw;
  aspect-ratio: 9/16; /* Portrait on mobile */
}

@media (min-width: 768px) {
  .avatar-container {
    max-width: 800px;
    aspect-ratio: 16/9; /* Landscape on desktop */
  }
}

.user-video {
  position: absolute;
  width: 80px;
  bottom: 80px;
  right: 8px;
}

@media (min-width: 768px) {
  .user-video {
    width: 150px;
    bottom: 100px;
    right: 16px;
  }
}
```
