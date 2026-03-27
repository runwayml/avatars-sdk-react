import {
  clientTool,
  clientToolParam,
  type ClientEventsFrom,
} from '@runwayml/avatars-react/api';

export const nextStep = clientTool('next_step', {
  description:
    'Advance the trivia game. Always include the next question. After the first question, also include the result of the previous question and the updated score.',
  parameters: {
    question: clientToolParam.string('The next trivia question text'),
    options: clientToolParam.array(
      clientToolParam.string(),
      'Exactly 4 multiple choice option strings',
    ),
    questionNumber: clientToolParam.number(
      'The question number (1-based)',
    ),
    score: clientToolParam.number('Total correct answers so far'),
    previousCorrect: clientToolParam.boolean(
      'Whether the previous answer was correct (omit for first question)',
      { optional: true },
    ),
    previousCorrectAnswer: clientToolParam.string(
      'The correct answer to the previous question (omit for first question)',
      { optional: true },
    ),
    sound: clientToolParam.string<'correct' | 'incorrect'>(
      'Sound to play: correct or incorrect (omit for first question)',
      { optional: true },
    ),
  },
});

export const clientEventTools = [nextStep] as const;

export type TriviaEvent = ClientEventsFrom<typeof clientEventTools>;

export const backendRpcTools = [
  {
    type: 'backend_rpc' as const,
    name: 'lookup_trivia',
    description:
      'Look up a trivia question from the database. Returns a question with options and the correct answer. Call this every time you need a new question — do NOT make up your own.',
    parameters: [
      {
        name: 'category',
        type: 'string',
        description:
          'Optional category filter: science, history, geography, art, technology',
      },
    ],
    timeoutSeconds: 8,
  },
];
