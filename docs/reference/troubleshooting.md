# Troubleshooting

## Connection Issues

### "Failed to connect" or Timeout Errors

**Symptoms:**
- `AvatarCall` shows error state
- Connection times out
- `onError` callback fires with connection error

**Solutions:**

1. **Verify server endpoint returns correct format:**
   ```typescript
   // Your endpoint must return this shape:
   {
     sessionId: string;
     serverUrl: string;
     token: string;
     roomName: string;
   }
   ```

2. **Check API secret:**
   ```bash
   # Verify environment variable is set
   echo $RUNWAYML_API_SECRET
   ```

3. **Check network connectivity:**
   - Ensure server can reach Runway API
   - Check for firewall blocking WebRTC ports

4. **Increase polling timeout:**
   ```typescript
   // In your server endpoint
   const timeout = 60000; // Increase from 30s to 60s
   ```

---

## No Video/Audio

### Avatar Video Not Showing

**Symptoms:**
- Component renders but video is black/missing
- `hasVideo` is `false` in render props

**Solutions:**

1. **Check WebRTC connection:**
   ```tsx
   <AvatarVideo>
     {({ hasVideo, isConnecting }) => (
       <div>
         {isConnecting && <p>Connecting...</p>}
         {!hasVideo && !isConnecting && <p>No video available</p>}
       </div>
     )}
   </AvatarVideo>
   ```

2. **Verify session is active:**
   ```tsx
   const { state } = useAvatarSession();
   console.log('Session state:', state); // Should be 'active'
   ```

### User Camera Not Showing

**Symptoms:**
- `UserVideo` is blank
- `isCameraEnabled` is `false`

**Solutions:**

1. **Check browser permissions:**
   - Click the camera icon in the browser address bar
   - Grant camera permission

2. **Check device availability:**
   ```tsx
   const { hasCamera, hasMic } = useLocalMedia();
   if (!hasCamera) {
     console.log('No camera detected');
   }
   ```

3. **Verify camera is enabled:**
   ```tsx
   const { isCameraEnabled, toggleCamera } = useLocalMedia();
   // Camera might be muted by default - toggle it on
   ```

### No Audio

**Symptoms:**
- Can see avatar but can't hear
- Avatar appears to be speaking (lips moving) but no sound

**Solutions:**

1. **Check browser autoplay policy:**
   - User must interact with page before audio plays
   - Add a "Start Call" button

2. **Verify `AudioRenderer` is present:**
   - Included automatically in `AvatarSession`
   - If using custom setup, add `<AudioRenderer />`

3. **Check system volume and browser tab mute**

---

## Permission Errors

### Camera/Microphone Permission Denied

**Symptoms:**
- Browser shows permission denied error
- `hasMic` or `hasCamera` is `false` after denial

**Solutions:**

1. **Serve over HTTPS:**
   - WebRTC requires secure context
   - Use `https://` in production
   - `localhost` works for development

2. **Request permissions with user gesture:**
   ```tsx
   function App() {
     const [started, setStarted] = useState(false);

     if (!started) {
       return (
         <button onClick={() => setStarted(true)}>
           Start Call
         </button>
       );
     }

     return <AvatarCall ... />;
   }
   ```

3. **Handle permission errors:**
   ```tsx
   <AvatarCall
     onError={(error) => {
       if (error.message.includes('permission')) {
         alert('Please allow camera/microphone access');
       }
     }}
   />
   ```

---

## CORS Errors

### "Blocked by CORS policy"

**Symptoms:**
- Browser console shows CORS error
- Fetch to server endpoint fails

**Solutions:**

1. **Same-origin requests (recommended):**
   - Put API route in same Next.js/Express app
   - `/api/avatar/connect` not `https://other-server.com/api`

2. **Add CORS headers (if cross-origin required):**
   ```typescript
   // Next.js API route
   export async function POST(req: Request) {
     // ... create session

     return new Response(JSON.stringify(data), {
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': 'https://your-client.com',
         'Access-Control-Allow-Methods': 'POST',
         'Access-Control-Allow-Headers': 'Content-Type',
       },
     });
   }

   export async function OPTIONS() {
     return new Response(null, {
       headers: {
         'Access-Control-Allow-Origin': 'https://your-client.com',
         'Access-Control-Allow-Methods': 'POST',
         'Access-Control-Allow-Headers': 'Content-Type',
       },
     });
   }
   ```

---

## React Errors

### "Hooks can only be called inside a component"

**Cause:** Using hooks outside of `AvatarCall` or `AvatarSession`.

**Solution:** Ensure hooks are inside the session context:

```tsx
// ❌ Wrong - hook outside context
function App() {
  const session = useAvatarSession(); // Error!
  return <AvatarCall ... />;
}

// ✅ Correct - hook inside context
function SessionInfo() {
  const session = useAvatarSession(); // Works!
  return <p>State: {session.state}</p>;
}

function App() {
  return (
    <AvatarCall ...>
      <SessionInfo />  {/* Hook inside AvatarCall */}
    </AvatarCall>
  );
}
```

### Hydration Mismatch (Next.js)

**Cause:** Server-rendered HTML doesn't match client.

**Solution:** Use dynamic import with `ssr: false`:

```tsx
'use client';

import dynamic from 'next/dynamic';

const AvatarCall = dynamic(
  () => import('@runwayml/avatars-react').then((m) => m.AvatarCall),
  { ssr: false }
);
```

---

## Browser Compatibility

### WebRTC Not Supported

**Supported browsers:**
- Chrome 74+
- Firefox 78+
- Safari 14.1+
- Edge 79+

**Check support:**
```typescript
if (!navigator.mediaDevices || !RTCPeerConnection) {
  alert('Your browser does not support video calls');
}
```

---

## Debugging Tips

### Enable Verbose Logging

```tsx
<AvatarCall
  avatarId="game-host"
  connectUrl="/api/avatar/connect"
  onError={(error) => {
    console.error('Avatar error:', error);
    console.error('Stack:', error.stack);
  }}
>
  <DebugPanel />
</AvatarCall>

function DebugPanel() {
  const session = useAvatarSession();
  const avatar = useAvatar();
  const media = useLocalMedia();

  useEffect(() => {
    console.log('Session:', session);
    console.log('Avatar:', avatar);
    console.log('Media:', media);
  }, [session, avatar, media]);

  return null;
}
```

### Check Server Response

```typescript
// In your server endpoint, log the full response
// Note: sessionKey is obtained from GET session response when status is READY
const { url, token, roomName } = await client.post(
  `/v1/realtime_sessions/${created.id}/consume`,
  { headers: { Authorization: `Bearer ${sessionKey}` } }
);
console.log('Credentials:', { url, token: token.slice(0, 20) + '...', roomName });
```

---

## Getting Help

- Check the [Runway Developer Portal](https://dev.runwayml.com/) for API documentation
- Review the [SDK examples](https://github.com/runwayml/avatars-sdk-react/tree/main/examples)
- File issues on GitHub for SDK bugs
