import Runway from '@runwayml/sdk';
import express from 'express';
import { pollUntilReady } from '../../packages/core/src/api/poll';

const app = express();
const runway = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

app.use(express.json());

app.post('/api/avatar/connect', async (req, res) => {
  try {
    const { id: sessionId } = await runway.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: req.body.avatarId },
    });

    const credentials = await pollUntilReady({
      sessionId,
      apiKey: process.env.RUNWAYML_API_SECRET!,
    });

    res.json(credentials);
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));
