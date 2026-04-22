'use client';

import {
  memo,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
  type SVGProps,
} from 'react';
import {
  AvatarProvider,
  AvatarVideo,
  ControlBar,
  useAvatarStatus,
  useTranscript,
  type TranscriptionEntry,
} from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

const PRESET_ID = 'fashion-designer';
const PRESET_NAME = 'Sofia';
const PRESET_SUBTITLE = 'Fashion Designer';
const PRESET_IMAGE =
  'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-Avatar-3_input.png';

const VISIBLE_LINES = 2;

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: PRESET_ID }),
      });
      if (!res.ok) throw new Error(`Failed to create session (${res.status})`);
      setSession(await res.json());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
    } finally {
      setIsCreating(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setSession(null);
    setIsCreating(false);
    setError(null);
  }, []);

  const onAvatarError = useCallback((err: unknown) => {
    console.error(err);
  }, []);

  const stopModalClose = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  useEffect(() => {
    if (!session) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [session, closeModal]);

  return (
    <main className="page">
      <LandingHeader />

      <button
        className="start-button"
        onClick={startCall}
        disabled={isCreating}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRESET_IMAGE}
          alt={PRESET_NAME}
          width={240}
          height={320}
          className="start-avatar"
        />
        <div className="start-info">
          <span className="start-name">{PRESET_NAME}</span>
          <span className="start-subtitle">{PRESET_SUBTITLE}</span>
          <span className="start-cta">
            {isCreating ? 'Connecting...' : 'Start conversation'}
          </span>
        </div>
      </button>

      {error !== null ? <p className="error">{error}</p> : null}

      <LandingFooter />

      {session ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={stopModalClose}>
            <div className="modal-header">
              <span className="modal-title">
                {PRESET_NAME} &middot; {PRESET_SUBTITLE}
              </span>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </div>

            <AvatarProvider
              avatarId={PRESET_ID}
              sessionId={session.sessionId}
              sessionKey={session.sessionKey}
              baseUrl={process.env.NEXT_PUBLIC_RUNWAYML_BASE_URL}
              onEnd={closeModal}
              onError={onAvatarError}
              fallback={
                <div className="modal-loading">Connecting...</div>
              }
            >
              <div className="call-video">
                <AvatarVideo />
                <ControlBar />
              </div>
              <Subtitles />
            </AvatarProvider>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Subtitles() {
  const avatar = useAvatarStatus();
  const transcript = useTranscript({ interim: true });

  if (
    avatar.status === 'ended' ||
    avatar.status === 'error' ||
    transcript.length === 0
  ) {
    return null;
  }

  return (
    <div className="subtitles">
      {transcript.slice(-VISIBLE_LINES).map((entry) => (
        <SubtitleLine key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

const SubtitleLine = memo(function SubtitleLine({
  entry,
}: {
  entry: TranscriptionEntry;
}) {
  const isAgent =
    entry.participantIdentity.startsWith('agent') ||
    entry.id.startsWith('runway-transcription-assistant');

  return (
    <p
      className={
        entry.final ? 'subtitle-line' : 'subtitle-line subtitle-interim'
      }
    >
      <span className="subtitle-speaker">
        {isAgent ? PRESET_NAME : 'You'}
      </span>
      {entry.text}
    </p>
  );
});

const LandingHeader = memo(function LandingHeader() {
  return (
    <header className="header">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://d3phaj0sisr2ct.cloudfront.net/logos/runway_api.svg"
        alt="Runway API"
        width={120}
        height={24}
        className="logo"
      />
      <h1 className="title">Subtitles</h1>
      <p className="description">
        Live captions below the video during avatar conversations.
        <br />
        Powered by <code>useTranscript</code>.
      </p>
    </header>
  );
});

const LandingFooter = memo(function LandingFooter() {
  return (
    <footer className="footer">
      <a
        href="https://docs.dev.runwayml.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Documentation
      </a>
      <a
        href="https://github.com/runwayml/avatars-sdk-react"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </footer>
  );
});

const CloseIcon = memo(function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
});
