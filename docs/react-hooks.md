# React Hooks Reference

All hooks must be used within an `<AvatarCall>`, `<AvatarProvider>`, or `<AvatarSession>`.

## useAvatarSession

Access session state and controls:

```tsx
function MyComponent() {
  const { state, sessionId, error, end } = useAvatarSession();

  if (state === 'connecting') return <Loading />;
  if (state === 'error') return <Error message={error.message} />;

  return <button onClick={end}>End Call</button>;
}
```

Session states: `idle` → `connecting` → `active` → `ending` → `ended` (or `error`).

## useAvatarStatus

A higher-level status that accounts for video readiness:

- `connecting` — session is connecting
- `waiting` — connected, waiting for avatar video
- `ready` — avatar video is streaming
- `ending` / `ended` / `error`

## useAvatar

Access the remote avatar's video track:

```tsx
function CustomAvatar() {
  const { videoTrack, hasVideo } = useAvatar();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [videoTrack]);

  return hasVideo ? <video ref={videoRef} autoPlay playsInline /> : null;
}
```

## useLocalMedia

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

## useTranscript

Accumulated, deduplicated transcript:

```tsx
function TranscriptPanel() {
  const transcript = useTranscript({ interim: true, bufferSize: 100 });
  return (
    <ul>
      {transcript.map((entry) => (
        <li key={entry.id}>{entry.participantIdentity}: {entry.text}</li>
      ))}
    </ul>
  );
}
```

## useTranscription

Low-level callback for each transcription segment:

```tsx
useTranscription((entry) => {
  console.log(`${entry.participantIdentity}: ${entry.text}`);
}, { interim: false });
```

## useClientEvent

Subscribe to typed client events from the avatar:

```tsx
import { useClientEvent } from '@runwayml/avatars-react';
import { showCaption } from '@/lib/tools';

function CaptionOverlay() {
  const caption = useClientEvent(showCaption);
  return caption ? <p>{caption.text}</p> : null;
}
```

## useClientEvents

Subscribe to all client events:

```tsx
useClientEvents((event) => {
  console.log(`Tool: ${event.tool}`, event.args);
});
```

## usePageActions

Automatically handle page action events (click, scroll, highlight):

```tsx
usePageActions({ highlightDuration: 3000 });
```
