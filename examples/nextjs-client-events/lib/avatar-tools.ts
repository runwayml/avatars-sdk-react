import { clientTool, type ClientEventsFrom } from '@runwayml/avatars-react/api';

export const showQuestion = clientTool('show_question', {
  description: 'Display a trivia question on screen with 4 multiple choice options',
  args: {} as {
    question: string;
    options: Array<string>;
    questionNumber: number;
  },
});

export const revealAnswer = clientTool('reveal_answer', {
  description: 'Reveal whether the player answered correctly or incorrectly. Always include userAnswer with the option text the player chose.',
  args: {} as {
    correct: boolean;
    correctAnswer: string;
    userAnswer?: string;
    explanation?: string;
  },
});

export const updateScore = clientTool('update_score', {
  description: 'Update the player score display',
  args: {} as {
    score: number;
    streak: number;
  },
});

export const playSound = clientTool('play_sound', {
  description: 'Play a sound effect for correct/incorrect answers or dramatic moments',
  args: {} as {
    sound: 'correct' | 'incorrect' | 'drumroll' | 'applause' | 'buzzer';
  },
});

export const triviaTools = [showQuestion, revealAnswer, updateScore, playSound];

export type TriviaEvent = ClientEventsFrom<typeof triviaTools>;
