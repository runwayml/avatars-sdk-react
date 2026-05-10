'use client';

import {
  usePageActions,
  type PageActionsOptions,
} from '../hooks/usePageActions';

/**
 * Renders nothing visible — subscribes to built-in page-action client events
 * (`click`, `scroll_to`, `highlight`) and executes them against the DOM.
 *
 * Drop this inside `<AvatarCall>` or `<AvatarSession>` alongside your other
 * components. Pair with `pageActionTools` on the server to wire both sides.
 *
 * @example
 * ```tsx
 * import { AvatarCall, AvatarVideo, ControlBar, PageActions } from '@runwayml/avatars-react';
 *
 * <AvatarCall avatarId="my-avatar" connectUrl="/api/avatar/connect">
 *   <AvatarVideo />
 *   <ControlBar />
 *   <PageActions />
 * </AvatarCall>
 * ```
 */
export function PageActions(props: PageActionsOptions): null {
  usePageActions(props);
  return null;
}
