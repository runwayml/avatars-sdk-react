# Contributing

## Repository Structure

This is a monorepo with two packages:

```
packages/
  core/    → @runwayml/avatars (framework-agnostic)
  react/   → @runwayml/avatars-react (React components and hooks)
```

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/runwayml/avatars-sdk-react.git
cd avatars-sdk-react
```

2. Install dependencies:

```bash
bun install
```

3. Build the core (needed for react package to resolve types):

```bash
cd packages/core && bun run build
```

4. Start development mode (either package):

```bash
cd packages/core && bun run dev
cd packages/react && bun run dev
```

## Commands

From the repository root:

```bash
bun run build      # Build both packages
bun run typecheck  # Type check both packages
bun run lint       # Run linter (Biome)
bun test           # Run all tests
bun run clean      # Remove dist/ from both packages
```

From an individual package:

```bash
cd packages/core   # or packages/react
bun run build      # Build this package
bun run typecheck  # Type check this package
bun run dev        # Watch mode
bun test           # Run this package's tests
```

## Portless (optional)

All `dev` scripts auto-detect [Portless](https://port1355.dev/) and use it when available. This gives you stable named URLs (e.g. `avatar-playground.localhost:1355`) instead of port numbers — especially useful for WebRTC apps since browsers remember camera/microphone permissions per origin.

```bash
npm i -g portless
bun run dev  # automatically uses portless if installed
```

To disable portless temporarily, set `PORTLESS=0`.

## Code Style

- We use [Biome](https://biomejs.dev/) for linting and formatting
- TypeScript strict mode is enabled
- Prefer functional patterns over classes
- Components use render props for customization

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `bun run lint` to verify linting
5. Run `bun test` to verify tests pass
6. Commit your changes with a descriptive message
7. Push to your fork and open a pull request

## Releasing

This project follows [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/). Both packages are versioned together.

1. Add your changes under `## [Unreleased]` in `CHANGELOG.md` as you go
2. When ready to release, choose the appropriate version bump:
   - **patch** (0.0.x) — bug fixes, non-breaking additions like type improvements
   - **minor** (0.x.0) — new features, non-breaking changes
   - **major** (x.0.0) — breaking changes
3. Move the Unreleased entries into a new version section with today's date
4. Update the `version` field in both `packages/core/package.json` and `packages/react/package.json`
5. Commit and push:

```bash
git add CHANGELOG.md packages/*/package.json
git commit -m "chore: release vX.Y.Z"
git push origin main
```

6. Create a GitHub release (this triggers the NPM publish workflow):

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "<release notes>"
```

The `Publish` workflow will automatically build and publish both packages to NPM.

## Reporting Issues

Please use [GitHub Issues](https://github.com/runwayml/avatars-sdk-react/issues) to report bugs or request features.
