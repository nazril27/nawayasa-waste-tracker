import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronsUpDown, MapPin, X } from 'lucide-react';
import { inputClass } from '@/components/ui/Field';
import { formatAddress } from '@/lib/format';
import type { House } from '@/types';

interface HouseComboboxProps {
  id: string;
  houses: House[];
  selectedId: number | null;
  onSelect: (houseId: number | null) => void;
  hasError?: boolean;
}

function houseLabel(house: House): string {
  return `${house.headOfFamilyName} (${formatAddress(house)})`;
}

export function HouseCombobox({ id, houses, selectedId, onSelect, hasError = false }: HouseComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = houses.find((house) => house.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return houses;
    return houses.filter((house) =>
      [house.headOfFamilyName, house.rt, house.streetName ?? '', house.houseNumber ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [houses, query]);

  const activeIndex = Math.min(highlight, Math.max(filtered.length - 1, 0));
  const listId = `${id}-listbox`;

  const choose = (house: House) => {
    onSelect(house.id);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlight(Math.min(activeIndex + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Enter' && open && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const displayValue = open ? query : selected ? houseLabel(selected) : '';

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={displayValue}
        placeholder={houses.length === 0 ? 'Tanpa rumah warga (opsional)' : 'Pilih rumah warga (opsional)'}
        onFocus={() => {
          setOpen(true);
          setQuery('');
          setHighlight(0);
        }}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={`${inputClass(hasError)} pr-10`}
      />
      {selected && !open ? (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(null);
            setQuery('');
          }}
          className="absolute inset-y-0 right-3 my-auto flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title="Hapus pilihan rumah"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <ChevronsUpDown className="pointer-events-none absolute inset-y-0 right-3.5 my-auto h-4 w-4 text-slate-400" />
      )}

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full animate-fade-in overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <li
            role="option"
            aria-selected={selectedId === null}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(null);
              setQuery('');
              setOpen(false);
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
              selectedId === null ? 'bg-slate-100 font-semibold text-slate-700' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="italic">— Tanpa rumah warga (Opsional) —</span>
          </li>
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">Tidak ada rumah yang cocok.</li>
          )}
          {filtered.map((house, index) => {
            const isActive = index === activeIndex;
            const isSelected = house.id === selectedId;
            return (
              <li
                key={house.id}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(house);
                }}
                onMouseEnter={() => setHighlight(index)}
                className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{house.headOfFamilyName}</p>
                    {house.userId == null && (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Belum terhubung
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{formatAddress(house)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
