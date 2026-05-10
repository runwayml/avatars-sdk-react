'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  streamTo,
  AvatarEvent,
  type AvatarSession,
  type SessionState,
} from '@runwayml/avatars';

export default function Home() {
  const [session, setSession] = useState<AvatarSession | null>(null);
  const [status, setStatus] = useState('Ready');
  const [micOn, setMicOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!session) return;

    const onVideo = () => setStatus('Connected — start talking!');
    const onMedia = () => setMicOn(session.mic.isEnabled);
    const onError = (err: Error) => setStatus(`Error: ${err.message}`);

    session.on(AvatarEvent.AvatarVideoReady, onVideo);
    session.on(AvatarEvent.MediaChanged, onMedia);
    session.on(AvatarEvent.Error, onError);

    return () => {
      session.off(AvatarEvent.AvatarVideoReady, onVideo);
      session.off(AvatarEvent.MediaChanged, onMedia);
      session.off(AvatarEvent.Error, onError);
    };
  }, [session]);

  const start = useCallback(async () => {
    setStatus('Connecting...');

    const res = await fetch('/api/avatar/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarId: 'influencer' }),
    });
    const credentials = await res.json();

    const s = await streamTo({ credentials, target: videoRef.current! });
    setSession(s);
  }, []);

  const end = useCallback(() => {
    session?.end();
    setSession(null);
    setStatus('Ended');
  }, [session]);

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 500 }}>
        Next.js + Core SDK (no React bindings)
      </h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: 16,
          background: '#1a1a1a',
          objectFit: 'cover',
          marginTop: '1rem',
        }}
      />

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button onClick={start} disabled={session !== null}>Start</button>
        <button onClick={() => session?.mic.toggle()} disabled={!session}>
          {micOn ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={end} disabled={!session}>End call</button>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.75rem' }}>{status}</p>
    </main>
  );
}
