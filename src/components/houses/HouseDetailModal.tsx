import { useState } from 'react';
import { CalendarClock, MapPin, Pencil, Scale, Trash2, UserCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { ErrorState, EmptyState, ListSkeleton } from '@/components/ui/States';
import { SortingBadge, WasteTypeBadge } from '@/components/ui/Badges';
import { Modal } from '@/components/ui/Modal';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { houseApi } from '@/lib/api/houses';
import { wasteApi } from '@/lib/api/wastes';
import { useFetchList } from '@/hooks/useFetchList';
import { formatAddress, formatDateTime, formatNumber, formatWeight, getPersonInCharge } from '@/lib/format';
import { sortByNewest, sumWeight } from '@/lib/stats';
import type { House } from '@/types';

interface HouseDetailModalProps {
  house: House;
  onClose: () => void;
  onEdit: (house: House) => void;
  onDeleted: () => void;
}

export function HouseDetailModal({ house, onClose, onEdit, onDeleted }: HouseDetailModalProps) {
  const { data: wastes, loading, error, reload } = useFetchList(wasteApi.listAll);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const houseWastes = sortByNewest(wastes.filter((waste) => waste.houseId === house.id));
  const totalWeight = sumWeight(houseWastes);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await houseApi.remove(house.id);
      toast.success('Data rumah berhasil dihapus', {
        description: `Keluarga ${house.headOfFamilyName} telah dihapus dari data.`,
      });
      onDeleted();
    } catch (err) {
      const description =
        err instanceof ApiError && err.status === 409
          ? 'Rumah ini masih memiliki catatan sampah, sehingga tidak bisa dihapus.'
          : getErrorMessage(err);
      toast.error('Gagal menghapus data rumah', { description });
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const footer = confirmingDelete ? (
    <>
      <Button variant="secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
        Batal
      </Button>
      <Button variant="danger" onClick={handleDelete} loading={deleting}>
        Ya, Hapus Rumah
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 sm:mr-auto" onClick={() => setConfirmingDelete(true)}>
        <Trash2 className="h-4 w-4" />
        Hapus
      </Button>
      <Button variant="secondary" onClick={() => onEdit(house)}>
        <Pencil className="h-4 w-4" />
        Edit Data Rumah
      </Button>
    </>
  );

  return (
    <Modal open onClose={onClose} title="Detail Rumah" size="lg" footer={footer}>
      <div className="space-y-6">
        {confirmingDelete && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            <p className="font-semibold">Hapus data rumah ini?</p>
            <p className="mt-1 text-red-700">
              Data keluarga {house.headOfFamilyName} akan dihapus permanen. Rumah yang sudah memiliki catatan sampah tidak
              bisa dihapus.
            </p>
          </div>
        )}

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
