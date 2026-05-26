import {
  CheckStatus,
  ConnectionCheck,
  type CheckInfo,
} from 'livekit-client';

export type ConnectionCheckStatus =
  | 'idle'
  | 'running'
  | 'skipped'
  | 'success'
  | 'failed';

export interface ConnectionCheckStep {
  name: string;
  description: string;
  status: ConnectionCheckStatus;
  logs: ReadonlyArray<{ level: 'info' | 'warning' | 'error'; message: string }>;
}

export interface AvatarConnectionCheckOptions {
  serverUrl: string;
  token: string;
  /**
   * Also run a full WebRTC room join after the WebSocket check.
   * Default false — WebRTC preflight uses the same session token as the call and can
   * leave the room in a bad state before AvatarSession connects.
   */
  webrtc?: boolean;
}

export interface AvatarConnectionCheckResult {
  success: boolean;
  checks: ReadonlyArray<ConnectionCheckStep>;
}

function mapCheckStatus(status: CheckStatus): ConnectionCheckStatus {
  switch (status) {
    case CheckStatus.IDLE:
      return 'idle';
    case CheckStatus.RUNNING:
      return 'running';
    case CheckStatus.SKIPPED:
      return 'skipped';
    case CheckStatus.SUCCESS:
      return 'success';
    case CheckStatus.FAILED:
      return 'failed';
    default:
      return 'idle';
  }
}

function mapCheckInfo(info: CheckInfo): ConnectionCheckStep {
  return {
    name: info.name,
    description: info.description,
    status: mapCheckStatus(info.status),
    logs: info.logs.map((log) => ({
      level: log.level,
      message: log.message,
    })),
  };
}

/**
 * Preflight connectivity checks against a LiveKit server using session credentials.
 * Run before joining an avatar session (same `serverUrl` + `token` as connect).
 */
export async function checkAvatarConnection(
  options: AvatarConnectionCheckOptions,
): Promise<AvatarConnectionCheckResult> {
  const { serverUrl, token, webrtc = false } = options;
  const checker = new ConnectionCheck(serverUrl, token);

  await checker.checkWebsocket();
  if (webrtc) {
    await checker.checkWebRTC();
  }

  const checks = checker.getResults().map(mapCheckInfo);
  return {
    success: checker.isSuccess(),
    checks,
  };
}
