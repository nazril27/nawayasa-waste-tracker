import { Trash2 } from 'lucide-react';
import { WasteTypeBadge } from '@/components/ui/Badges';
import { formatAddress, formatDateTime, formatWeight } from '@/lib/format';
import type { WasteRecord } from '@/types';

export function RecentWasteList({ wastes }: { wastes: WasteRecord[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {wastes.map((waste) => (
        <li key={waste.id} className="flex items-center gap-4 py-3.5 transition-colors hover:bg-slate-50/70">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Trash2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {waste.house ? waste.house.headOfFamilyName : `Rumah #${waste.houseId}`}
            </p>
            <p className="truncate text-xs text-slate-500">
              {waste.house ? formatAddress(waste.house) : 'Data rumah tidak tersedia'} · {formatDateTime(waste.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="text-sm font-bold text-slate-900">{formatWeight(waste.weight)}</span>
            <WasteTypeBadge type={waste.typesOfWaste} />
          </div>
        </li>
      ))}
    </ul>
  );
}
