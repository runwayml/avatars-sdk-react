import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Runway from '@runwayml/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

app.post('/api/avatar/connect', async (req, res) => {
  try {
    const { avatarId, customAvatarId } = req.body;

    const avatar = customAvatarId
      ? { type: 'custom' as const, avatarId: customAvatarId }
      : { type: 'runway-preset' as const, presetId: avatarId };

    const { id: sessionId } = await client.realtimeSessions.create({
      model: 'gwm1_avatars',
      avatar,
    });

    const TIMEOUT_MS = 30_000;
    const POLL_INTERVAL_MS = 1_000;
    const deadline = Date.now() + TIMEOUT_MS;

    while (Date.now() < deadline) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      if (session.status === 'READY') {
        res.json({ sessionId, sessionKey: session.sessionKey });
        return;
      }

      if (session.status === 'COMPLETED' || session.status === 'FAILED' || session.status === 'CANCELLED') {
        throw new Error(`Session ${session.status.toLowerCase()} before becoming ready`);
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error('Session creation timed out');
  } catch (error) {
    console.error('Failed to create avatar session:', error);
    res.status(500).json({ error: 'Failed to create avatar session' });
  }
});

app.get('/{*path}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
