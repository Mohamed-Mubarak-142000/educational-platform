import { useEffect, useState } from 'react';

/** Delays reflecting `value` until it stops changing for `delayMs` — used to
 * avoid firing a server request on every keystroke of a search box. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
