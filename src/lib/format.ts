import type { House } from '@/types';
import { getStoredUser } from '@/lib/session';

export function getPersonInCharge(house: House): string {
  if (house.user?.name) return house.user.name;
  const current = getStoredUser();
  if (current && house.userId != null && String(house.userId) === String(current.id)) return current.name;
  return '-';
}

export function formatWeight(kg: number): string {
  return `${kg.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('id-ID');
}

export function formatPercent(value: number): string {
  return value.toLocaleString('id-ID', { maximumFractionDigits: 1 });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatStreet(house: Pick<House, 'streetName' | 'houseNumber'>): string {
  const parts: string[] = [];
  if (house.streetName) parts.push(house.streetName);
  if (house.houseNumber) parts.push(`No. ${house.houseNumber}`);
  return parts.join(' ') || '-';
}

export function formatAddress(house: Pick<House, 'rt' | 'streetName' | 'houseNumber'>): string {
  return `RT ${house.rt} · ${formatStreet(house)}`;
}
