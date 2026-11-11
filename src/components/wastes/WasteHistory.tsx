import { Trash2 } from 'lucide-react';
import { WasteTypeBadge } from '@/components/ui/Badges';
import { EmptyState } from '@/components/ui/States';
import { formatAddress, formatDateTime, formatWeight } from '@/lib/format';
import { sortByNewest } from '@/lib/stats';
import type { WasteRecord } from '@/types';

function houseTitle(waste: WasteRecord): string {
  if (waste.house) return waste.house.headOfFamilyName;
  if (waste.houseId) return `Rumah #${waste.houseId}`;
  return 'Tanpa Rumah (Umum)';
}

function recorderName(waste: WasteRecord): string {
  return waste.user?.name ?? '-';
}

export function WasteHistory({ wastes }: { wastes: WasteRecord[] }) {
  if (wastes.length === 0) {
    return (
      <EmptyState
        title="Belum ada riwayat sampah"
        description="Setiap pencatatan sampah akan tampil di sini lengkap dengan waktu dan jenisnya."
      />
    );
  }

  const rows = sortByNewest(wastes);

  return (
    <>
      <div className="hidden overflow-hidden md:block">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Waktu</th>
              <th className="px-5 py-3.5">Rumah</th>
              <th className="px-5 py-3.5">Dicatat Oleh</th>
              <th className="px-5 py-3.5">Jenis</th>
              <th className="px-5 py-3.5 text-right">Berat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((waste) => (
              <tr key={waste.id} className="transition-colors duration-150 hover:bg-emerald-50/50">
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDateTime(waste.createdAt)}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{houseTitle(waste)}</p>
                  {waste.house && <p className="text-xs text-slate-500">{formatAddress(waste.house)}</p>}
                  {waste.note && <p className="mt-0.5 text-xs italic text-slate-500">Ket: {waste.note}</p>}
                </td>
                <td className="px-5 py-4 text-slate-600">{recorderName(waste)}</td>
                <td className="px-5 py-4">
                  <WasteTypeBadge type={waste.typesOfWaste} />
                </td>
                <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatWeight(waste.weight)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((waste) => (
          <li key={waste.id} className="flex items-center gap-3 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Trash2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{houseTitle(waste)}</p>
              <p className="truncate text-xs text-slate-500">
                {formatDateTime(waste.createdAt)} · {recorderName(waste)}
              </p>
              {waste.note && <p className="mt-0.5 truncate text-xs italic text-slate-500">Ket: {waste.note}</p>}
              <div className="mt-1.5">
                <WasteTypeBadge type={waste.typesOfWaste} />
              </div>
            </div>
            <span className="shrink-0 text-sm font-bold text-slate-900">{formatWeight(waste.weight)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
