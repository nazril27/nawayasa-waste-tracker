import { formatNumber, formatWeight } from '@/lib/format';
import { WASTE_OPTIONS } from '@/lib/labels';
import type { WasteType, WasteTypeSummary } from '@/types';

const BAR_CLASS: Record<WasteType, string> = {
  organik: 'bg-lime-500',
  nonorganik: 'bg-sky-500',
  residu: 'bg-slate-400',
  lainnya: 'bg-orange-400',
};

export function WasteTypeBreakdown({ items }: { items: WasteTypeSummary[] }) {
  const totalKg = items.reduce((sum, item) => sum + item.totalWasteWeightKg, 0);
  const rows = WASTE_OPTIONS.map(({ value, label }) => {
    const match = items.find((item) => item.typesOfWaste === value);
    return {
      value,
      label,
      records: match?.records ?? 0,
      weight: match?.totalWasteWeightKg ?? 0,
    };
  });

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Sampah per Jenis</h3>
      <p className="mt-1 text-sm text-slate-500">Berat sampah berdasarkan jenisnya.</p>

      <ul className="mt-6 space-y-5">
        {rows.map((row) => (
          <li key={row.value}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 shrink-0 font-medium text-slate-700">{row.label}</span>
              <span className="min-w-0 text-right font-semibold text-slate-900">{formatWeight(row.weight)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${BAR_CLASS[row.value]}`}
                style={{ width: `${totalKg === 0 ? 0 : (row.weight / totalKg) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{formatNumber(row.records)} catatan</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
