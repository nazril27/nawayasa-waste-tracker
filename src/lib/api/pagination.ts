import type { Paginated } from '@/types';

export const PAGE_SIZE = 10;

const FETCH_ALL_PAGE_SIZE = 100;

export function pageQuery(page: number, pageSize: number): string {
  return `?page=${page}&pageSize=${pageSize}`;
}

export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<Paginated<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const result = await fetchPage(page, FETCH_ALL_PAGE_SIZE);
    items.push(...result.data);
    totalPages = result.totalPages;
    page += 1;
  }
  return items;
}
