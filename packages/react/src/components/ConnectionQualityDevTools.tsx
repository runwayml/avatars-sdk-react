'use client';

import { ConnectionIndicator } from './ConnectionIndicator';

export interface ConnectionQualityDevToolsProps {
  /** Force the warning pill (UI smoke test). */
  previewWarning?: boolean;
}

/**
 * Optional dev overlay: live metrics + the same warning pill as production.
 * Mount inside `AvatarSession` / custom `AvatarCall` children — not enabled by default.
 */
export function ConnectionQualityDevTools({
  previewWarning = false,
}: ConnectionQualityDevToolsProps) {
  return <ConnectionIndicator debug previewWarning={previewWarning} />;
}
