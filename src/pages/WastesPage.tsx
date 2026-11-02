import { History, PencilLine } from 'lucide-react';
import { ErrorState, ListSkeleton, Skeleton } from '@/components/ui/States';
import { WasteForm } from '@/components/wastes/WasteForm';
import { WasteHistory } from '@/components/wastes/WasteHistory';
import { useFetchList } from '@/hooks/useFetchList';
import { houseApi } from '@/lib/api/houses';
import { wasteApi } from '@/lib/api/wastes';

export function WastesPage() {
  const houses = useFetchList(houseApi.list);
  const wastes = useFetchList(wasteApi.list);

  const historyCount = wastes.data.length;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PencilLine className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Catat Sampah Baru</h2>
            <p className="mt-0.5 text-sm text-slate-500">Pilih rumah, lalu masukkan berat dan jenis sampah.</p>
          </div>
        </div>

        {houses.loading && <Skeleton className="h-96 rounded-xl" />}
        {!houses.loading && houses.error && <ErrorState message={houses.error} onRetry={houses.reload} />}
        {!houses.loading && !houses.error && (
          <>
            {houses.data.length === 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Belum ada rumah terdata. Tambahkan rumah di menu Data Rumah terlebih dahulu.
              </div>
            )}
            <WasteForm houses={houses.data} onSaved={wastes.reload} />
          </>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Riwayat Pengambilan Sampah</h2>
          </div>
          {!wastes.loading && !wastes.error && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {historyCount} catatan
            </span>
          )}
        </div>

        <div className="px-2 py-2 sm:px-4">
          {wastes.loading && (
            <div className="p-4">
              <ListSkeleton rows={5} />
            </div>
          )}
          {!wastes.loading && wastes.error && <ErrorState message={wastes.error} onRetry={wastes.reload} />}
          {!wastes.loading && !wastes.error && <WasteHistory wastes={wastes.data} />}
        </div>
      </section>
    </div>
  );
}
