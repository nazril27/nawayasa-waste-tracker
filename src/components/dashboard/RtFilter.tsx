import { RT_OPTIONS } from '@/lib/labels';

interface RtFilterProps {
  value: string | null;
  onChange: (rt: string | null) => void;
}

const OPTIONS: { value: string | null; label: string }[] = [{ value: null, label: 'Semua RT' }, ...RT_OPTIONS];

export function RtFilter({ value, onChange }: RtFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter RT">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value ?? 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
              active
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
