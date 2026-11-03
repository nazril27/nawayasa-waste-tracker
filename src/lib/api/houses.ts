import { apiRequest, apiRequestPage } from './client';
import { fetchAllPages, pageQuery } from './pagination';
import type { House, HousePayload, Paginated } from '@/types';

function normalizeHouse(raw: House): House {
  return {
    ...raw,
    id: Number(raw.id),
    numberOfFamilyMembers: Number(raw.numberOfFamilyMembers),
  };
}

async function listPage(page: number, pageSize: number): Promise<Paginated<House>> {
  const result = await apiRequestPage<House>(`/houses${pageQuery(page, pageSize)}`);
  return { ...result, data: result.data.map(normalizeHouse) };
}

export const houseApi = {
  listPage,
  listAll: () => fetchAllPages(listPage),

  async getById(id: number): Promise<House> {
    const house = await apiRequest<House>(`/houses/${id}`);
    return normalizeHouse(house);
  },

  async create(payload: HousePayload): Promise<House> {
    const house = await apiRequest<House>('/houses', { method: 'POST', body: payload });
    return normalizeHouse(house);
  },
};
