# Express + Vite Example

Uses Express for the API server and Vite for the React frontend.

## Quick Start

```bash
npx degit runwayml/avatars-sdk-react/examples/express my-avatar-app
cd my-avatar-app
npm install
cp .env.example .env
npm run dev
```

Add your Runway API secret to `.env` from [dev.runwayml.com](https://dev.runwayml.com/).

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
├── server.ts      # Express API server
├── src/App.tsx    # React avatar component
└── vite.config.ts # Vite configuration
```

## Learn More

- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
- [Express](https://expressjs.com/)
- [Vite](https://vitejs.dev/)
