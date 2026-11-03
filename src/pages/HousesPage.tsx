import { useState } from 'react';
import { RotateCcw, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/ui/States';
import { HouseDetailModal } from '@/components/houses/HouseDetailModal';
import { HouseFormModal } from '@/components/houses/HouseFormModal';
import { HouseList } from '@/components/houses/HouseList';
import { usePagedList } from '@/hooks/usePagedList';
import { houseApi } from '@/lib/api/houses';
import { PAGE_SIZE } from '@/lib/api/pagination';
import { formatNumber } from '@/lib/format';
import type { House } from '@/types';

export function HousesPage() {
  const [page, setPage] = useState(1);
  const { data: houses, meta, loading, error, reload } = usePagedList(houseApi.listPage, page, PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const total = meta?.total ?? 0;
  const term = search.trim().toLowerCase();
  const filteredHouses = term
    ? houses.filter((house) => [house.headOfFamilyName, house.streetName ?? ''].join(' ').toLowerCase().includes(term))
    : houses;

  const handleSaved = () => {
    setFormOpen(false);
    setPage(1);
    reload();
  };

  const renderContent = () => {
    if (loading) return <ListSkeleton rows={5} />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (total === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white">
          <EmptyState
            title="Belum ada rumah terdata"
            description="Mulai pendataan dengan menambahkan rumah warga pertama di wilayah KKN Anda."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <UserPlus className="h-4 w-4" />
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
            description="Coba ubah kata kunci pencarian."
            action={
              <Button variant="secondary" onClick={() => setSearch('')}>
                <RotateCcw className="h-4 w-4" />
                Reset pencarian
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
          {loading ? 'Memuat data rumah...' : `${formatNumber(total)} rumah terdata di wilayah KKN`}
        </p>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4" />
          Tambah Rumah
        </Button>
      </section>

      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Search className="pointer-events-none absolute inset-y-0 left-7 my-auto h-4 w-4 text-slate-400" />
        <input
          type="search"
          aria-label="Cari kepala keluarga atau jalan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kepala keluarga atau nama jalan (halaman ini)"
          className={`${inputClass()} pl-10`}
        />
      </div>

      {renderContent()}

      {!error && meta && <Pagination meta={meta} itemLabel="rumah" onPageChange={setPage} disabled={loading} />}

      {formOpen && <HouseFormModal onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {selectedHouse && <HouseDetailModal house={selectedHouse} onClose={() => setSelectedHouse(null)} />}
    </div>
  );
}
