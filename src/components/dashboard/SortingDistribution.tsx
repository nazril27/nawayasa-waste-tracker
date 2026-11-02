import type { SortingDistribution as Distribution } from '@/lib/stats';
import type { SortingStatus } from '@/types';
import { SORTING_OPTIONS } from '@/lib/labels';

const SEGMENT_CLASS: Record<SortingStatus, string> = {
  ya: 'stroke-emerald-500',
  sebagian: 'stroke-amber-400',
  tidak: 'stroke-red-400',
};

const BAR_CLASS: Record<SortingStatus, string> = {
  ya: 'bg-emerald-500',
  sebagian: 'bg-amber-400',
  tidak: 'bg-red-400',
};

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SortingDistribution({ distribution }: { distribution: Distribution }) {
  const { total, counts, percent } = distribution;

  let offset = 0;
  const segments = SORTING_OPTIONS.map(({ value }) => {
    const length = total === 0 ? 0 : (counts[value] / total) * CIRCUMFERENCE;
    const segment = { value, length, offset };
    offset += length;
    return segment;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Status Pemilahan Sampah</h3>
      <p className="mt-1 text-sm text-slate-500">Distribusi rumah berdasarkan kebiasaan memilah.</p>

      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="Diagram status pemilahan">
            <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="14" className="stroke-slate-100" />
            {segments.map((segment) => (
              <circle
                key={segment.value}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth="14"
                strokeLinecap="butt"
                className={`${SEGMENT_CLASS[segment.value]} transition-[stroke-dasharray] duration-700 ease-out`}
                strokeDasharray={`${segment.length} ${CIRCUMFERENCE}`}
                strokeDashoffset={-segment.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">rumah</span>
          </div>
        </div>

        <ul className="w-full flex-1 space-y-4">
          {SORTING_OPTIONS.map(({ value, label }) => (
            <li key={value}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">
                  {counts[value]} rumah · <span className="font-semibold text-slate-900">{percent[value]}%</span>
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${BAR_CLASS[value]}`}
                  style={{ width: `${percent[value]}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
