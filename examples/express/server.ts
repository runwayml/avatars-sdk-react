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
    const { avatarId } = req.body;

    const created = (await client.post('/v1/realtime_sessions', {
      body: {
        model: { model: 'calliope', avatar: { type: 'runway-preset', presetId: avatarId } },
      },
    })) as { id: string };

    let status = 'PENDING';
    while (status === 'PENDING') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const session = (await client.get(
        `/v1/realtime_sessions/${created.id}`,
      )) as { status: string };
      status = session.status;

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
        throw new Error(`Session ${status.toLowerCase()} before becoming ready`);
      }
    }

    const { url, token, roomName } = (await client.post(
      `/v1/realtime_sessions/${created.id}/consume`,
    )) as { url: string; token: string; roomName: string };

    res.json({
      sessionId: created.id,
      serverUrl: url,
      token,
      roomName,
    });
  } catch (error) {
    console.error('Failed to create avatar session:', error);
    res.status(500).json({ error: 'Failed to create avatar session' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
