'use client';

import {
  checkAvatarConnection,
  type AvatarConnectionCheckResult,
  type SessionCredentials,
} from '@runwayml/avatars';
import * as React from 'react';

export type UseConnectionCheckReturn = {
  status: 'idle' | 'running' | 'success' | 'failed' | 'error';
  result: AvatarConnectionCheckResult | null;
  error: Error | null;
  run: () => Promise<AvatarConnectionCheckResult | null>;
};

export function useConnectionCheck({
  credentials,
  enabled = true,
  webrtc = false,
  runOnMount = false,
}: {
  credentials: SessionCredentials | null;
  enabled?: boolean;
  webrtc?: boolean;
  runOnMount?: boolean;
}): UseConnectionCheckReturn {
  const [status, setStatus] = React.useState<UseConnectionCheckReturn['status']>(
    'idle',
  );
  const [result, setResult] =
    React.useState<AvatarConnectionCheckResult | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const runningRef = React.useRef(false);
  const resultRef = React.useRef(result);
  resultRef.current = result;

  const run = React.useCallback(async () => {
    if (!credentials || !enabled) {
      return null;
    }
    if (runningRef.current) {
      return resultRef.current;
    }
    runningRef.current = true;
    setStatus('running');
    setError(null);
    try {
      const next = await checkAvatarConnection({
        serverUrl: credentials.serverUrl,
        token: credentials.token,
        webrtc,
      });
      setResult(next);
      setStatus(next.success ? 'success' : 'failed');
      return next;
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error(String(err));
      setError(nextError);
      setStatus('error');
      return null;
    } finally {
      runningRef.current = false;
    }
  }, [credentials, enabled, webrtc]);

  React.useEffect(() => {
    if (!runOnMount || !credentials || !enabled) {
      return;
    }
    void run();
  }, [runOnMount, credentials, enabled, run]);

  return { status, result, error, run };
}
