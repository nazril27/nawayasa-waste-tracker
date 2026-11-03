import { formatNumber, formatWeight } from '@/lib/format';
import { rtLabel } from '@/lib/labels';
import type { RtSummary } from '@/types';

export function RtBreakdown({ rows }: { rows: RtSummary[] }) {
  const maxHouses = Math.max(1, ...rows.map((row) => row.houses));

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Rekap per RT</h3>
      <p className="mt-1 text-sm text-slate-500">Jumlah rumah dan sampah di setiap RT.</p>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Belum ada data RT.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {rows.map((row) => (
            <li key={row.rt}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-900">{rtLabel(row.rt)}</span>
                <span className="text-slate-500">
                  {formatNumber(row.houses)} rumah · {formatNumber(row.familyMembers)} anggota
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
                  style={{ width: `${(row.houses / maxHouses) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {formatWeight(row.totalWasteWeightKg)} dari {formatNumber(row.wasteRecords)} catatan
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
