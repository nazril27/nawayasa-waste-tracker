import { CalendarClock, MapPin, Scale, UserCheck, Users } from 'lucide-react';
import { ErrorState, EmptyState, ListSkeleton } from '@/components/ui/States';
import { SortingBadge, WasteTypeBadge } from '@/components/ui/Badges';
import { Modal } from '@/components/ui/Modal';
import { useFetchList } from '@/hooks/useFetchList';
import { wasteApi } from '@/lib/api/wastes';
import { formatAddress, formatDateTime, formatNumber, formatWeight, getPersonInCharge } from '@/lib/format';
import { sortByNewest, sumWeight } from '@/lib/stats';
import type { House } from '@/types';

interface HouseDetailModalProps {
  house: House;
  onClose: () => void;
}

export function HouseDetailModal({ house, onClose }: HouseDetailModalProps) {
  const { data: wastes, loading, error, reload } = useFetchList(wasteApi.list);

  const houseWastes = sortByNewest(wastes.filter((waste) => waste.houseId === house.id));
  const totalWeight = sumWeight(houseWastes);

  return (
    <Modal open onClose={onClose} title="Detail Rumah" size="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white">
            {house.headOfFamilyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{house.headOfFamilyName}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatAddress(house)}</span>
            </p>
            <div className="mt-3">
              <SortingBadge status={house.isSortingWaste} />
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Users className="h-3.5 w-3.5" /> Anggota Keluarga
            </dt>
            <dd className="mt-1 text-lg font-bold text-slate-900">{formatNumber(house.numberOfFamilyMembers)} orang</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <UserCheck className="h-3.5 w-3.5" /> Penanggung Jawab
            </dt>
            <dd className="mt-1 truncate text-lg font-bold text-slate-900">{getPersonInCharge(house)}</dd>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Scale className="h-3.5 w-3.5" /> Total Sampah
            </dt>
            <dd className="mt-1 text-lg font-bold text-emerald-800">
              {loading ? '...' : formatWeight(totalWeight)}
            </dd>
          </div>
        </dl>

        <section>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            Riwayat Pencatatan Sampah
          </h4>

          {loading && <ListSkeleton rows={3} />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && houseWastes.length === 0 && (
            <EmptyState
              title="Belum ada catatan sampah"
              description="Pencatatan sampah untuk rumah ini akan muncul di sini."
            />
          )}
          {!loading && !error && houseWastes.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {houseWastes.map((waste) => (
                <li key={waste.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{formatWeight(waste.weight)}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(waste.createdAt)} · Dicatat oleh {waste.user?.name ?? '-'}
                    </p>
                  </div>
                  <WasteTypeBadge type={waste.typesOfWaste} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}
