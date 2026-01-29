/**
 * Example proxy server for testing the widget
 *
 * This server handles session creation to avoid CORS issues.
 * In production, you would implement this on your own backend.
 *
 * Usage:
 *   RUNWAY_API_KEY=your_key node examples/server.js
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3456;

const API_KEY = process.env.RUNWAY_API_KEY;
const BASE_URL = process.env.RUNWAY_API_URL || 'https://api.runwayml.com';

app.use(cors());
app.use(express.json());

// Serve static files from project root
app.use(express.static(join(__dirname, '..'), {
  extensions: ['html', 'htm']
}));

// Proxy endpoint to create session
app.post('/api/sessions', async (req, res) => {
  try {
    const { avatar, duration = 60 } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured. Set RUNWAY_API_KEY environment variable.' });
    }

    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    };

    // Step 1: Create session
    const createResponse = await fetch(`${BASE_URL}/v1/realtime_sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: {
          model: 'gen4',
          avatar,
        },
        duration,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      return res.status(createResponse.status).json({ error: errorText });
    }

    const { id: sessionId } = await createResponse.json();

    // Step 2: Poll until READY
    let status;
    let attempts = 0;
    const maxAttempts = 60;

    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const statusResponse = await fetch(`${BASE_URL}/v1/realtime_sessions/${sessionId}`, {
        headers,
      });

      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({ error: 'Failed to get session status' });
      }

      status = await statusResponse.json();

      if (status.status === 'FAILED') {
        return res.status(500).json({
          error: `Session failed: ${status.failure || 'Unknown error'}`
        });
      }

      if (status.status === 'CANCELLED') {
        return res.status(500).json({ error: 'Session was cancelled' });
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({ error: 'Session creation timed out' });
      }
    } while (status.status === 'NOT_READY');

    // Step 3: Consume to get credentials
    const consumeResponse = await fetch(`${BASE_URL}/v1/realtime_sessions/${sessionId}/consume`, {
      method: 'POST',
      headers,
    });

    if (!consumeResponse.ok) {
      const errorText = await consumeResponse.text();
      return res.status(consumeResponse.status).json({ error: errorText });
    }

    const credentials = await consumeResponse.json();

    res.json({
      sessionId: credentials.sessionId,
      livekitUrl: credentials.url,
      token: credentials.token,
      roomName: credentials.roomName,
    });
  } catch (error) {
    console.error('Session creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test page: http://localhost:${PORT}/examples/widget-test.html`);
  if (!API_KEY) {
    console.log('\nWARNING: RUNWAY_API_KEY not set. Set it before testing.');
  }
});
