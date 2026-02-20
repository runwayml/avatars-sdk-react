# React Router v7 Example

Uses React Router v7 framework mode with file-based routing.

## Quick Start

```bash
npx degit runwayml/avatars-sdk-react/examples/react-router my-avatar-app
cd my-avatar-app
npm install
cp .env.example .env
npm run dev
```

Add your Runway API secret to `.env` from [dev.runwayml.com](https://dev.runwayml.com/).

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
app/
├── routes.ts                 # Route configuration
└── routes/
    ├── avatar.tsx            # Avatar call page
    └── api.avatar.connect.ts # API action for session creation
```

## Learn More

- [Runway Avatar SDK](https://github.com/runwayml/avatars-sdk-react)
- [React Router](https://reactrouter.com/)
