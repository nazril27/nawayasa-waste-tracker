import type { House, SortingStatus, WasteRecord } from '@/types';

export interface SortingDistribution {
  total: number;
  counts: Record<SortingStatus, number>;
  percent: Record<SortingStatus, number>;
}

export function computeSortingDistribution(houses: House[]): SortingDistribution {
  const counts: Record<SortingStatus, number> = { ya: 0, sebagian: 0, tidak: 0 };
  houses.forEach((house) => {
    if (house.isSortingWaste in counts) counts[house.isSortingWaste] += 1;
  });

  const total = houses.length;
  const toPercent = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

  return {
    total,
    counts,
    percent: {
      ya: toPercent(counts.ya),
      sebagian: toPercent(counts.sebagian),
      tidak: toPercent(counts.tidak),
    },
  };
}

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
