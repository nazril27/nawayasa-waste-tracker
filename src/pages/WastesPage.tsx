import { useState } from 'react';
import { History, PencilLine } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorState, ListSkeleton } from '@/components/ui/States';
import { WasteForm } from '@/components/wastes/WasteForm';
import { WasteHistory } from '@/components/wastes/WasteHistory';
import { useFetchList } from '@/hooks/useFetchList';
import { usePagedList } from '@/hooks/usePagedList';
import { houseApi } from '@/lib/api/houses';
import { PAGE_SIZE } from '@/lib/api/pagination';
import { wasteApi } from '@/lib/api/wastes';
import { formatNumber } from '@/lib/format';

export function WastesPage() {
  const [page, setPage] = useState(1);
  const houses = useFetchList(houseApi.listAll);
  const wastes = usePagedList(wasteApi.listPage, page, PAGE_SIZE);

  const handleSaved = () => {
    setPage(1);
    wastes.reload();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <PencilLine className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Catat Sampah Baru</h2>
            <p className="mt-0.5 text-sm text-slate-500">Pilih jenis dan berat sampah. Rumah warga bersifat opsional.</p>
          </div>
        </div>

        <WasteForm houses={houses.data} onSaved={handleSaved} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Riwayat Pengambilan Sampah</h2>
          </div>
          {!wastes.loading && !wastes.error && wastes.meta && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {formatNumber(wastes.meta.total)} catatan
            </span>
          )}
        </div>

        <div className="px-2 pb-4 sm:px-4">
          {wastes.loading && (
            <div className="p-4">
              <ListSkeleton rows={5} />
            </div>
          )}
          {!wastes.loading && wastes.error && <ErrorState message={wastes.error} onRetry={wastes.reload} />}
          {!wastes.loading && !wastes.error && <WasteHistory wastes={wastes.data} />}
          {!wastes.error && wastes.meta && (
            <Pagination meta={wastes.meta} itemLabel="catatan" onPageChange={setPage} disabled={wastes.loading} />
          )}
        </div>
      </section>
    </div>
  );
}
