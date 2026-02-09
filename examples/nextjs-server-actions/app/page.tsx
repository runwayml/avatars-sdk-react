import Runway from '@runwayml/sdk';
import { RunwayRealtime } from '../runway-realtime';
import { AvatarPicker } from './avatar-picker';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });
const realtime = new RunwayRealtime(client);

async function createAvatarSession(
  avatarId: string,
  options?: { isCustom?: boolean },
) {
  'use server';

  const avatar = options?.isCustom
    ? { type: 'custom' as const, customId: avatarId }
    : { type: 'runway-preset' as const, presetId: avatarId };

  const { id: sessionId } = await realtime.create({
    model: 'gwm1_avatars',
    avatar,
  });

  const { sessionKey } = await realtime.waitForReady(sessionId);

  return { sessionId, sessionKey };
}

export default function Page() {
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
          Build conversational avatar experiences using React Server Actions.
          Choose a preset below to try it out.
        </p>
      </header>

      <AvatarPicker connect={createAvatarSession} />

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
