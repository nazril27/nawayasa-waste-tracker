import type { WasteRecord } from '@/types';

export function sumWeight(wastes: WasteRecord[]): number {
  return wastes.reduce((total, waste) => total + waste.weight, 0);
}

export function sortByNewest<T extends { createdAt?: string; id: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id - a.id;
  });
}
