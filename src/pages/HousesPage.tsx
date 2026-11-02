import { useMemo, useState } from 'react';
import { Plus, RotateCcw, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/ui/States';
import { HouseDetailModal } from '@/components/houses/HouseDetailModal';
import { HouseFormModal } from '@/components/houses/HouseFormModal';
import { HouseList } from '@/components/houses/HouseList';
import { useFetchList } from '@/hooks/useFetchList';
import { houseApi } from '@/lib/api/houses';
import { SORTING_OPTIONS } from '@/lib/labels';
import type { House, SortingStatus } from '@/types';

const ALL = 'all';

export function HousesPage() {
  const { data: houses, loading, error, reload } = useFetchList(houseApi.list);
  const [search, setSearch] = useState('');
  const [rtFilter, setRtFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<SortingStatus | typeof ALL>(ALL);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const rtOptions = useMemo(
    () => Array.from(new Set(houses.map((house) => house.rt))).sort((a, b) => a.localeCompare(b, 'id', { numeric: true })),
    [houses],
  );

  const filteredHouses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return houses.filter((house) => {
      if (rtFilter !== ALL && house.rt !== rtFilter) return false;
      if (statusFilter !== ALL && house.isSortingWaste !== statusFilter) return false;
      if (!term) return true;
      return [house.headOfFamilyName, house.streetName ?? ''].join(' ').toLowerCase().includes(term);
    });
  }, [houses, search, rtFilter, statusFilter]);

  const hasFilters = search.trim() !== '' || rtFilter !== ALL || statusFilter !== ALL;

  const resetFilters = () => {
    setSearch('');
    setRtFilter(ALL);
    setStatusFilter(ALL);
  };

  const handleSaved = () => {
    setFormOpen(false);
    reload();
  };

  const renderContent = () => {
    if (loading) return <ListSkeleton rows={5} />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (houses.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
          <EmptyState
            title="Belum ada rumah terdata"
            description="Mulai pendataan dengan menambahkan rumah warga pertama di wilayah KKN Anda."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah Rumah
              </Button>
            }
          />
        </div>
      );
    }
    if (filteredHouses.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            title="Tidak ada rumah yang cocok"
            description="Coba ubah kata kunci pencarian atau filter yang sedang aktif."
            action={
              <Button variant="secondary" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" />
                Reset filter
              </Button>
            }
          />
        </div>
      );
    }
    return <HouseList houses={filteredHouses} onSelect={setSelectedHouse} />;
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {loading ? 'Memuat data rumah...' : `${houses.length} rumah terdata di wilayah KKN`}
        </p>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4" />
          Tambah Rumah
        </Button>
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_160px_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="search"
            aria-label="Cari kepala keluarga atau jalan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kepala keluarga atau nama jalan"
            className={`${inputClass()} pl-10`}
          />
        </div>
        <select
          aria-label="Filter RT"
          value={rtFilter}
          onChange={(e) => setRtFilter(e.target.value)}
          className={inputClass()}
        >
          <option value={ALL}>Semua RT</option>
          {rtOptions.map((rt) => (
            <option key={rt} value={rt}>
              RT {rt}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter status pemilahan"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SortingStatus | typeof ALL)}
          className={inputClass()}
        >
          <option value={ALL}>Semua Status</option>
          {SORTING_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              Memilah: {label}
            </option>
          ))}
        </select>
      </section>

      {!loading && !error && houses.length > 0 && hasFilters && (
        <p className="text-sm text-slate-500">
          Menampilkan <span className="font-semibold text-slate-900">{filteredHouses.length}</span> dari {houses.length} rumah
        </p>
      )}

      {renderContent()}

      {formOpen && <HouseFormModal onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {selectedHouse && <HouseDetailModal house={selectedHouse} onClose={() => setSelectedHouse(null)} />}
    </div>
  );
}
