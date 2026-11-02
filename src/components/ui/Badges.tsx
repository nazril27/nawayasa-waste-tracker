import type { SortingStatus, WasteType } from '@/types';
import { SORTING_LABEL, WASTE_LABEL } from '@/lib/labels';

const SORTING_CLASS: Record<SortingStatus, string> = {
  ya: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  sebagian: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  tidak: 'bg-red-50 text-red-700 ring-red-600/20',
};

const SORTING_DOT: Record<SortingStatus, string> = {
  ya: 'bg-emerald-500',
  sebagian: 'bg-amber-500',
  tidak: 'bg-red-500',
};

const WASTE_CLASS: Record<WasteType, string> = {
  organik: 'bg-lime-50 text-lime-700 ring-lime-600/20',
  nonorganik: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  residu: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  lainnya: 'bg-orange-50 text-orange-700 ring-orange-600/20',
};

export function SortingBadge({ status }: { status: SortingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-transform duration-200 hover:scale-105 ${SORTING_CLASS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SORTING_DOT[status]}`} aria-hidden="true" />
      {SORTING_LABEL[status]}
    </span>
  );
}

export function WasteTypeBadge({ type }: { type: WasteType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${WASTE_CLASS[type]}`}
    >
      {WASTE_LABEL[type]}
    </span>
  );
}
