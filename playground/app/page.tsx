'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

const STORAGE_KEY = 'runway-api-key';

const PRESETS = [
  {
    id: 'coding-teacher',
    name: 'Ivy',
    subtitle: 'Coding Teacher',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/devportal/avatars/character-reference/example-1.jpeg',
  },
  {
    id: 'game-host',
    name: 'Tooth',
    subtitle: 'Game Host',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/devportal/avatars/character-reference/example-2.jpeg',
  },
  {
    id: 'customer-service',
    name: 'Jordan',
    subtitle: 'Customer Service',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/devportal/avatars/character-reference/example-3.jpeg',
  },
  {
    id: 'trivia-host',
    name: 'Maya',
    subtitle: 'Trivia Host',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/devportal/avatars/character-reference/example-4.jpeg',
  },
];

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customAvatarId, setCustomAvatarId] = useState('');
  const [isCustomCall, setIsCustomCall] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedPreset = PRESETS.find((p) => p.id === activePreset);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setApiKeyInput(stored);
    }
  }, []);

  function handleSaveApiKey() {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKey(trimmed);
  }

  function handleClearApiKey() {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setApiKeyInput('');
  }

  const closeModal = useCallback(() => {
    setActivePreset(null);
    setIsCustomCall(false);
    setSession(null);
    setIsCreating(false);
    setError(null);
  }, []);

  async function startCall(avatarId: string, isCustom: boolean) {
    setIsCreating(true);
    setError(null);
    try {
      const payload = isCustom
        ? { customAvatarId: avatarId, apiKey }
        : { avatarId, apiKey };
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session');
      }
      setSession(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setIsCreating(false);
    }
  }

  function handlePresetClick(presetId: string) {
    if (!apiKey) return;
    setActivePreset(presetId);
    startCall(presetId, false);
  }

  function handleCustomStart() {
    if (!customAvatarId.trim() || !apiKey) return;
    setIsCustomCall(true);
    startCall(customAvatarId, true);
  }

  function handleRetry() {
    setError(null);
    const avatarId = isCustomCall ? customAvatarId : activePreset!;
    startCall(avatarId, isCustomCall);
  }

  useEffect(() => {
    if (!activePreset && !isCustomCall) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePreset, isCustomCall, closeModal]);

  const avatarId = isCustomCall ? customAvatarId : activePreset!;
  const isModalOpen = (activePreset && selectedPreset) || isCustomCall;
  const hasApiKey = Boolean(apiKey);

  return (
    <main className="page">
      <header className="header">
        <img
          src="https://d3phaj0sisr2ct.cloudfront.net/logos/runway_api.svg"
          alt="Runway API"
          width={120}
          height={24}
          className="logo"
        />
        <h1 className="title">Avatar Playground</h1>
        <p className="description">
          Try the Runway Avatar SDK with your own API key. Your key is stored locally and never saved on our servers.
        </p>
      </header>

      <form
        className="api-key-section"
        onSubmit={(e) => {
          e.preventDefault();
          if (hasApiKey) {
            handleClearApiKey();
          } else {
            handleSaveApiKey();
          }
        }}
      >
        <div className="api-key-header">
          <span className="api-key-title">
            <KeyIcon aria-hidden="true" />
            API Key
          </span>
          <span className={`api-key-status ${hasApiKey ? 'connected' : 'missing'}`}>
            {hasApiKey ? 'Connected' : 'Required'}
          </span>
        </div>
        <div className="api-key-input-group">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="rw_xxxxxxxxxxxx"
            className="api-key-input"
            autoComplete="off"
          />
          {hasApiKey ? (
            <button type="submit" className="api-key-button clear">
              Clear
            </button>
          ) : (
            <button
              type="submit"
              disabled={!apiKeyInput.trim()}
              className="api-key-button"
            >
              Save
            </button>
          )}
        </div>
        <p className="api-key-hint">
          Get your API key from the{' '}
          <a href="https://app.runwayml.com/settings/api-keys" target="_blank" rel="noopener noreferrer">
            Runway Dashboard
          </a>
        </p>
      </form>

      <div className="presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset"
            onClick={() => handlePresetClick(preset.id)}
            disabled={!hasApiKey}
            title={hasApiKey ? `Start call with ${preset.name}` : 'Enter your API key first'}
          >
            <img
              src={preset.imageUrl}
              alt={preset.name}
              width={240}
              height={320}
              className="preset-avatar"
            />
            <div className="preset-info">
              <span className="preset-name">{preset.name}</span>
              <span className="preset-subtitle">{preset.subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="custom-avatar">
        <h2 className="custom-avatar-title">Or use a custom avatar</h2>
        <div className="custom-avatar-input-group">
          <input
            type="text"
            value={customAvatarId}
            onChange={(e) => setCustomAvatarId(e.target.value)}
            placeholder="Enter custom avatar ID"
            className="custom-avatar-input"
            disabled={!hasApiKey}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomStart(); }}
          />
          <button
            onClick={handleCustomStart}
            disabled={!customAvatarId.trim() || !hasApiKey}
            className="custom-avatar-button"
          >
            Start Call
          </button>
        </div>
      </div>

      <footer className="footer">
        <a
          href="https://docs.runwayml.com/avatars"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DocIcon aria-hidden="true" />
          Documentation
        </a>
        <a
          href="https://github.com/runwayml/avatars-sdk-react"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon aria-hidden="true" />
          GitHub
        </a>
      </footer>

      {isModalOpen ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {isCustomCall
                  ? `Custom Avatar · ${customAvatarId}`
                  : `${selectedPreset?.name} · ${selectedPreset?.subtitle}`}
              </span>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
            {error ? (
              <div className="modal-error">
                <span>{error}</span>
                <button className="modal-error-retry" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            ) : session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={avatarId}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={selectedPreset?.imageUrl}
                  onEnd={closeModal}
                  onError={(err) => setError(err.message)}
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

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function DocIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
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
