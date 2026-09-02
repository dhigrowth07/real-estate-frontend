'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';

export interface UseFetchOptions {
  params?: Record<string, string | number | boolean | undefined>;
  autoFetch?: boolean;
}

export function useFetch<T>(endpoint: string, options: UseFetchOptions = {}) {
  const { params, autoFetch = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);

  const paramsKey = useMemo(() => (params ? JSON.stringify(params) : ''), [params]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<T>(endpoint, params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    let isMounted = true;

    if (!autoFetch) return;

    async function loadData() {
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const result = await apiClient.get<T>(endpoint, params);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [autoFetch, endpoint, paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  };
}
