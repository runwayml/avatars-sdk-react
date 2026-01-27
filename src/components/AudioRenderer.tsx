'use client';

/**
 * AudioRenderer Component
 *
 * Re-exports LiveKit's RoomAudioRenderer for convenience.
 * This component handles audio playback for all participants in the room.
 *
 * Note: AudioRenderer is already included in AvatarSession,
 * so you typically don't need to use this directly.
 *
 * @example
 * ```tsx
 * // Only use if building custom session management
 * <AudioRenderer />
 * ```
 */

export { RoomAudioRenderer as AudioRenderer } from '@livekit/components-react';
