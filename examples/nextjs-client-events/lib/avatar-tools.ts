import { clientTool, type ClientEventsFrom } from '@runwayml/avatars-react/api';
import type { RealtimeSessionCreateParams } from '@runwayml/sdk/resources/realtime-sessions';
import { z } from 'zod';

export const nextStep = clientTool('next_step', {
  description:
    'Advance the trivia game. The host reads only the question field aloud to the player; options are for on-screen UI only. Always include the next question. After the first question, also include the result of the previous question and the updated score.',
  schema: z.object({
    question: z.string(),
    options: z.array(z.string()),
    questionNumber: z.number(),
    score: z.number(),
    previousCorrect: z.boolean().optional(),
    previousCorrectAnswer: z.string().optional(),
    sound: z.enum(['correct', 'incorrect']).optional(),
  }),
});

export type TriviaEvent = ClientEventsFrom<[typeof nextStep]>;

// The Zod `schema` above drives client-side type inference and runtime
// validation of incoming events. The `parameters` array below is the
// model-facing tool spec the avatar uses to decide how to populate args —
// the Runway session API needs it explicitly, so keep the two shapes in sync.
export const clientEventTools: RealtimeSessionCreateParams['tools'] = [
  {
    ...nextStep,
    parameters: [
      {
        name: 'question',
        type: 'string',
        description: 'The next trivia question text',
      },
      {
        name: 'options',
        type: 'array',
        items: { type: 'string' },
        description:
          'Exactly 4 multiple choice strings for the UI only. Never read these aloud — only the question field is spoken.',
      },
      {
        name: 'questionNumber',
        type: 'number',
        description: 'The question number (1-based)',
      },
      {
        name: 'score',
        type: 'number',
        description: 'Total correct answers so far',
      },
      {
        name: 'previousCorrect',
        type: 'boolean',
        description: 'Whether the previous answer was correct (omit for first question)',
      },
      {
        name: 'previousCorrectAnswer',
        type: 'string',
        description: 'The correct answer to the previous question (omit for first question)',
      },
      {
        name: 'sound',
        type: 'string',
        description: 'Sound to play: correct or incorrect (omit for first question)',
      },
    ],
  },
];
