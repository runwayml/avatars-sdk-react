'use client';

import { useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '@runwayml/avatars-react/styles.css';
import { VideoHud, QuestionCard } from '../trivia-overlay';

const MOCK_QUESTION = {
  question: 'What is the largest planet in our solar system?',
  options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
  questionNumber: 3,
};

const MOCK_CORRECT = {
  correct: true,
  correctAnswer: 'Jupiter',
  explanation: 'Jupiter has a mass more than twice that of all other planets combined.',
};

const MOCK_INCORRECT = {
  correct: false,
  correctAnswer: 'Jupiter',
  userAnswer: 'Saturn',
  explanation: 'Jupiter has a mass more than twice that of all other planets combined.',
};

type ScenarioKey = 'idle' | 'question' | 'correct' | 'incorrect' | 'streak';

const SCENARIOS: Record<ScenarioKey, {
  label: string;
  question: typeof MOCK_QUESTION | null;
  result: typeof MOCK_CORRECT | null;
  score: number;
  streak: number;
}> = {
  idle: {
    label: 'Idle (no question)',
    question: null,
    result: null,
    score: 0,
    streak: 0,
  },
  question: {
    label: 'Question showing',
    question: MOCK_QUESTION,
    result: null,
    score: 2,
    streak: 0,
  },
  correct: {
    label: 'Correct answer',
    question: MOCK_QUESTION,
    result: MOCK_CORRECT,
    score: 3,
    streak: 1,
  },
  incorrect: {
    label: 'Wrong answer',
    question: MOCK_QUESTION,
    result: MOCK_INCORRECT,
    score: 2,
    streak: 0,
  },
  streak: {
    label: 'On a streak',
    question: MOCK_QUESTION,
    result: MOCK_CORRECT,
    score: 5,
    streak: 4,
  },
};

const SCENARIO_KEYS = Object.keys(SCENARIOS) as Array<ScenarioKey>;

export default function DevPage() {
  const [active, setActive] = useState<ScenarioKey>('question');
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const scenario = SCENARIOS[active];

  const handleScenario = useCallback((key: ScenarioKey) => {
    setActive(key);
    if ((key === 'correct' || key === 'streak') && confettiRef.current) {
      const fire = confetti.create(confettiRef.current, { resize: true });
      fire({ particleCount: 80, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
      fire({ particleCount: 40, spread: 100, origin: { y: 0.5 }, startVelocity: 25, disableForReducedMotion: true });
    }
  }, []);

  return (
    <main className="page page-call">
      <div className="stage">
        <div className="stage-center">
          <div className="video-area">
            <div className="dev-video-placeholder" />
            <canvas ref={confettiRef} className="confetti-canvas" />
            <VideoHud score={scenario.score} streak={scenario.streak} />
          </div>
          <QuestionCard question={scenario.question} result={scenario.result} />
        </div>
        <div className="dev-panel">
          <span className="dev-panel-label">State</span>
          <div className="dev-buttons">
            {SCENARIO_KEYS.map((key) => (
              <button
                key={key}
                className={`dev-button ${active === key ? 'dev-button-active' : ''}`}
                onClick={() => handleScenario(key)}
              >
                {SCENARIOS[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
