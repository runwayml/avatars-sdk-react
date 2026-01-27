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

## Reporting Issues

Please use [GitHub Issues](https://github.com/runwayml/avatars-sdk-react/issues) to report bugs or request features.
