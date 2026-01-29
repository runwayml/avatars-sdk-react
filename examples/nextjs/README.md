# Next.js Avatar Example

Minimal example of using `@runwayml/avatar-react` with Next.js App Router.

## Setup

1. Install dependencies:

```bash
npm install @runwayml/avatar-react @runwayml/sdk
```

2. Set your API key:

```bash
export RUNWAY_API_KEY=your_api_key
```

3. Copy the files from this example into your Next.js project:
   - `app/api/avatar/connect/route.ts` - Server endpoint
   - `app/avatar/page.tsx` - Client page

4. Visit `/avatar` in your browser.

## Files

```
app/
├── api/avatar/connect/
│   └── route.ts      # Creates avatar session (server-side)
└── avatar/
    └── page.tsx      # Avatar call UI (client-side)
```
