'use client';

export function ScreenShareVideo() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[@runwayml/avatars-react] ScreenShareVideo is not yet implemented in the core-based React SDK. Screen share publishing works via initialScreenStream prop, but rendering the shared content is pending.',
    );
  }
  return null;
}
