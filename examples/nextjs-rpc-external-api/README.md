# External API Calling — Backend RPC Example

An AI avatar that calls **real external APIs** using **backend RPC tool calls**. Uses the ESPN public API as an example — ask about scores, standings, news, or league leaders and the avatar fetches live data and speaks the results.

## What it demonstrates

- **Backend RPC tools** — the avatar triggers server-side functions via `@runwayml/avatars-node-rpc`
- **Real external API calls** — each tool makes an HTTP request to the ESPN public API (not mock data)
- **Multiple tools** — four distinct tools the avatar can invoke depending on the question
- **Network latency** — demonstrates how external API round-trips affect avatar responsiveness

## Tools

| Tool | What it does |
|------|-------------|
| `get_scores` | Fetches current/recent game scores and matchups |
| `get_standings` | Fetches league standings by division/conference |
| `get_news` | Fetches the 3 latest news headlines |
| `get_leaders` | Fetches statistical leaders for a season |

## Quick start

```bash
npx degit runwayml/avatars-sdk-react/examples/nextjs-rpc-external-api my-api-app
cd my-api-app
cp .env.example .env.local
# Add your RUNWAYML_API_SECRET and NEXT_PUBLIC_AVATAR_ID

npm install
npm run dev
```

## Architecture

```
lib/personality.ts              (sports assistant persona)
lib/sports-api.ts               (ESPN API calls — real HTTP requests)
      │
      └── app/api/.../route.ts   (server: creates session + RPC handler)
      └── app/page.tsx           (client: AvatarCall + video + controls)
```
