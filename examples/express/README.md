# Express Avatar Example

This example shows how to use `@runwayml/avatars-react` with [Express](https://expressjs.com/) and [Vite](https://vitejs.dev/).

## How to use

```bash
npx degit runwayml/avatars-sdk-react/examples/express my-avatar-app
cd my-avatar-app
npm install
```

## Configuration

Copy the example environment file and add your API secret:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials.

## Running locally

Development mode (with hot reload):

```bash
npm run dev
```

This runs both Vite dev server (port 5173) and Express API server (port 3000) concurrently.

Open [http://localhost:5173](http://localhost:5173).

## Production

Build and run:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Custom Avatars

In addition to the preset avatars, you can use your own custom avatars created in the [Runway Developer Portal](https://dev.runwayml.com/).

1. Create a custom avatar in the Developer Portal
2. Copy the avatar ID
3. Enter it in the "Custom Avatar" input on the example page
4. Click "Start Call"

## Project structure

```
├── server.ts          # Express API server
├── index.html         # HTML entry point
├── vite.config.ts     # Vite configuration
└── src/
    ├── main.tsx       # React entry point
    └── App.tsx        # Avatar call component
```

## Learn More

- [Runway Avatar SDK Documentation](https://github.com/runwayml/avatars-sdk-react)
- [Express Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
