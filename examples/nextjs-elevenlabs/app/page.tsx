'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

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
      const res = await fetch('/api/avatar/connect', { method: 'POST' });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
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
        <h1 className="title">ElevenLabs + Runway Avatar</h1>
        <p className="description">
          Your ElevenLabs Conversational AI agent, brought to life with a Runway
          avatar. The agent handles the conversation — Runway renders the face.
        </p>
      </header>

      <button className="start-button" onClick={startCall} disabled={isCreating}>
        {isCreating ? 'Starting...' : 'Start conversation'}
      </button>

      {isOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Conversation</span>
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
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  baseUrl={process.env.NEXT_PUBLIC_RUNWAYML_BASE_URL}
                  onEnd={closeModal}
                  onError={console.error}
                />
              </Suspense>
            ) : isCreating ? (
              <div className="modal-loading">Creating session...</div>
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
