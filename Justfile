# Run `just` or `just --list` to see recipes. Requires https://github.com/casey/just

default:
    @just --list

build:
    bun run build

clean:
    bun run clean

dev:
    bun run dev

test:
    bun test

lint:
    bun run lint

lint-fix:
    bun run lint:fix

format:
    bun run format

check:
    bun run check

typecheck:
    bun run typecheck

verify: typecheck lint test build

example-link:
    bun run example:link

# Builds, links the SDK, then runs examples/react-router (see also dev-react-router).
example-dev:
    bun run example:dev

playground-dev:
    bun run playground:dev

# Examples — build the SDK first, then `cd` into examples/<name> and start the dev server (run `bun install` in that folder first if needed).

dev-express: build
    cd examples/express && bun run dev

dev-nextjs: build
    cd examples/nextjs && bun run dev

dev-nextjs-client-events: build
    cd examples/nextjs-client-events && bun run dev

dev-nextjs-rpc: build
    cd examples/nextjs-rpc && bun run dev

dev-nextjs-rpc-external-api: build
    cd examples/nextjs-rpc-external-api && bun run dev

dev-nextjs-rpc-weather: build
    cd examples/nextjs-rpc-weather && bun run dev

dev-nextjs-server-actions: build
    cd examples/nextjs-server-actions && bun run dev

dev-nextjs-simple: build
    cd examples/nextjs-simple && bun run dev

dev-subtitles: build
    cd examples/subtitles && bun run dev

dev-react-router: build
    cd examples/react-router && bun run dev
