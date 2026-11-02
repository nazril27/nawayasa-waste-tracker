import { apiRequest, ApiError } from './client';
import { isUser } from '@/lib/session';
import type { LoginPayload, RegisterPayload, User } from '@/types';

export const authApi = {
  async register(payload: RegisterPayload): Promise<void> {
    await apiRequest<unknown>('/auth/register', { method: 'POST', body: payload });
  },

  async login(payload: LoginPayload): Promise<User> {
    const user = await apiRequest<unknown>('/auth/login', { method: 'POST', body: payload });
    if (!isUser(user)) {
      throw new ApiError('Data pengguna dari server tidak valid.', 500);
    }
    return user;
  },

  logout(): Promise<void> {
    return apiRequest<void>('/auth/logout', { method: 'POST' });
  },
};
