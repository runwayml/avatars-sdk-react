import Runway from '@runwayml/sdk';

const runway = new Runway();

export async function action({ request }: { request: Request }) {
  const { avatarId } = await request.json();

  // @ts-expect-error - SDK API may vary
  const session = await runway.realtime.sessions.create({
    model: 'calliope',
    options: { avatar: { type: 'runway-preset', presetId: avatarId } },
  });

  return Response.json({
    sessionId: session.id,
    serverUrl: session.url,
    token: session.token,
    roomName: session.room_name,
  });
}
