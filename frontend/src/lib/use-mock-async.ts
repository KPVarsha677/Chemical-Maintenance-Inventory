import { useEffect, useRef, useState } from "react";

interface UseMockAsyncOptions {
  /** Artificial network delay in ms. */
  delayMs?: number;
  /**
   * Probability (0-1) that the call resolves as an error instead, so the
   * error-state UI has a real (if rare) trigger. Defaults to 0 (disabled).
   */
  failureRate?: number;
  /** Recompute (and re-run the simulated fetch) when these change. */
  deps?: unknown[];
}

interface UseMockAsyncResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Simulates fetching `producer()` from a remote API: a short artificial
 * delay, real loading state, and an optional random failure path so the
 * app has a genuine loading/error UI even though the data is local.
 */
export function useMockAsync<T>(
  producer: () => T,
  { delayMs = 500, failureRate = 0, deps = [] }: UseMockAsyncOptions = {},
): UseMockAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const producerRef = useRef(producer);
  producerRef.current = producer;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (cancelled) return;
      if (failureRate > 0 && Math.random() < failureRate) {
        setError("Something went wrong while loading data. Please try again.");
        setData(null);
      } else {
        setData(producerRef.current());
      }
      setIsLoading(false);
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayMs, failureRate, attempt, ...deps]);

  return { data, isLoading, error, retry: () => setAttempt((a) => a + 1) };
}
