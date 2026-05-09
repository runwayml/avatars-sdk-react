'use client';

import { usePageActions, type PageActionsOptions } from '../hooks/usePageActions';

export function PageActions(props: PageActionsOptions) {
  usePageActions(props);
  return null;
}
