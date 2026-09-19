/**
 * Hook que devuelve el valor solo después de que deja de cambiar por `delay`
 * ms (se usa para no buscar en cada tecla).
 */

import { useState, useEffect } from 'react';

/** Devuelve `value` con retraso de `delay` ms. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
