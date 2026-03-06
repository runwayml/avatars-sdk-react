'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { AvatarCall } from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';

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
