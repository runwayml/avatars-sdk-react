'use client';

import { useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '@runwayml/avatars-react/styles.css';
import { ScoreHud, QuestionCard, ResultBanner } from '../trivia-overlay';

const MOCK_QUESTION = {
  question: 'What is the largest planet in our solar system?',
  options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
  questionNumber: 3,
};

type ScenarioKey = 'idle' | 'question' | 'correct' | 'incorrect';

const SCENARIOS: Record<ScenarioKey, {
  label: string;
  question: typeof MOCK_QUESTION | null;
  result: { correct: boolean; correctAnswer: string } | null;
  score: number;
}> = {
  idle: {
    label: 'Idle (no question)',
    question: null,
    result: null,
    score: 0,
  },
  question: {
    label: 'Question showing',
    question: MOCK_QUESTION,
    result: null,
    score: 2,
  },
  correct: {
    label: 'Correct answer',
    question: MOCK_QUESTION,
    result: { correct: true, correctAnswer: 'Jupiter' },
    score: 3,
  },
  incorrect: {
    label: 'Wrong answer',
    question: MOCK_QUESTION,
    result: { correct: false, correctAnswer: 'Jupiter' },
    score: 2,
  },
};

const SCENARIO_KEYS = Object.keys(SCENARIOS) as Array<ScenarioKey>;

export default function DevPage() {
  const [active, setActive] = useState<ScenarioKey>('question');
  const [bannerKey, setBannerKey] = useState(0);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const scenario = SCENARIOS[active];

  const handleScenario = useCallback((key: ScenarioKey) => {
    setActive(key);
    setBannerKey((k) => k + 1);
    if (key === 'correct' && confettiRef.current) {
      const fire = confetti.create(confettiRef.current, { resize: true });
      fire({ particleCount: 80, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
    }
  }, []);

  return (
    <main className="page page-call">
      <div className="stage">
        <div className="stage-center">
          <div className="video-area">
            <div className="dev-video-placeholder" />
            <canvas ref={confettiRef} className="confetti-canvas" />
            <ScoreHud score={scenario.score} />
          </div>
          {scenario.result && (
            <ResultBanner key={bannerKey} correct={scenario.result.correct} answer={scenario.result.correctAnswer} />
          )}
          <QuestionCard question={scenario.question} />
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
