# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-02-05

### Added

- `typesVersions` field in package.json for legacy TypeScript `"moduleResolution": "node"` support of the `/api` subpath export

## [0.2.1] - 2026-02-05

### Changed

- Default room options now use `adaptiveStream: false` and `dynacast: false` for full resolution video

### Added

- Internal `__unstable_roomOptions` prop for advanced LiveKit room configuration (not part of public API)

## [0.2.0] - 2026-02-05

### Changed

- Updated `livekit-client` to ^2.17.0 and `@livekit/components-react` to ^2.9.19
- Simplified `useAvatar` hook - audio is now handled automatically by the session
- Improved audio/video synchronization with optimized track subscription options

### Removed

- **Breaking:** Removed `audioTrackRef`, `hasAudio`, and `isSpeaking` from `useAvatar` return type (audio is handled automatically by `AvatarSession`)
- **Breaking:** Removed `isSpeaking` from `AvatarVideoState` render prop

## [0.1.0] - 2026-02-03

### Added

- Initial release
- React components for avatar sessions (`AvatarCall`, `AvatarSession`, `AvatarVideo`, `UserVideo`, `ScreenShareVideo`, `ControlBar`)
- Hooks for session and media control (`useAvatar`, `useAvatarSession`, `useLocalMedia`)
- API utilities (`@runwayml/avatars-react/api`)
- Optional default styles (`@runwayml/avatars-react/styles.css`)
