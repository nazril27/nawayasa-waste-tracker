import type { SortingStatus, WasteType } from '@/types';

export const rtLabel = (value: string): string => `RT ${Number(value)}`;

export const RT_OPTIONS: { value: string; label: string }[] = ['01', '03', '04', '05', '06', '07'].map(
  (value) => ({ value, label: rtLabel(value) }),
);

export const SORTING_OPTIONS: { value: SortingStatus; label: string }[] = [
  { value: 'ya', label: 'Ya' },
  { value: 'sebagian', label: 'Sebagian' },
  { value: 'tidak', label: 'Tidak' },
];

export const WASTE_OPTIONS: { value: WasteType; label: string }[] = [
  { value: 'organik', label: 'Organik' },
  { value: 'nonorganik', label: 'Non-Organik' },
  { value: 'residu', label: 'Residu' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const SORTING_LABEL: Record<SortingStatus, string> = {
  ya: 'Memilah: Ya',
  sebagian: 'Memilah: Sebagian',
  tidak: 'Memilah: Tidak',
};

export const WASTE_LABEL: Record<WasteType, string> = {
  organik: 'Organik',
  nonorganik: 'Non-Organik',
  residu: 'Residu',
  lainnya: 'Lainnya',
};
