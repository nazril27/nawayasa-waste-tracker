import { apiRequest } from './client';
import type { WasteRecord, WastePayload } from '@/types';

function normalizeWaste(raw: WasteRecord): WasteRecord {
  return {
    ...raw,
    id: Number(raw.id),
    houseId: Number(raw.houseId),
    weight: Number(raw.weight),
  };
}

export const wasteApi = {
  async list(): Promise<WasteRecord[]> {
    const wastes = await apiRequest<WasteRecord[]>('/wastes');
    if (!Array.isArray(wastes)) throw new Error('Data sampah dari server tidak valid.');
    return wastes.map(normalizeWaste);
  },

  async getById(id: number): Promise<WasteRecord> {
    const waste = await apiRequest<WasteRecord>(`/wastes/${id}`);
    return normalizeWaste(waste);
  },

  async create(payload: WastePayload): Promise<WasteRecord> {
    const waste = await apiRequest<WasteRecord>('/wastes', { method: 'POST', body: payload });
    return normalizeWaste(waste);
  },
};
