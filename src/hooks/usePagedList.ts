import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import type { Paginated } from '@/types';

type PageFetcher<T> = (page: number, pageSize: number) => Promise<Paginated<T>>;

export function usePagedList<T>(fetchPage: PageFetcher<T>, page: number, pageSize: number) {
  const [result, setResult] = useState<Paginated<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchPage(page, pageSize)
      .then((next) => {
        if (active) setResult(next);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchPage, page, pageSize, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data: result?.data ?? [], meta: result, loading, error, reload };
}
