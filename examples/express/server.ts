import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Runway from '@runwayml/sdk';
import { consumeSession } from '@runwayml/avatars-react/api';
import { RunwayRealtime } from './runway-realtime';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });
const realtime = new RunwayRealtime(client);

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

app.post('/api/avatar/connect', async (req, res) => {
  try {
    const { avatarId, customAvatarId } = req.body;

    const avatar = customAvatarId
      ? { type: 'custom' as const, customId: customAvatarId }
      : { type: 'runway-preset' as const, presetId: avatarId };

    const { id: sessionId } = await realtime.create({
      model: 'gwm1_avatars',
      avatar,
    });

    const { sessionKey } = await realtime.waitForReady(sessionId);
    const { url, token, roomName } = await consumeSession({ sessionId, sessionKey });

    res.json({
      sessionId,
      serverUrl: url,
      token,
      roomName,
    });
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
