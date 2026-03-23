import Runway from '@runwayml/sdk';
import { getPresetAvatarMetadata } from '../../../../lib/preset-avatars';

const client = new Runway({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const preset = getPresetAvatarMetadata(id);
  if (preset) {
    return Response.json({
      id,
      name: preset.name,
      imageUrl: preset.imageUrl,
      status: 'READY',
    });
  }

  try {
    const avatar = await client.avatars.retrieve(id);

    return Response.json({
      id: avatar.id,
      name: avatar.name,
      imageUrl: avatar.processedImageUri ?? avatar.referenceImageUri,
      status: avatar.status,
    });
  } catch (error) {
    if (error instanceof Runway.NotFoundError) {
      return Response.json({ error: 'Avatar not found' }, { status: 404 });
    }
    throw error;
  }
}
