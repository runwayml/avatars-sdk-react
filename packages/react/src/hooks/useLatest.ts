'use client';

import { useEffect, useRef } from 'react';

export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
