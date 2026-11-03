import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { dashboardApi } from '@/lib/api/dashboard';
import type { DashboardSummary } from '@/types';

export function useDashboardSummary(rt: string | null) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    dashboardApi
      .getSummary(rt)
      .then((next) => {
        if (active) setSummary(next);
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
  }, [rt, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { summary, loading, error, reload };
}
