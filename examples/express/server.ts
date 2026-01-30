import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Runway from '@runwayml/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const runway = new Runway();

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

app.post('/api/avatar/connect', async (req, res) => {
  const { avatarId } = req.body;

  // TODO: Update to actual Runway SDK API once available
  // @ts-expect-error - SDK API may vary
  const session = await runway.realtime.sessions.create({
    model: 'gen4_turbo',
    options: { avatar: avatarId },
  });

  res.json({
    sessionId: session.id,
    serverUrl: session.url,
    token: session.token,
    roomName: session.room_name,
  });
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
