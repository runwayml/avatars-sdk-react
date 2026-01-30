# React Router Avatar Example

This example shows how to use `@runwayml/avatar-react` with [React Router](https://reactrouter.com/) v7 framework mode.

## How to use

Clone and copy the example:

```bash
git clone https://github.com/runwayml/avatar-sdk-react.git
cd avatar-sdk-react/examples/react-router
npm install
```

## Configuration

Set your Runway API key as an environment variable:

```bash
export RUNWAY_API_KEY=your_api_key
```

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

- [Runway Avatar SDK Documentation](https://github.com/runwayml/avatar-sdk-react)
- [React Router Documentation](https://reactrouter.com/)
