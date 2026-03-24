'use client';

import { useState, Suspense } from 'react';
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
  UserVideo,
} from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

const AVATAR_ID = process.env.NEXT_PUBLIC_AVATAR_ID!;

export default function Home() {
  const [session, setSession] = useState<{
    sessionId: string;
    sessionKey: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: AVATAR_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setSession(data);
    } catch (err) {
      console.error('Failed to connect:', err);
      setIsConnecting(false);
    }
  }

  if (!session) {
    return (
      <main className="page">
        <div className="hero">
          <span className="hero-emoji">🌤️</span>
          <h1 className="title">Weather Assistant</h1>
          <p className="subtitle">
            Ask an AI avatar about the weather in any city.
            It uses backend RPC to look up real data and speaks the results back.
          </p>
          <button
            className="connect-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Start Chat'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-call">
      <Suspense fallback={<div className="loading">Connecting...</div>}>
        <AvatarCall
          avatarId={AVATAR_ID}
          sessionId={session.sessionId}
          sessionKey={session.sessionKey}
          onEnd={() => { setSession(null); setIsConnecting(false); }}
          onError={console.error}
        >
          <AvatarVideo />
          <UserVideo />
          <ControlBar />
        </AvatarCall>
      </Suspense>
    </main>
  );
}
