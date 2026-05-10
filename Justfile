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

# Dev
dev-core:
    cd packages/core && bun run dev
dev-react: build-core
    cd packages/react && bun run dev

# Examples
vanilla-js: build-core
    cd examples/vanilla-js && bun install && bun run dev
sveltekit: build-core
    cd examples/sveltekit && bun install && bun run dev
nextjs-core-only: build-core
    cd examples/nextjs-core-only && bun install && bun run dev
