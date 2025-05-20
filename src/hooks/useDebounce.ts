import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a changing value.
 * @param value - The input value to debounce.
 * @param delay - Delay in milliseconds.
 * @returns Debounced value.
 */
export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Cleanup on value or delay change
    };
  }, [value, delay]);

  return debouncedValue;
}
