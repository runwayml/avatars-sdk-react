'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

// To use a custom avatar, update the id to your custom avatar ID.
// The name and imageUrl are optional — they will be fetched from the API if not provided.
const MY_AVATAR: AvatarConfig = {
  id: 'music-superstar',
  // name: 'Mina',
  // imageUrl: 'https://...',
};

interface AvatarConfig {
  id: string;
  name?: string;
  imageUrl?: string;
}

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [avatar, setAvatar] = useState<AvatarConfig>(MY_AVATAR);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (MY_AVATAR.name && MY_AVATAR.imageUrl) {
      return;
    }
    fetch(`/api/avatar/${MY_AVATAR.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setAvatar((prev) => ({
          ...prev,
          name: prev.name ?? data.name,
          imageUrl: prev.imageUrl ?? data.imageUrl,
        }));
      })
      .catch(console.error);
  }, []);

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
        body: JSON.stringify({ avatarId: avatar.id }),
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
          {avatar.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatar.imageUrl}
              alt={avatar.name ?? 'Avatar'}
              width={240}
              height={320}
              className="preset-avatar"
            />
          ) : (
            <div className="preset-avatar preset-avatar-placeholder" />
          )}
          <div className="preset-info">
            <span className="preset-name">{avatar.name ?? 'Loading...'}</span>
          </div>
        </button>
      </div>

      {isOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {avatar.name ?? 'Avatar'}
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
                  avatarId={avatar.id}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={avatar.imageUrl}
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
