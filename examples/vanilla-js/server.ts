import Runway from '@runwayml/sdk';
import express from 'express';

const app = express();
const runway = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

app.use(express.json());

app.post('/api/avatar/connect', async (req, res) => {
  try {
    const { id: sessionId } = await runway.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar: { type: 'runway-preset', presetId: req.body.avatarId },
    });

    const session = await pollUntilReady(sessionId);
    res.json({ sessionId, sessionKey: session.sessionKey });
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

async function pollUntilReady(sessionId: string) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const session = await runway.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') return session;
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(session.status)) {
      throw new Error(`Session ${session.status.toLowerCase()}`);
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error('Session timed out');
}

app.listen(3000, () => console.log('http://localhost:3000'));
