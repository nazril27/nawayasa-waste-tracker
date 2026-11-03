import { apiRequest, apiRequestPage } from './client';
import { fetchAllPages, pageQuery } from './pagination';
import type { Paginated, WasteRecord, WastePayload } from '@/types';

function normalizeWaste(raw: WasteRecord): WasteRecord {
  return {
    ...raw,
    id: Number(raw.id),
    houseId: Number(raw.houseId),
    weight: Number(raw.weight),
  };
}

async function listPage(page: number, pageSize: number): Promise<Paginated<WasteRecord>> {
  const result = await apiRequestPage<WasteRecord>(`/wastes${pageQuery(page, pageSize)}`);
  return { ...result, data: result.data.map(normalizeWaste) };
}

export const wasteApi = {
  listPage,
  listAll: () => fetchAllPages(listPage),

  async getById(id: number): Promise<WasteRecord> {
    const waste = await apiRequest<WasteRecord>(`/wastes/${id}`);
    return normalizeWaste(waste);
  },

  async create(payload: WastePayload): Promise<WasteRecord> {
    const waste = await apiRequest<WasteRecord>('/wastes', { method: 'POST', body: payload });
    return normalizeWaste(waste);
  },
};
