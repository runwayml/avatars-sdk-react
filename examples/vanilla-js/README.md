# Vanilla JS example

An avatar call using `@runwayml/avatars` -- no React, no framework.

Client code lives in `index.html` as an inline `<script type="module">`.
When `@runwayml/avatars` is published to npm, swap the import to
`https://esm.sh/@runwayml/avatars` and drop Vite entirely.

## Setup

```bash
cp .env.example .env
# Add your Runway API secret to .env

bun install
bun run dev
# Vite opens at http://localhost:5173, API proxied to Express on :3000
```

## Files

- **`index.html`** -- Markup and client script. The entire SDK integration is ~20 lines.
- **`styles.css`** -- Minimal dark theme.
- **`server.ts`** -- Express server that creates a realtime session and returns `{ sessionId, sessionKey }`.
- **`vite.config.ts`** -- Aliases `@runwayml/avatars` to the local SDK source. Remove once the package is on npm.
