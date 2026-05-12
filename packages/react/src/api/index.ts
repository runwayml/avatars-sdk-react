// Re-export everything from the core /api subpath for backwards compatibility.
// React users who imported from '@runwayml/avatars-react/api' continue to work.
export {
  clientTool,
  consumeSession,
  getClientToolSchema,
  pageActionTools,
  pollUntilReady,
  validateClientToolArgs,
} from '@runwayml/avatars/api';

export type {
  ClientEvent,
  ClientEventFromTool,
  ClientEventsFrom,
  ClientToolArgs,
  ClientToolDef,
  ConsumeSessionOptions,
  ConsumeSessionResponse,
  InferSchemaInput,
  InferSchemaOutput,
  PageActionEvent,
  PollUntilReadyOptions,
  StandardSchemaIssue,
  StandardSchemaResult,
  StandardSchemaV1,
} from '@runwayml/avatars/api';
