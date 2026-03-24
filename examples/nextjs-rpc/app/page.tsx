'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import confetti from 'canvas-confetti';
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
  UserVideo,
  useClientEvents,
  useTranscription,
} from '@runwayml/avatars-react';
import '@runwayml/avatars-react/styles.css';
import type { TriviaEvent } from '@/lib/avatar-tools';
import { ScoreHud, QuestionCard, ResultBanner, EventLog, type EventLogEntry } from './trivia-overlay';

const AVATAR_ID = process.env.NEXT_PUBLIC_AVATAR_ID!;

const SOUNDS: Record<string, string> = {
  correct: 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3',
  incorrect: 'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setSession(data);
    } catch (err) {
      console.error('Failed to connect:', err);
      setIsConnecting(false);
    }
  }

  if (!session) {
    return (
      <main className="page">
        <div className="hero">
          <span className="hero-emoji">🎙️</span>
          <h1 className="title">Quiz Master Max</h1>
          <p className="subtitle">
            A flamboyant game show host runs trivia using backend RPC to fetch questions
            from a database and client events to drive the UI in real-time.
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
}

let nextEventId = 0;

type NextStepArgs = Extract<TriviaEvent, { tool: 'next_step' }>['args'];

function TriviaGame(props: {
  session: { sessionId: string; sessionKey: string };
  onEnd: () => void;
}) {
  const { session, onEnd } = props;

  const [question, setQuestion] = useState<{ question: string; options: Array<string>; questionNumber: number } | null>(null);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<{ correct: boolean; correctAnswer: string; key: number } | null>(null);
  const [eventLog, setEventLog] = useState<Array<EventLogEntry>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  const handleNextStep = useCallback((args: NextStepArgs) => {
    if (args.previousCorrect != null) {
      setLastResult({ correct: args.previousCorrect, correctAnswer: args.previousCorrectAnswer!, key: args.questionNumber });
      if (args.previousCorrect && confettiRef.current) fireConfetti(confettiRef.current);
      const url = args.sound ? SOUNDS[args.sound] : undefined;
      if (url) {
        audioRef.current?.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }
    setScore(args.score);
    setQuestion({ question: args.question, options: args.options, questionNumber: args.questionNumber });
  }, []);

  const logEvent = useCallback((tool: string, args: Record<string, unknown>) => {
    setEventLog((prev) => [...prev, { id: nextEventId++, kind: 'event', tool, args, time: new Date() }]);
  }, []);

  const logTranscript = useCallback((entry: { participantIdentity: string; text: string }) => {
    setEventLog((prev) => [...prev, { id: nextEventId++, kind: 'transcript', participant: entry.participantIdentity, text: entry.text, time: new Date() }]);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/avatar/events');
    eventSource.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data) as { tool: string; args: Record<string, unknown>; durationMs: number; time: string };
        setEventLog((prev) => [...prev, { id: nextEventId++, kind: 'rpc', tool: data.tool, args: data.args, durationMs: data.durationMs, time: new Date(data.time) }]);
      } catch {}
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="stage">
      <div className="stage-center">
        <AvatarCall
          avatarId={AVATAR_ID}
          sessionId={session.sessionId}
          sessionKey={session.sessionKey}
          onEnd={onEnd}
          onError={console.error}
        >
          <AvatarVideo />
          <UserVideo />
          <TriviaEventHandlers onNextStep={handleNextStep} onEvent={logEvent} onTranscript={logTranscript} />
          <ScoreHud score={score}>
            <ControlBar />
          </ScoreHud>
        </AvatarCall>
        {lastResult && <ResultBanner key={lastResult.key} correct={lastResult.correct} answer={lastResult.correctAnswer} />}
        <QuestionCard question={question} />
      </div>
      <EventLog entries={eventLog} />
      <canvas ref={confettiRef} className="confetti-canvas" />
    </div>
  );
}

function TriviaEventHandlers(props: {
  onNextStep: (args: NextStepArgs) => void;
  onEvent: (tool: string, args: Record<string, unknown>) => void;
  onTranscript: (entry: { participantIdentity: string; text: string }) => void;
}) {
  useClientEvents<TriviaEvent>((event) => {
    props.onEvent(event.tool, event.args as Record<string, unknown>);
    if (event.tool === 'next_step') props.onNextStep(event.args);
  });

  useTranscription(props.onTranscript);

  return null;
}
