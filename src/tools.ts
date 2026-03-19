import type { ClientEvent } from './types';

/**
 * A standalone client tool definition. Composable — combine into arrays
 * and derive event types with `ClientEventsFrom`.
 *
 * At runtime this is just `{ type, name, description }`. The `Args` generic
 * is phantom — it only exists at the TypeScript level for type narrowing.
 */
export interface ClientToolDef<Name extends string = string, Args = unknown> {
  readonly type: 'client_event';
  readonly name: Name;
  readonly description: string;
  /** @internal phantom field — always `undefined` at runtime */
  readonly _args?: Args;
}

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

/**
 * Define a single client tool.
 *
 * Returns a standalone object that can be composed into arrays and passed
 * to `realtimeSessions.create({ tools })`.
 *
 * @example
 * ```typescript
 * const showQuestion = clientTool('show_question', {
 *   description: 'Display a trivia question',
 *   args: {} as { question: string; options: Array<string> },
 * });
 *
 * const playSound = clientTool('play_sound', {
 *   description: 'Play a sound effect',
 *   args: {} as { sound: 'correct' | 'incorrect' },
 * });
 *
 * // Combine and derive types
 * const tools = [showQuestion, playSound];
 * type MyEvent = ClientEventsFrom<typeof tools>;
 * ```
 */
export function clientTool<Name extends string, Args>(
  name: Name,
  config: { description: string; args: Args },
): ClientToolDef<Name, Args> {
  return {
    type: 'client_event',
    name,
    description: config.description,
  };
}
