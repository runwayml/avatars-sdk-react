'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import confetti from 'canvas-confetti';
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
  UserVideo,
  useClientEvent,
  useClientEvents,
  useTranscription,
} from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import type { TriviaEvent } from '@/lib/avatar-tools';
import { VideoHud, QuestionCard, EventLog, type EventLogEntry } from './trivia-overlay';

const AVATAR_ID = '9db8d1ba-b173-428b-afd6-7b6178913596';

const SOUNDS: Record<string, string> = {
  correct: 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3',
  incorrect: 'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
  drumroll: 'https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3',
  applause: 'https://cdn.freesound.org/previews/462/462362_8337792-lq.mp3',
  buzzer: 'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
};

export default function Home() {
  const [session, setSession] = useState<{
    sessionId: string;
    sessionKey: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/avatar/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: AVATAR_ID }),
      });
      setSession(await res.json());
    } catch (err) {
      console.error('Failed to connect:', err);
      setIsConnecting(false);
    }
  }

  if (!session) {
    return (
      <main className="page">
        <div className="hero">
          <span className="hero-emoji">🧠</span>
          <h1 className="title">Avatar Trivia</h1>
          <p className="subtitle">
            Chat with an AI avatar that hosts a live trivia game.
            Questions, answers, and scores update in real-time via client events.
          </p>
          <button
            className="connect-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Setting up the show...' : 'Start Trivia Game'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-call">
      <Suspense fallback={<div className="loading">Connecting to host...</div>}>
        <TriviaGame
          session={session}
          onEnd={() => { setSession(null); setIsConnecting(false); }}
        />
      </Suspense>
    </main>
  );
}

function fireConfetti(canvas: HTMLCanvasElement) {
  const fire = confetti.create(canvas, { resize: true });
  fire({ particleCount: 80, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
  fire({ particleCount: 40, spread: 100, origin: { y: 0.5 }, startVelocity: 25, disableForReducedMotion: true });
}

let nextEventId = 0;

function TriviaGame(props: {
  session: { sessionId: string; sessionKey: string };
  onEnd: () => void;
}) {
  const { session, onEnd } = props;

  const [question, setQuestion] = useState<{
    question: string;
    options: Array<string>;
    questionNumber: number;
  } | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [eventLog, setEventLog] = useState<Array<EventLogEntry>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  const handleShowQuestion = useCallback((_args: { question: string; options: Array<string>; questionNumber: number }) => {
    setQuestion(_args);
    setResult(null);
  }, []);

  const handleRevealAnswer = useCallback((args: { correct: boolean; correctAnswer: string; explanation?: string }) => {
    setResult(args);
    if (args.correct && confettiRef.current) {
      fireConfetti(confettiRef.current);
    }
  }, []);

  const handlePlaySound = useCallback((args: { sound: string }) => {
    const url = SOUNDS[args.sound];
    if (url) {
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, []);

  const handleScoreUpdate = useCallback((args: { score: number; streak: number }) => {
    setScore(args.score);
    setStreak(args.streak);
  }, []);

  const logEvent = useCallback((tool: string, args: Record<string, unknown>) => {
    setEventLog((prev) => [
      ...prev,
      { id: nextEventId++, kind: 'event', tool, args, time: new Date() },
    ]);
  }, []);

  const logTranscript = useCallback((entry: { participantIdentity: string; text: string }) => {
    setEventLog((prev) => [
      ...prev,
      {
        id: nextEventId++,
        kind: 'transcript',
        participant: entry.participantIdentity,
        text: entry.text,
        time: new Date(),
      },
    ]);
  }, []);

  return (
    <div className="stage">
      <div className="stage-center">
        <AvatarCall
          avatarId={AVATAR_ID}
          sessionId={session.sessionId}
          sessionKey={session.sessionKey}
          baseUrl={process.env.NEXT_PUBLIC_RUNWAYML_BASE_URL}
          onEnd={onEnd}
          onError={console.error}
        >
          <AvatarVideo />
          <UserVideo />
          <TriviaEventHandlers
            onShowQuestion={handleShowQuestion}
            onRevealAnswer={handleRevealAnswer}
            onPlaySound={handlePlaySound}
            onScoreUpdate={handleScoreUpdate}
            onEvent={logEvent}
            onTranscript={logTranscript}
          />
          <VideoHud score={score} streak={streak}>
            <ControlBar />
          </VideoHud>
        </AvatarCall>
        <QuestionCard question={question} result={result} />
      </div>
      <EventLog entries={eventLog} />
      <canvas ref={confettiRef} className="confetti-canvas" />
    </div>
  );
}

function TriviaEventHandlers(props: {
  onShowQuestion: (args: { question: string; options: Array<string>; questionNumber: number }) => void;
  onRevealAnswer: (args: { correct: boolean; correctAnswer: string; explanation?: string }) => void;
  onPlaySound: (args: { sound: string }) => void;
  onScoreUpdate: (args: { score: number; streak: number }) => void;
  onEvent: (tool: string, args: Record<string, unknown>) => void;
  onTranscript: (entry: { participantIdentity: string; text: string }) => void;
}) {
  useClientEvent<TriviaEvent, 'show_question'>('show_question', props.onShowQuestion);
  useClientEvent<TriviaEvent, 'reveal_answer'>('reveal_answer', props.onRevealAnswer);
  useClientEvent<TriviaEvent, 'play_sound'>('play_sound', props.onPlaySound);
  useClientEvent<TriviaEvent, 'update_score'>('update_score', props.onScoreUpdate);

  useClientEvents<TriviaEvent>((event) => {
    props.onEvent(event.tool, event.args as Record<string, unknown>);
  });

  useTranscription(props.onTranscript);

  return null;
}
