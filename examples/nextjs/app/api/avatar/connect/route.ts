import Runway from '@runwayml/sdk';

const runway = new Runway();

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const session = await runway.realtime.sessions.create({
    model: 'gen4_turbo',
    options: { avatar: avatarId },
  });

  return Response.json({
    sessionId: session.id,
    livekitUrl: session.livekit_url,
    token: session.token,
    roomName: session.room_name,
  });
}
