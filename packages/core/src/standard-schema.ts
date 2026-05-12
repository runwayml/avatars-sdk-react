/**
 * Standard Schema v1 — a tiny cross-library validation interface implemented
 * by Zod, Valibot, ArkType, and others. Anything matching this shape plugs
 * into `clientTool({ schema })`.
 *
 * @see https://standardschema.dev/
 *
 * We re-declare the spec here (instead of depending on `@standard-schema/spec`)
 * so the SDK stays dependency-free and server-safe.
 */

// -- Public surface --------------------------------------------------------

/** The schema itself — what a `z.object(...)` etc. resolves to. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output };
  };
}

/** Result of calling `schema['~standard'].validate(value)`. */
export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaIssue> };

/** A single validation failure — part of the error path. */
export interface StandardSchemaIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
}

// -- Inference helpers -----------------------------------------------------

export type InferSchemaInput<Schema extends StandardSchemaV1> =
  Schema extends StandardSchemaV1<infer Input, unknown> ? Input : never;

export type InferSchemaOutput<Schema extends StandardSchemaV1> =
  Schema extends StandardSchemaV1<unknown, infer Output> ? Output : never;
