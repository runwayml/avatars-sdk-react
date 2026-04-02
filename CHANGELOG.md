# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Page actions** — let the avatar click buttons, scroll to sections, and highlight elements on your page
- `PageActions` component — drop-in component that subscribes to page-action client events and executes them against the DOM
- `usePageActions` hook — lower-level hook for custom composition
- `pageActionTools` — pre-built tool definitions for `click`, `scroll_to`, and `highlight`, ready to spread into `realtimeSessions.create({ tools })`
- `PageActionEvent` type exported from `@runwayml/avatars-react/api`
- Default highlight animation in `styles.css` via `[data-avatar-highlighted]` with `prefers-reduced-motion` support

### Changed

- Example dependencies now use the published `@runwayml/avatars-node-rpc` npm package instead of the GitHub source

## [0.11.0] - 2026-03-30

### Added

- Screen sharing indicator bar in `ControlBar` — shows "You're sharing your screen" with a quick Stop action when screen sharing is active
- Screen share active button now uses solid white background with dark icon (matching developer portal design)

### Fixed

- Production builds now start from a clean `dist/` directory, and the dev script seeds `dist/styles.css` before watch mode starts

## [0.10.0] - 2026-03-26

### Added

- **Client events** — fire-and-forget events from the avatar model via the LiveKit data channel
- `useClientEvent` hook — subscribe to a single event type by tool name, returns latest args as state with optional callback for side effects
- `useClientEvents` hook — subscribe to all client events (for event logs, debugging, catch-all routing)
- `clientTool` helper — define a single client tool, compose into arrays, derive event types with `ClientEventsFrom`
- `ClientEvent`, `ClientEventsFrom`, `ClientToolDef` types exported from `@runwayml/avatars-react/api` for server-safe imports
- `onClientEvent` prop on `AvatarCall` and `AvatarSession` for prop-based event handling
- `micError` / `cameraError` on `useLocalMedia` and `ControlBarState` — exposes the device error when `getUserMedia` fails
- `retryMic()` / `retryCamera()` on `useLocalMedia` and `ControlBarState` — re-attempt device acquisition after freeing the device
- `MediaDeviceErrors` type export
- Screen share toggle in `ControlBar` via `showScreenShare` prop — sends screen to the avatar without rendering the video in the UI
- Focus preservation when screen sharing — browser stays on the app tab instead of switching to the shared tab (Chrome 109+)
- Surface switching — users can change what they're sharing without stopping/restarting the share
- CSS custom properties `--avatar-control-bg-off` and `--avatar-control-color-off` for customizing toggled-off button appearance

### Fixed

- Fixed sessions failing to connect when another app (e.g. Zoom) holds the mic/camera — media acquisition is now decoupled from the WebRTC connection so the session always starts

### Changed

- Control button toggled-off state now uses a subtle dimmed style instead of red — less alarming for normal states like muted mic or camera off

## [0.9.0] - 2026-03-13

### Added

- `initialScreenStream` prop on `AvatarCall` and `AvatarSession` — pass a pre-captured `getDisplayMedia` stream to start screen sharing automatically once the session connects

## [0.8.0] - 2026-03-11

### Added

- `audio` and `video` props on `AvatarCall` to control whether mic/camera are requested on connect

### Fixed

- Denying camera permission no longer surfaces as a session error — the call continues with audio only

## [0.7.2] - 2026-02-20

### Fixed

- Fixed React Strict Mode breaking credential fetching — credentials are now cached at module level (similar to React Query) so they survive component unmount/remount cycles

### Changed

- Refactored `useCredentials` to use a new internal `useQuery` hook with `useSyncExternalStore` for proper React 18 concurrent rendering support

## [0.7.1] - 2026-02-20

### Fixed

- Fixed React Strict Mode breaking credential fetching — the `useCredentials` hook now properly resets its deduplication ref on cleanup, allowing the second render to fetch credentials

## [0.7.0] - 2026-02-10

### Changed

- **Breaking:** `AvatarCall` now renders a minimal loading UI during credential fetching instead of rendering children. This ensures hooks like `useLocalMedia` and `useAvatar` are always called within a valid LiveKit context. For custom loading UI, use `AvatarSession` directly.
- Device availability check is now non-blocking — calls connect immediately and check devices in background with 1s timeout
- Loading spinner is now centered relative to the full container, not affected by control bar position

### Fixed

- Fixed "No room provided" error when using `AvatarCall` — hooks are no longer called outside LiveKitRoom context
- Fixed duplicate `consumeSession` calls caused by unstable `connect` callback references or React StrictMode
- Fixed calls not starting when device check took too long or hung
- Added user placeholder icon for `UserVideo` when camera is unavailable
- `UserVideo` PIP is now hidden when camera is disabled (cleaner UI)

### Removed

- Removed `LoadingSessionProvider` (internal component, was not exported)

## [0.6.0] - 2026-02-10

### Changed

- **Breaking:** `AvatarCall` no longer uses React Suspense. Loading states are now handled internally for a seamless experience. Remove any `<Suspense>` wrappers around `AvatarCall`.

### Removed

- Removed Suspense-based credential fetching from `AvatarCall` — loading is now handled internally
- Removed `suspense-resource.ts` utility (no longer needed)

### Fixed

- Fixed "Requested device not found" error when connecting or toggling mic/camera on devices without those peripherals
- Fixed awkward loading state gap between Suspense resolution and video becoming ready
- Added default loading spinner to AvatarVideo during connecting/waiting states
- Fixed loading spinner positioning — now properly centered with absolute positioning
- Fixed hooks (`useLocalMedia`, `useAvatar`) crashing when called outside LiveKitRoom context during credential loading

## [0.5.0] - 2026-02-10

### Changed

- **Breaking:** All data attributes are now namespaced with `avatar-` prefix to prevent conflicts with other libraries:
  - `data-status` → `data-avatar-status`
  - `data-active` → `data-avatar-active`
  - `data-control` → `data-avatar-control`
  - `data-enabled` → `data-avatar-enabled`
  - `data-has-video` → `data-avatar-has-video`
  - `data-camera-enabled` → `data-avatar-camera-enabled`
  - `data-mirror` → `data-avatar-mirror`
  - `data-sharing` → `data-avatar-sharing`
- Added new marker attributes: `data-avatar-video`, `data-avatar-user-video`, `data-avatar-control-bar`, `data-avatar-screen-share`
- CSS custom properties are now scoped to `[data-avatar-call]` instead of `:root` to prevent global namespace pollution
- Default styles now use `isolation: isolate` to create a proper stacking context and prevent z-index conflicts

### Fixed

- Fixed z-index issue where blurred background could overlay the video when embedded in external websites
- Added missing `data-avatar-enabled` attribute to screen-share and end-call control buttons
- Added missing `toggleScreenShare` function to ControlBar render prop state
- Blurred background now fades out smoothly when video becomes ready

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
