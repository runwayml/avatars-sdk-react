'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
  avatarId: string;
  baseUrl?: string;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSession(null);
    setIsCreating(false);
    setError(null);
  }, []);

  async function startCall() {
    setIsOpen(true);
    setIsCreating(true);
    setError(null);
    setSession(null);
    try {
      const res = await fetch('/api/avatar/connect', { method: 'POST' });
      const body = (await res.json().catch(() => null)) as
        | SessionInfo
        | { error?: string }
        | null;
      if (!res.ok) {
        throw new Error(body && 'error' in body && body.error ? body.error : `Failed: ${res.status}`);
      }
      setSession(body as SessionInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      console.error(err);
    } finally {
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
                  avatarId={session.avatarId}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  baseUrl={session.baseUrl}
                  onEnd={closeModal}
                  onError={(err) => setError(err.message)}
                />
              </Suspense>
            ) : error ? (
              <div className="modal-error">{error}</div>
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
