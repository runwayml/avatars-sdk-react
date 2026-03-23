export const PRESET_AVATAR_METADATA: Record<
  string,
  { name: string; imageUrl: string }
> = {
  'cat-character': {
    name: 'Mochi',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/InApp_Avatar_4_input.png',
  },
  'music-superstar': {
    name: 'Mina',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/InApp_Avatar_2.png',
  },
  'fashion-designer': {
    name: 'Sofia',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-Avatar-3_input.png',
  },
  'cooking-teacher': {
    name: 'Marco',
    imageUrl:
      'https://runway-static-assets.s3.us-east-1.amazonaws.com/calliope-demo/presets-3-3/Dev-Avatar-4.png',
  },
};

export function getPresetAvatarMetadata(id: string) {
  return PRESET_AVATAR_METADATA[id];
}
