# Express Avatar Example

This example shows how to use `@runwayml/avatars-react` with [Express](https://expressjs.com/) and [Vite](https://vitejs.dev/).

## How to use

Clone and copy the example:

```bash
git clone https://github.com/runwayml/avatars-sdk-react.git
cd avatars-sdk-react/examples/express
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
