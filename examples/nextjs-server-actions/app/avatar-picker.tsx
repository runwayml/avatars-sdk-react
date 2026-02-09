'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

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

interface SelectedAvatar {
  id: string;
  name: string;
  subtitle: string;
  imageUrl?: string;
}

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

interface AvatarPickerProps {
  connect: (avatarId: string, options?: { isCustom?: boolean }) => Promise<SessionInfo>;
}

export function AvatarPicker({ connect }: AvatarPickerProps) {
  const [selected, setSelected] = useState<SelectedAvatar | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isPending, startTransition] = useTransition();
  const [customAvatarId, setCustomAvatarId] = useState('');

  function startCall(avatar: SelectedAvatar, isCustom: boolean) {
    setSelected(avatar);
    setSession(null);
    startTransition(async () => {
      const result = await connect(avatar.id, { isCustom });
      setSession(result);
    });
  }

  function closeModal() {
    setSelected(null);
    setSession(null);
  }

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  return (
    <>
      <div className="presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset"
            onClick={() => startCall(preset, false)}
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customAvatarId.trim()) {
                startCall({ id: customAvatarId, name: 'Custom Avatar', subtitle: customAvatarId }, true);
              }
            }}
          />
          <button
            onClick={() => startCall({ id: customAvatarId, name: 'Custom Avatar', subtitle: customAvatarId }, true)}
            disabled={!customAvatarId.trim()}
            className="custom-avatar-button"
          >
            Start Call
          </button>
        </div>
      </div>

      {selected ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {selected.name} · {selected.subtitle}
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
                  avatarId={selected.id}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  avatarImageUrl={selected.imageUrl}
                  onEnd={closeModal}
                  onError={console.error}
                />
              </Suspense>
            ) : isPending ? (
              <div className="modal-loading">Creating avatar session...</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
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
