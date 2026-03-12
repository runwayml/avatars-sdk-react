# Contributing

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

3. Start development mode:

```bash
bun run dev
```

## Commands

```bash
bun run dev        # Watch mode for development
bun run build      # Build the package
bun run typecheck  # TypeScript type checking
bun run lint       # Run linter (Biome)
bun run lint:fix   # Fix linting issues
bun run format     # Format code
bun test           # Run tests
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
4. Run `bun run check` to verify linting and formatting
5. Run `bun test` to verify tests pass
6. Commit your changes with a descriptive message
7. Push to your fork and open a pull request

## Releasing

This project follows [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/).

1. Add your changes under `## [Unreleased]` in `CHANGELOG.md` as you go
2. When ready to release, choose the appropriate version bump:
   - **patch** (0.0.x) — bug fixes, non-breaking additions like type improvements
   - **minor** (0.x.0) — new features, non-breaking changes
   - **major** (x.0.0) — breaking changes
3. Move the Unreleased entries into a new version section with today's date
4. Update the `version` field in `package.json`
5. Commit and push:

```bash
git add CHANGELOG.md package.json
git commit -m "chore: release vX.Y.Z"
git push origin main
```

6. Create a GitHub release (this triggers the NPM publish workflow):

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "<release notes>"
```

The `Publish` workflow will automatically build and publish the package to NPM.

## Reporting Issues

Please use [GitHub Issues](https://github.com/runwayml/avatars-sdk-react/issues) to report bugs or request features.
