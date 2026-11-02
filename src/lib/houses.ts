import type { House, User } from '@/types';

export function isHouseVisibleToUser(house: House, userId: User['id'] | null): boolean {
  if (house.userId == null) return true;
  return userId !== null && String(house.userId) === String(userId);
}
