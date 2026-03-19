import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface QuestionState {
  question: string;
  options: Array<string>;
  questionNumber: number;
}

interface ResultState {
  correct: boolean;
  correctAnswer: string;
  userAnswer?: string;
  explanation?: string;
}

export type EventLogEntry =
  | { id: number; kind: 'event'; tool: string; args: Record<string, unknown>; time: Date }
  | { id: number; kind: 'transcript'; participant: string; text: string; time: Date };

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function summarizeArgs(args: Record<string, unknown>): string {
  const parts: Array<string> = [];
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === 'string') {
      const truncated = value.length > 40 ? `${value.slice(0, 37)}…` : value;
      parts.push(`${key}: "${truncated}"`);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      parts.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      parts.push(`${key}: [${value.length}]`);
    }
  }
  return parts.join(', ');
}

const TOOL_ICONS: Record<string, string> = {
  show_question: '❓',
  reveal_answer: '✅',
  update_score: '🏆',
  play_sound: '🔊',
};

function entriesToText(entries: Array<EventLogEntry>): string {
  return entries
    .map((e) => {
      if (e.kind === 'transcript') {
        return `${formatTime(e.time)} [${e.participant}] "${e.text}"`;
      }
      return `${formatTime(e.time)} ${e.tool} ${JSON.stringify(e.args)}`;
    })
    .join('\n');
}

export function EventLog(props: { entries: Array<EventLogEntry> }) {
  const { entries } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(entriesToText(entries)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [entries]);

  return (
    <div className="event-log">
      <div className="event-log-header">
        <span className="event-log-dot" />
        Client Events
        <span className="event-log-count">{entries.length}</span>
        {entries.length > 0 && (
          <button
            className="event-log-copy"
            onClick={handleCopy}
            title="Copy events as text"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
      <div className="event-log-body" ref={scrollRef}>
        {entries.length === 0 && (
          <p className="event-log-empty">Waiting for events…</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className={`event-log-row ${entry.kind === 'transcript' ? 'event-log-row-transcript' : ''}`}>
            <span className="event-log-time">{formatTime(entry.time)}</span>
            {entry.kind === 'transcript' ? (
              <>
                <span className="event-log-icon">💬</span>
                <span className="event-log-participant">{entry.participant}</span>
                <span className="event-log-text">{entry.text}</span>
              </>
            ) : (
              <>
                <span className="event-log-icon">
                  {TOOL_ICONS[entry.tool] ?? '⚡'}
                </span>
                <span className="event-log-tool">{entry.tool}</span>
                <span className="event-log-args">{summarizeArgs(entry.args)}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoHud(props: {
  score: number;
  streak: number;
  children?: ReactNode;
}) {
  const { score, streak, children } = props;

  return (
    <div className="video-hud">
      <div className="hud-top">
        <div className="score-pill">
          <span className="score-pill-label">Score</span>
          <span className="score-pill-value">{score}</span>
        </div>
        {streak > 0 && (
          <div className="streak-pill">
            {streak} streak
          </div>
        )}
      </div>
      {children && (
        <div className="hud-bottom">
          {children}
        </div>
      )}
    </div>
  );
}

export function QuestionCard(props: {
  question: QuestionState | null;
  result: ResultState | null;
}) {
  const { question, result } = props;

  if (!question?.options) return null;

  function optionClass(option: string) {
    if (!result) return '';
    if (option === result.correctAnswer) return 'option-correct';
    if (!result.correct && option === result.userAnswer) return 'option-wrong';
    return 'option-dim';
  }

  return (
    <div className={`question-bar ${result && !result.correct ? 'question-bar-incorrect' : ''}`}>
      <span className="question-number">Q{question.questionNumber}</span>
      <p className="question-text">{question.question}</p>
      <div className="options">
        {question.options.map((option, i) => (
          <div key={option} className={`option ${optionClass(option)}`}>
            <span className="option-letter">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}
