"use client";

import { useEffect, useState } from "react";
import type { AxiosRequestConfig } from "axios";
import api, { getData } from "@/lib/api";

export function useFetch<T = unknown>(url?: string | null, config?: AxiosRequestConfig) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    api
      .get(url, { signal: controller.signal, ...config })
      .then((res) => {
        if (cancelled) return;
        setData(getData<T>(res));
      })
      .catch((err) => {
        if (cancelled) return;
        // normalize abort error to null error
        if ((err as any)?.name === 'CanceledError' || (err as any)?.message === 'canceled') return;
        setError(err as Error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      try {
        controller.abort();
      } catch {}
    };
  }, [url]);

  return { data, loading, error } as { data: T | null; loading: boolean; error: Error | null };
}
