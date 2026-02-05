# Next.js Avatar Example

This example shows how to use `@runwayml/avatars-react` with [Next.js](https://nextjs.org/) App Router.

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/runwayml/avatars-sdk-react/tree/main/examples/nextjs avatar-app
```

```bash
yarn create next-app --example https://github.com/runwayml/avatars-sdk-react/tree/main/examples/nextjs avatar-app
```

```bash
pnpm create next-app --example https://github.com/runwayml/avatars-sdk-react/tree/main/examples/nextjs avatar-app
```

## Configuration

Copy the example environment file and add your Runway API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your key from [dev.runwayml.com](https://dev.runwayml.com/).

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to the avatar page.

## Custom Avatars

In addition to the preset avatars, you can use your own custom avatars created in the [Runway Developer Portal](https://dev.runwayml.com/).

1. Create a custom avatar in the Developer Portal
2. Copy the avatar ID
3. Enter it in the "Custom Avatar" input on the example page
4. Click "Start Call"

The API route automatically handles both preset and custom avatar types.

## Learn More

- [Runway Avatar SDK Documentation](https://github.com/runwayml/avatars-sdk-react)
- [Next.js Documentation](https://nextjs.org/docs)
