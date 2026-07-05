export type AvatarErrorCode =
  | 'CONSUME_FAILED'
  | 'CONNECTION_FAILED'
  | 'SESSION_CREATE_FAILED'
  | 'ELEVENLABS_SIGNED_URL_FAILED'
  | 'MEDIA_PERMISSION_DENIED'
  | 'MEDIA_DEVICE_ERROR'
  | 'SCREEN_SHARE_FAILED'
  | 'PUBLISH_FAILED'
  | 'UNKNOWN';

export class AvatarError extends Error {
  readonly code: AvatarErrorCode;
  readonly cause?: Error;

  constructor(code: AvatarErrorCode, message: string, cause?: Error) {
    super(message);
    this.name = 'AvatarError';
    this.code = code;
    this.cause = cause;
  }
}

export function toAvatarError(
  code: AvatarErrorCode,
  fallbackMessage: string,
  err: unknown,
): AvatarError {
  if (err instanceof AvatarError) return err;
  const cause = err instanceof Error ? err : undefined;
  const message = cause?.message ?? fallbackMessage;
  return new AvatarError(code, message, cause);
}
