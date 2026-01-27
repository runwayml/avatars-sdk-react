# React Router Avatar Example

This example shows how to use `@runwayml/avatars-react` with [React Router](https://reactrouter.com/) v7 framework mode.

## How to use

Clone and copy the example:

```bash
git clone https://github.com/runwayml/avatars-sdk-react.git
cd avatars-sdk-react/examples/react-router
npm install
```

## Configuration

Copy the example environment file and add your API secret:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials.

## Running locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and navigate to the avatar page.

## Project structure

```
app/
├── root.tsx                  # Root layout
├── routes.ts                 # Route configuration
└── routes/
    ├── home.tsx              # Home page
    ├── avatar.tsx            # Avatar call page
    └── api.avatar.connect.ts # API action for session creation
```

## Learn More

- [Runway Avatar SDK Documentation](https://github.com/runwayml/avatars-sdk-react)
- [React Router Documentation](https://reactrouter.com/)
