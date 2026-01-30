import Runway from '@runwayml/sdk';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  // Create a new realtime session
  const created = (await client.post('/v1/realtime_sessions', {
    body: {
      model: { model: 'calliope', avatar: { type: 'runway-preset', presetId: avatarId } },
    },
  })) as { id: string };

  // Poll until session is ready
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

  // Consume the session to get connection credentials
  const { url, token, roomName } = (await client.post(
    `/v1/realtime_sessions/${created.id}/consume`,
  )) as { url: string; token: string; roomName: string };

  return Response.json({
    sessionId: created.id,
    serverUrl: url,
    token,
    roomName,
  });
}
