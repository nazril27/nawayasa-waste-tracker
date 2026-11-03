import { apiRequest } from './client';
import type { DashboardSummary } from '@/types';

export const dashboardApi = {
  async getSummary(rt: string | null): Promise<DashboardSummary> {
    const query = rt ? `?rt=${encodeURIComponent(rt)}` : '';
    const summary = await apiRequest<DashboardSummary>(`/dashboard${query}`);
    if (typeof summary !== 'object' || summary === null || !('overview' in summary)) {
      throw new Error('Data dashboard dari server tidak valid.');
    }
    return summary;
  },
};
