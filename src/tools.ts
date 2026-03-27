import type { ClientEvent } from './types';

type ClientToolParamType = 'string' | 'number' | 'boolean' | 'array';

type ClientToolScalarType = Exclude<ClientToolParamType, 'array'>;

export interface ClientToolParameterItemDefinition {
  readonly type: ClientToolParamType;
  readonly items?: ClientToolParameterItemDefinition;
}

export interface ClientToolParameterDefinition
  extends ClientToolParameterItemDefinition {
  readonly name: string;
  readonly description: string;
}

interface ClientToolParamOptions {
  readonly optional?: boolean;
}

interface ClientToolParamBase<Type extends ClientToolParamType, Value> {
  readonly type: Type;
  readonly description: string;
  readonly optional?: boolean;
  /** @internal phantom field — always `undefined` at runtime */
  readonly _value?: Value;
}

export interface ClientToolScalarParam<
  Type extends ClientToolScalarType = ClientToolScalarType,
  Value = unknown,
> extends ClientToolParamBase<Type, Value> {}

export interface ClientToolArrayParam<
  Item extends ClientToolParam = ClientToolParam,
> extends ClientToolParamBase<'array', Array<ClientToolParamValue<Item>>> {
  readonly items: Item;
}

export type ClientToolParam =
  | ClientToolScalarParam<'string', string>
  | ClientToolScalarParam<'number', number>
  | ClientToolScalarParam<'boolean', boolean>
  | ClientToolArrayParam;

type ClientToolParamShape = Record<string, ClientToolParam>;

type ClientToolParamValue<Param extends ClientToolParam> = Param extends {
  readonly _value?: infer Value;
}
  ? Value
  : never;

type RequiredKeys<Shape extends ClientToolParamShape> = {
  [Key in keyof Shape]-?: Shape[Key]['optional'] extends true ? never : Key;
}[keyof Shape];

type OptionalKeys<Shape extends ClientToolParamShape> = {
  [Key in keyof Shape]-?: Shape[Key]['optional'] extends true ? Key : never;
}[keyof Shape];

type Expand<T> = T extends infer O ? { [Key in keyof O]: O[Key] } : never;

type ClientToolArgsFromParams<Shape extends ClientToolParamShape> = Expand<
  { [Key in RequiredKeys<Shape>]: ClientToolParamValue<Shape[Key]> } & {
    [Key in OptionalKeys<Shape>]?: ClientToolParamValue<Shape[Key]>;
  }
>;

const CLIENT_TOOL_PARAMS = Symbol('clientToolParams');

type ClientToolWithInternalParams = {
  readonly [CLIENT_TOOL_PARAMS]?: ClientToolParamShape;
};

/**
 * A standalone client tool definition. Composable — combine into arrays
 * and derive event types with `ClientEventsFrom`.
 *
 * At runtime this is `{ type, name, description }` plus an optional
 * `parameters` array for the session create payload. The `Args` generic
 * is still phantom and drives type narrowing on the client.
 */
export interface ClientToolDef<Name extends string = string, Args = unknown> {
  readonly type: 'client_event';
  readonly name: Name;
  readonly description: string;
  readonly parameters?: ReadonlyArray<ClientToolParameterDefinition>;
  /** @internal phantom field — always `undefined` at runtime */
  readonly _args?: Args;
}

export type ClientToolArgs<Tool extends ClientToolDef> =
  Tool extends ClientToolDef<string, infer Args> ? Args : never;

export type ClientEventFromTool<Tool extends ClientToolDef> =
  Tool extends ClientToolDef<infer Name, infer Args>
    ? ClientEvent<Name, Args>
    : never;

function createScalarParam<Type extends ClientToolScalarType, Value>(
  type: Type,
  description: string,
  options?: ClientToolParamOptions,
): ClientToolScalarParam<Type, Value> {
  return options?.optional
    ? { type, description, optional: true }
    : { type, description };
}

/**
 * Build runtime parameter definitions while preserving compile-time args.
 */
export const clientToolParam = {
  string<Type extends string = string>(
    description = '',
    options?: ClientToolParamOptions,
  ): ClientToolScalarParam<'string', Type> {
    return createScalarParam('string', description, options);
  },
  number<Type extends number = number>(
    description = '',
    options?: ClientToolParamOptions,
  ): ClientToolScalarParam<'number', Type> {
    return createScalarParam('number', description, options);
  },
  boolean<Type extends boolean = boolean>(
    description = '',
    options?: ClientToolParamOptions,
  ): ClientToolScalarParam<'boolean', Type> {
    return createScalarParam('boolean', description, options);
  },
  array<Item extends ClientToolParam>(
    items: Item,
    description: string,
    options?: ClientToolParamOptions,
  ): ClientToolArrayParam<Item> {
    return options?.optional
      ? { type: 'array', items, description, optional: true }
      : { type: 'array', items, description };
  },
} as const;

function toParameterItemDefinition(
  parameter: ClientToolParam,
): ClientToolParameterItemDefinition {
  if (parameter.type === 'array') {
    return {
      type: 'array',
      items: toParameterItemDefinition(parameter.items),
    };
  }

  return { type: parameter.type };
}

function toParameterDefinitions(
  parameters: ClientToolParamShape,
): Array<ClientToolParameterDefinition> {
  return Object.entries(parameters).map(([name, parameter]) => ({
    name,
    type: parameter.type,
    description: parameter.description,
    ...(parameter.type === 'array'
      ? { items: toParameterItemDefinition(parameter.items) }
      : {}),
  }));
}

function attachInternalParams<T extends ClientToolDef>(
  tool: T,
  parameters: ClientToolParamShape,
): T {
  Object.defineProperty(tool, CLIENT_TOOL_PARAMS, {
    value: parameters,
    enumerable: false,
  });
  return tool;
}

function hasMatchingParam(parameter: ClientToolParam, value: unknown): boolean {
  switch (parameter.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return (
        Array.isArray(value) &&
        value.every((item) => hasMatchingParam(parameter.items, item))
      );
  }
}

function hasMatchingArgs(
  parameters: ClientToolParamShape,
  args: unknown,
): boolean {
  if (args == null || typeof args !== 'object' || Array.isArray(args)) {
    return false;
  }

  const record = args as Record<string, unknown>;
  for (const [name, parameter] of Object.entries(parameters)) {
    if (!(name in record) || record[name] == null) {
      if (!parameter.optional) return false;
      continue;
    }

    if (!hasMatchingParam(parameter, record[name])) {
      return false;
    }
  }

  return true;
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
 * Check whether a parsed client event matches a tool definition.
 *
 * When the tool was created with `parameters`, this also validates
 * the incoming `args` shape at runtime.
 */
export function isClientToolEvent<Tool extends ClientToolDef>(
  tool: Tool,
  event: ClientEvent<string, unknown> | null | undefined,
): event is ClientEventFromTool<Tool> {
  if (!event || event.tool !== tool.name) {
    return false;
  }

  const parameters = (tool as ClientToolWithInternalParams)[CLIENT_TOOL_PARAMS];
  if (!parameters) {
    return true;
  }

  return hasMatchingArgs(parameters, event.args);
}

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
 *   parameters: {
 *     question: clientToolParam.string('The next trivia question'),
 *     options: clientToolParam.array(
 *       clientToolParam.string(),
 *       'Multiple-choice options',
 *     ),
 *   },
 * });
 *
 * const playSound = clientTool('play_sound', {
 *   description: 'Play a sound effect',
 *   parameters: {
 *     sound: clientToolParam.string<'correct' | 'incorrect'>(
 *       'Sound to play',
 *     ),
 *   },
 * });
 *
 * // Combine and derive types
 * const tools = [showQuestion, playSound];
 * type MyEvent = ClientEventsFrom<typeof tools>;
 * ```
 */
export function clientTool<
  Name extends string,
  const Params extends ClientToolParamShape,
>(
  name: Name,
  config: { description: string; parameters: Params },
): ClientToolDef<Name, ClientToolArgsFromParams<Params>>;
export function clientTool<Name extends string, Args>(
  name: Name,
  config: { description: string; args: Args },
): ClientToolDef<Name, Args>;
export function clientTool<Name extends string>(
  name: Name,
  config:
    | { description: string; args: unknown }
    | { description: string; parameters: ClientToolParamShape },
): ClientToolDef<Name> {
  const baseTool = {
    type: 'client_event',
    name,
    description: config.description,
  } satisfies ClientToolDef<Name>;

  if ('parameters' in config) {
    return attachInternalParams(
      {
        ...baseTool,
        parameters: toParameterDefinitions(config.parameters),
      },
      config.parameters,
    );
  }

  return baseTool;
}
