import { useCallback, useEffect, useState } from 'react';
import { AvatarCall, type SessionCredentials } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import './globals.css';

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

export function App() {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customAvatarId, setCustomAvatarId] = useState('');
  const [isCustomCall, setIsCustomCall] = useState(false);
  const selectedPreset = PRESETS.find((p) => p.id === activePreset);

  const closeModal = useCallback(() => {
    setActivePreset(null);
    setIsCustomCall(false);
  }, []);

  const handleCustomStart = useCallback(() => {
    if (customAvatarId.trim()) {
      setIsCustomCall(true);
    }
  }, [customAvatarId]);

  const handleCustomInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomAvatarId(e.target.value);
    },
    [],
  );

  const handleCustomInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleCustomStart();
    },
    [handleCustomStart],
  );

  const handleModalContentClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
    },
    [],
  );

  const handlePresetClick = useCallback(
    (presetId: string) => () => {
      setActivePreset(presetId);
    },
    [],
  );

  const handleConnect = useCallback(
    async (avatarId: string): Promise<SessionCredentials> => {
      const payload = isCustomCall
        ? { customAvatarId: avatarId }
        : { avatarId };
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    [isCustomCall],
  );

  useEffect(() => {
    if (!activePreset && !isCustomCall) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePreset, isCustomCall, closeModal]);

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
        <h1 className="title">Real-time Avatars</h1>
        <p className="description">
          Build conversational avatar experiences with a simple React component.
          Choose a preset below to try it out.
        </p>
      </header>

      <div className="presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset"
            onClick={handlePresetClick(preset.id)}
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
            onChange={handleCustomInputChange}
            placeholder="Enter custom avatar ID"
            className="custom-avatar-input"
            onKeyDown={handleCustomInputKeyDown}
          />
          <button
            onClick={handleCustomStart}
            disabled={!customAvatarId.trim()}
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
          href="https://github.com/runwayml/avatar-react"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon aria-hidden="true" />
          GitHub
        </a>
      </footer>

      {(activePreset && selectedPreset) || isCustomCall ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={handleModalContentClick}>
            <div className="modal-header">
              <span className="modal-title">
                {isCustomCall ? `Custom Avatar · ${customAvatarId}` : `${selectedPreset?.name} · ${selectedPreset?.subtitle}`}
              </span>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>
            <AvatarCall
              avatarId={isCustomCall ? customAvatarId : activePreset!}
              avatarImageUrl={selectedPreset?.imageUrl}
              connect={handleConnect}
              onEnd={closeModal}
              onError={console.error}
            />
          </div>
        </div>
      ) : null}
    </main>
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
