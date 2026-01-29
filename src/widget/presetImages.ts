/**
 * Preset Avatar Images
 *
 * Hardcoded image URLs for Runway preset avatars.
 * These are used as the launcher bubble image when a presetId is specified.
 */

export const PRESET_IMAGES: Record<string, string> = {
  // Add preset images here as needed
};

/**
 * Get the image URL for a preset avatar
 */
export function getPresetImage(presetId: string): string | undefined {
  return PRESET_IMAGES[presetId];
}
