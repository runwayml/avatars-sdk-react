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

## Custom Avatars

In addition to the preset avatars, you can use your own custom avatars created in the [Runway Developer Portal](https://dev.runwayml.com/).

1. Create a custom avatar in the Developer Portal
2. Copy the avatar ID
3. Enter it in the "Custom Avatar" input on the example page
4. Click "Start Call"

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
