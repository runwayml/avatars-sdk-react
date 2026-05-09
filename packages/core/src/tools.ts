import type {
  InferSchemaOutput,
  StandardSchemaResult,
  StandardSchemaV1,
} from './standard-schema';
import type { ClientEvent } from './types';

/**
 * A standalone client tool definition. Composable — combine into arrays
 * and derive event types with `ClientEventsFrom`.
 *
 * At runtime this is just `{ type, name, description }` (exactly what the
 * Runway session create payload expects). The `Args` generic is phantom —
 * it only exists at the TypeScript level for type narrowing.
 *
 * When the tool is defined with a `schema` ([Standard Schema](https://standardschema.dev/)),
 * the schema is attached internally (not serialized) for runtime validation
 * and to infer `Args` from the schema output type.
 */
export interface ClientToolDef<Name extends string = string, Args = unknown> {
  readonly type: 'client_event';
  readonly name: Name;
  readonly description: string;
  /** @internal phantom field — always `undefined` at runtime */
  readonly _args?: Args;
}

export type ClientToolArgs<Tool extends ClientToolDef> =
  Tool extends ClientToolDef<string, infer Args> ? Args : never;

export type ClientEventFromTool<Tool extends ClientToolDef> =
  Tool extends ClientToolDef<infer Name, infer Args>
    ? ClientEvent<Name, Args>
    : never;

/**
 * Derive a discriminated union of ClientEvent types from an array of tools.
 *
 * @example
 * ```typescript
 * const tools = [showQuestion, playSound];
 * type MyEvent = ClientEventsFrom<typeof tools>;
 * ```
 */
export type ClientEventsFrom<T extends ReadonlyArray<ClientToolDef>> =
  T[number] extends infer U
    ? U extends ClientToolDef<infer Name, infer Args>
      ? ClientEvent<Name, Args>
      : never
    : never;

// Schemas live in a WeakMap so the tool def itself stays a clean
// `{ type, name, description }` object — safe to spread into the API
// payload and JSON.stringify without leaking schema internals.
const toolSchemas = new WeakMap<ClientToolDef, StandardSchemaV1>();

// Tracks tools that have already emitted the async-schema warning so a
// misconfigured schema doesn't spam the console on every incoming event.
const asyncSchemaWarned = new WeakSet<ClientToolDef>();

/**
 * Return the Standard Schema associated with a tool, if any.
 * Useful when composing validation outside of the SDK hooks.
 */
export function getClientToolSchema(
  tool: ClientToolDef,
): StandardSchemaV1 | undefined {
  return toolSchemas.get(tool);
}

/**
 * Validate parsed client event args against a tool's schema.
 *
 * Returns the typed args on success, or `null` when the schema fails or
 * when the schema would need to resolve asynchronously (Standard Schema
 * allows async `validate`, but for fire-and-forget client events we only
 * accept sync results here).
 *
 * Tools defined without a schema always validate successfully — the
 * incoming args are returned as-is.
 */
export function validateClientToolArgs<Tool extends ClientToolDef>(
  tool: Tool,
  args: unknown,
): ClientToolArgs<Tool> | null {
  const schema = toolSchemas.get(tool);
  if (!schema) {
    return args as ClientToolArgs<Tool>;
  }

  const result = schema['~standard'].validate(args);
  if (result instanceof Promise) {
    if (!asyncSchemaWarned.has(tool) && typeof console !== 'undefined') {
      asyncSchemaWarned.add(tool);
      console.warn(
        `[@runwayml/avatars-react] Async Standard Schema validation is not supported for client events (tool "${tool.name}"); subsequent events for this tool will be dropped silently.`,
      );
    }
    return null;
  }

  return isSuccess(result) ? (result.value as ClientToolArgs<Tool>) : null;
}

function isSuccess<Output>(
  result: StandardSchemaResult<Output>,
): result is { readonly value: Output; readonly issues?: undefined } {
  return result.issues == null;
}

/**
 * Define a single client tool.
 *
 * Returns a standalone object that can be composed into arrays and passed
 * to `realtimeSessions.create({ tools })`.
 *
 * Two forms are supported:
 *
 * 1. **Schema-driven** (recommended) — pass a
 *    [Standard Schema](https://standardschema.dev/) (Zod, Valibot, ArkType, …)
 *    to infer `args` types and enable runtime validation of incoming events:
 *
 *    ```typescript
 *    import { z } from 'zod';
 *    const showCaption = clientTool('show_caption', {
 *      description: 'Display a caption',
 *      schema: z.object({ text: z.string() }),
 *    });
 *    ```
 *
 * 2. **Type-only** — pass an `args` type via a cast when you don't need
 *    runtime validation:
 *
 *    ```typescript
 *    const showCaption = clientTool('show_caption', {
 *      description: 'Display a caption',
 *      args: {} as { text: string },
 *    });
 *    ```
 *
 * Combine tools and derive event types with `ClientEventsFrom`:
 *
 * ```typescript
 * const tools = [showCaption, playSound];
 * type MyEvent = ClientEventsFrom<typeof tools>;
 * ```
 */
export function clientTool<
  Name extends string,
  Schema extends StandardSchemaV1,
>(
  name: Name,
  config: { description: string; schema: Schema },
): ClientToolDef<Name, InferSchemaOutput<Schema>>;
export function clientTool<Name extends string, Args>(
  name: Name,
  config: { description: string; args: Args },
): ClientToolDef<Name, Args>;
export function clientTool<Name extends string>(
  name: Name,
  config:
    | { description: string; schema: StandardSchemaV1 }
    | { description: string; args: unknown },
): ClientToolDef<Name> {
  const tool: ClientToolDef<Name> = {
    type: 'client_event',
    name,
    description: config.description,
  };

  if ('schema' in config) {
    toolSchemas.set(tool, config.schema);
  }

  return tool;
}
