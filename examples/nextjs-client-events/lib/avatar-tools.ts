/**
 * Trivia show tool definitions — shared between server and client.
 *
 * The avatar hosts a trivia game. It asks questions, judges answers,
 * and triggers UI events like showing the question, revealing the answer,
 * updating the score, and playing sound effects.
 */

import { defineClientTools } from '@runwayml/avatars-react/api';

export const triviaTools = defineClientTools({
  show_question: {
    description: 'Display a trivia question on screen with 4 multiple choice options',
    args: {} as {
      question: string;
      options: Array<string>;
      questionNumber: number;
    },
  },
  reveal_answer: {
    description: 'Reveal whether the player answered correctly or incorrectly. Always include userAnswer with the option text the player chose.',
    args: {} as {
      correct: boolean;
      correctAnswer: string;
      userAnswer?: string;
      explanation?: string;
    },
  },
  update_score: {
    description: 'Update the player score display',
    args: {} as {
      score: number;
      streak: number;
    },
  },
  play_sound: {
    description: 'Play a sound effect for correct/incorrect answers or dramatic moments',
    args: {} as {
      sound: 'correct' | 'incorrect' | 'drumroll' | 'applause' | 'buzzer';
    },
  },
});

export type TriviaEvent = typeof triviaTools.Events;
