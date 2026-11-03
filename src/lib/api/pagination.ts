import type { Paginated } from '@/types';

export const PAGE_SIZE = 10;

const FETCH_ALL_PAGE_SIZE = 100;

export function pageQuery(
  page: number,
  pageSize: number,
  filters: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return `?${params.toString()}`;
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
