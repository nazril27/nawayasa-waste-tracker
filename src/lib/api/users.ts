import { apiRequest } from './client';
import type { User } from '@/types';

export const userApi = {
  listAll: () => apiRequest<User[]>('/users'),
};
