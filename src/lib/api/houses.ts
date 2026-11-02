import { apiRequest } from './client';
import type { House, HousePayload } from '@/types';

function normalizeHouse(raw: House): House {
  return {
    ...raw,
    id: Number(raw.id),
    numberOfFamilyMembers: Number(raw.numberOfFamilyMembers),
  };
}

export const houseApi = {
  async list(): Promise<House[]> {
    const houses = await apiRequest<House[]>('/houses');
    if (!Array.isArray(houses)) throw new Error('Data rumah dari server tidak valid.');
    return houses.map(normalizeHouse);
  },

  async getById(id: number): Promise<House> {
    const house = await apiRequest<House>(`/houses/${id}`);
    return normalizeHouse(house);
  },

  async create(payload: HousePayload): Promise<House> {
    const house = await apiRequest<House>('/houses', { method: 'POST', body: payload });
    return normalizeHouse(house);
  },
};
