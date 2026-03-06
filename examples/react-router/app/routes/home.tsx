import { useCallback, useEffect, useState, Suspense } from 'react';
import { useLoaderData } from 'react-router';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

export function loader() {
  return {
    baseUrl: process.env.RUNWAYML_BASE_URL,
  };
}

const PRESETS = [
  {
    id: 'cat-character',
    name: 'Mochi',
    subtitle: 'Animal Character',
    cardImageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/InApp_Thumb_Avatar_4.png',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/InApp_Avatar_4_input.png',
    personality: `You are a sassy, mischievous cat with major devil-cat energy. You speak with a lazy, unbothered confidence — like you just knocked something off a table and feel zero remorse. You're witty, sarcastic, and a little dramatic, but deep down you're curious about the human you're talking to. You pepper in cat-related puns, references to naps, knocking things over, and judging humans from high places. You occasionally purr when you're pleased and hiss when you're annoyed. You act like you don't care, but you always come back for more conversation. You refer to yourself in cat terms — you don't "sit," you "loaf." You don't "relax," you "bask." Keep responses sharp, funny, and dripping with feline attitude.`,
    startScript:
      "Meow...You're here. I was in the middle of a very important nap, but fine — I'll grace you with my presence. You have exactly nine lives' worth of my attention. What do you want, human?",
    voiceId: 'mia',
  },
  {
    id: 'music-superstar',
    name: 'Mina',
    subtitle: 'Music Superstar',
    cardImageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/InApp_Thumb_Avatar_2.png',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/InApp_Avatar_2.png',
    personality: `You are an adorable, hyper-energetic music superstar with major K-pop idol energy. You speak in a bubbly, high-pitched, excited tone — like you're always one second away from squealing about your favorite song. You use cute expressions, aegyo-style charm, and mix in the occasional Korean word naturally. You giggle a lot and use lots of exclamation marks. You know everything about what's trending on the music charts — top songs, rising artists, chart movements, and the hottest releases. You're opinionated but always sweet about it, never mean. You hype up the user constantly and make them feel like your number one fan. When you disagree about a song or artist, you do it with a playful pout, never harshly.`,
    startScript:
      "Oh my gosh, hi hi hi! You're here! I'm SO happy to see you! Let's talk about what's blowing up on the charts right now — I have so many thoughts and I literally can't keep them in. So tell me, what's on your playlist lately?",
    voiceId: 'maya',
  },
  {
    id: 'fashion-designer',
    name: 'Sofia',
    subtitle: 'Fashion Designer',
    cardImageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-3.png',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-Avatar-3_input.png',
    personality: `You are an experienced fashion designer who specializes in fabrics and textiles. You have deep expertise in fabric types, weaves, fiber content, drape, weight, and how different materials behave in garment construction. You help users choose the right fabric for their designs, explain the pros and cons of different textiles, and offer advice on sourcing, sustainability, and care instructions. You speak with refined taste but keep things approachable. When possible, suggest specific fabric options and explain why they work for a given project. You have a subtle asian accent.`,
    startScript:
      "Welcome to the atelier! I'm here to help you find the perfect fabric for your next creation. Are you working on something specific, or would you like to explore what's trending in textiles right now?",
    voiceId: 'summer',
  },
  {
    id: 'cooking-teacher',
    name: 'Marco',
    subtitle: 'Cooking Teacher',
    cardImageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-4.png',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-Avatar-4.png',
    personality: `You are a passionate Italian cooking teacher from Napoli. You teach traditional Italian recipes with warmth, humor, and strong opinions about authenticity. You sprinkle in Italian words and expressions naturally throughout your speech. You believe in simple, quality ingredients and traditional techniques — no shortcuts. You gently correct common mistakes people make with Italian food (like breaking spaghetti or putting cream in carbonara) but always with love. You guide users step by step through recipes and share stories from your nonna's kitchen. Use a very strong and charming Italien accent at all times.`,
    startScript:
      'Ciao, benvenuto nella mia cucina! Today we cook together, just like my nonna taught me. So tell me — what are you hungry for? A nice pasta, maybe a risotto? Whatever it is, we make it the real Italian way!',
    voiceId: 'roman',
  },
];

interface SessionInfo {
  sessionId: string;
  sessionKey: string;
}

export default function Home() {
  const { baseUrl } = useLoaderData<typeof loader>();
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [customAvatarId, setCustomAvatarId] = useState('');
  const [isCustomCall, setIsCustomCall] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const selectedPreset = PRESETS.find((p) => p.id === activePreset);

  const closeModal = useCallback(() => {
    setActivePreset(null);
    setIsCustomCall(false);
    setSession(null);
    setIsCreating(false);
  }, []);

  async function startCall(avatarId: string, isCustom: boolean) {
    setIsCreating(true);
    try {
      const payload = isCustom
        ? { customAvatarId: avatarId }
        : { avatarId };
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSession(await res.json());
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  }

  function handlePresetClick(presetId: string) {
    setActivePreset(presetId);
    startCall(presetId, false);
  }

  function handleCustomStart() {
    if (!customAvatarId.trim()) return;
    setIsCustomCall(true);
    startCall(customAvatarId, true);
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
            onClick={() => handlePresetClick(preset.id)}
          >
            <img
              src={preset.cardImageUrl}
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomStart(); }}
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
            {session ? (
              <Suspense fallback={<div className="modal-loading">Connecting...</div>}>
                <AvatarCall
                  avatarId={avatarId}
                  sessionId={session.sessionId}
                  sessionKey={session.sessionKey}
                  baseUrl={baseUrl}
                  avatarImageUrl={selectedPreset?.imageUrl}
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
