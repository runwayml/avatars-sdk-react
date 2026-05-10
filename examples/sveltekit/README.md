# SvelteKit example

An avatar call using `@runwayml/avatars` with SvelteKit — demonstrating the core SDK works with any framework.

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
- **`vite.config.ts`** — Aliases `@runwayml/avatars` to the local core source.
