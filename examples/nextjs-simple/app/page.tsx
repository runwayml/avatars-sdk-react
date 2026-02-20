'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';


// To use a custom avatar, update the id to your custom avatar ID.
const MY_AVATAR = {
  id: 'game-host',
  name: 'Tooth',
  imageUrl:
    'https://runway-static-assets.s3.us-east-1.amazonaws.com/devportal/avatars/character-reference/example-2.jpeg',
};

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSession(null);
    setIsCreating(false);
  }, []);

  async function startCall() {
    setIsOpen(true);
    setIsCreating(true);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: MY_AVATAR.id }),
      });
      setSession(await res.json());
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  return (
    <main className="page">
      <header className="header">
        <h1 className="title">Runway Characters Demo</h1>
      </header>

      <div className="presets">
        <button className="preset" onClick={startCall}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MY_AVATAR.imageUrl}
            alt={MY_AVATAR.name}
            width={240}
            height={320}
            className="preset-avatar"
          />
          <div className="preset-info">
            <span className="preset-name">{MY_AVATAR.name}</span>
          </div>
        </button>
      </div>

      {isOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {MY_AVATAR.name}
              </span>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
            {session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={MY_AVATAR.id}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={MY_AVATAR.imageUrl}
                  onEnd={closeModal}
                  onError={console.error}
                />
              </Suspense>
            ) : isCreating ? (
              <div className="modal-loading">Creating avatar session...</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
