# Run `just` or `just --list` to see recipes. Requires https://github.com/casey/just

default:
    @just --list

# Build
build: build-core build-react
build-core:
    cd packages/core && bun run build
build-react: build-core
    cd packages/react && bun run build
clean:
    rm -rf packages/*/dist

# Test
test:
    bun test packages/
typecheck: build-core
    cd packages/core && bun run typecheck
    cd packages/react && bun run typecheck
lint:
    bun run lint
verify: typecheck lint test build

# Dev (packages)
dev-core:
    cd packages/core && bun run dev
dev-react: build-core
    cd packages/react && bun run dev

# Link workspace packages for local example development (run once per clone if needed)
link-packages:
    cd packages/core && bun link
    cd packages/react && bun link

playground: build link-packages
    cd playground && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

# Examples — build SDK, link workspace packages, install, then start dev server.
# Core-only examples link @runwayml/avatars; React examples link both packages.

vanilla-js: build-core
    cd examples/vanilla-js && bun install && bun link @runwayml/avatars && bun run dev

sveltekit: build-core
    cd examples/sveltekit && bun install && bun link @runwayml/avatars && bun run dev

dev-express: build link-packages
    cd examples/express && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs: build link-packages
    cd examples/nextjs && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs-simple: build link-packages
    cd examples/nextjs-simple && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs-client-events: build link-packages
    cd examples/nextjs-client-events && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs-server-actions: build link-packages
    cd examples/nextjs-server-actions && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs-rpc: build link-packages
    cd examples/nextjs-rpc && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs-rpc-external-api: build link-packages
    cd examples/nextjs-rpc-external-api && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-nextjs-rpc-weather: build link-packages
    cd examples/nextjs-rpc-weather && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-subtitles: build link-packages
    cd examples/subtitles && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

dev-react-router: build link-packages
    cd examples/react-router && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev

elevenlabs: build link-packages
    cd examples/nextjs-elevenlabs && bun install && bun link @runwayml/avatars @runwayml/avatars-react && bun run dev
