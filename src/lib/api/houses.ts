import { apiRequest, apiRequestPage } from './client';
import { fetchAllPages, pageQuery } from './pagination';
import type { House, HousePayload, HouseUpdatePayload, Paginated, SortingStatus } from '@/types';

export type HouseFilters = {
  search?: string;
  rt?: string;
  isSortingWaste?: SortingStatus;
  userId?: string;
};

function normalizeHouse(raw: House): House {
  return {
    ...raw,
    id: Number(raw.id),
    numberOfFamilyMembers: Number(raw.numberOfFamilyMembers),
  };
}

async function listPage(page: number, pageSize: number, filters: HouseFilters = {}): Promise<Paginated<House>> {
  const result = await apiRequestPage<House>(`/houses${pageQuery(page, pageSize, filters)}`);
  return { ...result, data: result.data.map(normalizeHouse) };
}

function buildHouseFormData(payload: object, file: File): FormData {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    formData.append(key, value === null ? '' : String(value));
  });
  formData.append('file', file);
  return formData;
}

export const houseApi = {
  listPage,
  listAll: () => fetchAllPages(listPage),

  async getById(id: number): Promise<House> {
    const house = await apiRequest<House>(`/houses/${id}`);
    return normalizeHouse(house);
  },

  async create(payload: HousePayload, file?: File): Promise<House> {
    const body = file ? buildHouseFormData(payload, file) : payload;
    const house = await apiRequest<House>('/houses', { method: 'POST', body });
    return normalizeHouse(house);
  },

  async update(id: number, payload: HouseUpdatePayload, file?: File): Promise<House> {
    const body = file ? buildHouseFormData(payload, file) : payload;
    const house = await apiRequest<House>(`/houses/${id}`, { method: 'PATCH', body });
    return normalizeHouse(house);
  },

  async remove(id: number): Promise<void> {
    await apiRequest<unknown>(`/houses/${id}`, { method: 'DELETE' });
  },
};
