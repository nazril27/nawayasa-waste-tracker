import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/ui/States';
import { HouseDetailModal } from '@/components/houses/HouseDetailModal';
import { HouseFormModal } from '@/components/houses/HouseFormModal';
import { HouseList } from '@/components/houses/HouseList';
import { useFetchList } from '@/hooks/useFetchList';
import { usePagedList } from '@/hooks/usePagedList';
import { houseApi, type HouseFilters } from '@/lib/api/houses';
import { PAGE_SIZE } from '@/lib/api/pagination';
import { userApi } from '@/lib/api/users';
import { formatNumber } from '@/lib/format';
import { RT_OPTIONS, SORTING_OPTIONS } from '@/lib/labels';
import type { House, SortingStatus } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;

export function HousesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [rtFilter, setRtFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SortingStatus | ''>('');
  const [studentFilter, setStudentFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const { data: students } = useFetchList(userApi.listAll);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = useMemo<HouseFilters>(
    () => ({
      search: appliedSearch || undefined,
      rt: rtFilter || undefined,
      isSortingWaste: statusFilter || undefined,
      userId: studentFilter || undefined,
    }),
    [appliedSearch, rtFilter, statusFilter, studentFilter],
  );
  const fetchHouses = useCallback((p: number, s: number) => houseApi.listPage(p, s, filters), [filters]);

  const { data: houses, meta, loading, error, reload } = usePagedList(fetchHouses, page, PAGE_SIZE);
  const total = meta?.total ?? 0;
  const hasFilters = Boolean(appliedSearch || rtFilter || statusFilter || studentFilter);

  const resetFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setRtFilter('');
    setStatusFilter('');
    setStudentFilter('');
    setPage(1);
  };

  const handleSaved = () => {
    setEditingHouse(null);
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
          {hasFilters ? (
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
          ) : (
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
          )}
        </div>
      );
    }
    return <HouseList houses={houses} onSelect={setSelectedHouse} />;
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

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_160px_200px_220px]">
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
          onChange={(e) => {
            setRtFilter(e.target.value);
            setPage(1);
          }}
          className={inputClass()}
        >
          <option value="">Semua RT</option>
          {RT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter status pemilahan"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as SortingStatus | '');
            setPage(1);
          }}
          className={inputClass()}
        >
          <option value="">Semua Status</option>
          {SORTING_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              Memilah: {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter mahasiswa"
          value={studentFilter}
          onChange={(e) => {
            setStudentFilter(e.target.value);
            setPage(1);
          }}
          className={inputClass()}
        >
          <option value="">Semua Mahasiswa</option>
          {students.map((student) => (
            <option key={student.id} value={String(student.id)}>
              {student.name}
            </option>
          ))}
        </select>
      </section>

      {renderContent()}

      {!error && meta && (
        <Pagination meta={meta} itemLabel="rumah" onPageChange={setPage} disabled={loading} />
      )}

      {formOpen && <HouseFormModal onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {editingHouse && (
        <HouseFormModal house={editingHouse} onClose={() => setEditingHouse(null)} onSaved={handleSaved} />
      )}
      {selectedHouse && (
        <HouseDetailModal
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
          onEdit={(house) => {
            setSelectedHouse(null);
            setEditingHouse(house);
          }}
          onDeleted={() => {
            setSelectedHouse(null);
            setPage(1);
            reload();
          }}
        />
      )}
    </div>
  );
}
