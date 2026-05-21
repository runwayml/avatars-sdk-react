# Vanilla JS example

An avatar call using `@runwayml/avatars` — no React, no framework.

Client code lives in `index.html` as an inline `<script type="module">`. The example installs `@runwayml/avatars` from npm (currently **0.16.0**).

For a zero-build setup, you can load the package from a CDN instead:

```html
<script type="module">
  import { streamTo } from 'https://esm.sh/@runwayml/avatars@0.16.0';
  // ...
</script>
```

## Setup

```bash
cp .env.example .env
# Add your Runway API secret to .env

bun install
bun run dev
# Vite opens at http://localhost:5173, API proxied to Express on :3000
```

## Files

- **`index.html`** — Markup and client script. The entire SDK integration is ~20 lines.
- **`styles.css`** — Minimal dark theme.
- **`server.ts`** — Express server that creates a realtime session and returns `{ sessionId, sessionKey }`.
- **`vite.config.ts`** — Dev server and API proxy to the Express backend.
