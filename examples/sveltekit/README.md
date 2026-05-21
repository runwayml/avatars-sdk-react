# SvelteKit example

An avatar call using `@runwayml/avatars` with SvelteKit — demonstrating the core SDK works with any framework.

Installs **`@runwayml/avatars@0.16.0`** from npm. See [Core SDK docs](https://docs.dev.runwayml.com/characters/core-sdk/) for integration patterns.

## Setup

```bash
cp .env.example .env
# Add your Runway API secret

bun install
bun run dev
```

## Files

- **`src/routes/+page.svelte`** — Single component with `streamTo`, mic toggle, and end call.
- **`src/routes/api/avatar/connect/+server.ts`** — SvelteKit server endpoint that creates a session.
- **`vite.config.ts`** — Standard SvelteKit Vite config.
