# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-02-09

### Fixed

- `configure()` from `@runwayml/avatars-react/api` had no effect on `AvatarCall` due to separate bundles having their own config state. Replaced with a `baseUrl` prop on `AvatarCall` for explicit API URL configuration.

### Removed

- **Breaking:** Removed `configure()`, `getConfig()`, `resetConfig()`, and `ApiConfig` exports from `@runwayml/avatars-react/api`. Use the `baseUrl` prop on `AvatarCall` instead.

## [0.3.0] - 2026-02-06

### Added

- `useAvatarStatus` hook — returns a discriminated union (`AvatarStatus`) representing the full avatar lifecycle inside a session (`connecting`, `waiting`, `ready`, `ending`, `ended`, `error`)
- `AvatarVideoStatus` type — discriminated union for the `AvatarVideo` render prop
- Suspense support in `AvatarCall` — suspends during credential fetching so consumers can wrap in `<Suspense>` for loading UI
- `sessionId` and `sessionKey` props on `AvatarCall` for client-side session consumption (calls `consumeSession` internally)
- `VideoTrack` re-exported from the package for custom render prop usage
- Loading states guide (`docs/guides/loading-states.md`)
- `npx degit` scaffolding instructions in README and examples

### Changed

- **Breaking:** `AvatarVideo` render prop now receives an `AvatarVideoStatus` discriminated union (`connecting` | `waiting` | `ready`) instead of `{ hasVideo, isConnecting, trackRef }`
- **Breaking:** `AvatarVideo` data attributes changed from `data-has-video` / `data-connecting` to `data-status="connecting|waiting|ready"`
- **Breaking:** `AvatarCall` no longer emits `data-state` or `data-error` attributes (use Suspense error boundaries instead)
- Default API base URL changed from `https://api.dev.runwayml.com` to `https://api.runwayml.com`
- Examples refactored: servers return `{ sessionId, sessionKey }`, clients pass these to `AvatarCall` with `<Suspense>` boundaries
- Next.js Server Actions example restructured with Server Component page and separate client component

### Removed

- `data-state` and `data-error` data attributes from `AvatarCall`
- `data-has-video` and `data-connecting` data attributes from `AvatarVideo` (replaced by `data-status`)

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
