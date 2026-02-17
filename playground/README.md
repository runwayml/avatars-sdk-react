# Avatar Playground

A public demo of the `@runwayml/avatars-react` SDK where users can try real-time AI avatars with their own API key.

## Features

- **Bring your own API key** - Users enter their Runway API key to try the SDK
- **Local storage** - API key is stored in browser localStorage (never sent to any server except Runway's API)
- **Preset avatars** - Try different avatar personalities
- **Custom avatars** - Use your own custom avatar IDs

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frunwayml%2Favatars-sdk-react%2Ftree%2Fmain%2Fplayground)

Or deploy manually:

```bash
cd playground
npm install
npm run build
```

## Local Development

```bash
cd playground
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## How It Works

1. User enters their Runway API key in the browser
2. Key is stored in localStorage for convenience
3. When starting a call, the key is sent to the API route
4. The API route creates a session using the user's key
5. Session credentials are returned to the client
6. The `AvatarCall` component connects to the avatar

## Security

- API keys are stored only in the user's browser (localStorage)
- Keys are sent via HTTPS POST body (not in URLs or headers)
- The server uses the key per-request and doesn't store it
- No server-side logging of API keys

## Get an API Key

Get your Runway API key from the [Runway Dashboard](https://app.runwayml.com/settings/api-keys).
