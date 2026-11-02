import { useMemo, useState } from 'react';
import { ArrowRight, Home, Plus, Scale, UserPlus, Users } from 'lucide-react';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/dashboard/StatCard';
import { SortingDistribution } from '@/components/dashboard/SortingDistribution';
import { RecentWasteList } from '@/components/dashboard/RecentWasteList';
import { HouseFormModal } from '@/components/houses/HouseFormModal';
import { WasteForm } from '@/components/wastes/WasteForm';
import { useAuth } from '@/context/AuthContext';
import { useFetchList } from '@/hooks/useFetchList';
import { houseApi } from '@/lib/api/houses';
import { wasteApi } from '@/lib/api/wastes';
import { formatNumber, formatWeight } from '@/lib/format';
import { computeSortingDistribution, sortByNewest, sumWeight } from '@/lib/stats';
import type { PageKey } from '@/components/layout/AppShell';

type QuickModal = 'house' | 'waste' | null;

interface DashboardPageProps {
  onNavigate: (page: PageKey) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const houses = useFetchList(houseApi.list);
  const wastes = useFetchList(wasteApi.list);
  const [quickModal, setQuickModal] = useState<QuickModal>(null);

  const distribution = useMemo(() => computeSortingDistribution(houses.data), [houses.data]);
  const totalWeight = sumWeight(wastes.data);
  const recentWastes = sortByNewest(wastes.data).slice(0, 5);

  const loading = houses.loading || wastes.loading;
  const error = houses.error ?? wastes.error;
  const reloadAll = () => {
    houses.reload();
    wastes.reload();
  };

  const firstName = user?.name.split(' ')[0] ?? '';

  const handleSaved = () => {
    setQuickModal(null);
    reloadAll();
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Selamat datang kembali</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Halo, {firstName}</h2>
          <p className="mt-1 text-sm text-slate-500">Pantau perkembangan pendataan dan pemilahan sampah warga.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => setQuickModal('house')}>
            <UserPlus className="h-4 w-4" />
            Tambah Rumah
          </Button>
          <Button onClick={() => setQuickModal('waste')}>
            <Plus className="h-4 w-4" />
            Catat Sampah Cepat
          </Button>
        </div>
      </section>

      {error && !loading && <ErrorState message={error} onRetry={reloadAll} />}

      {!error && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)
            ) : (
              <>
                <StatCard
                  label="Total Rumah Terdata"
                  value={formatNumber(distribution.total)}
                  hint="Keluarga yang sudah didata"
                  icon={Home}
                  tone="emerald"
                />
                <StatCard
                  label="Total Berat Sampah"
                  value={formatWeight(totalWeight)}
                  hint={`${formatNumber(wastes.data.length)} kali pencatatan`}
                  icon={Scale}
                  tone="sky"
                />
                <StatCard
                  label="Rumah yang Memilah"
                  value={`${distribution.percent.ya}%`}
                  hint={`Sebagian ${distribution.percent.sebagian}% · Tidak ${distribution.percent.tidak}%`}
                  icon={Users}
                  tone="amber"
                />
              </>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {loading ? (
                <Skeleton className="h-full min-h-72 rounded-2xl" />
              ) : distribution.total === 0 ? (
                <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                  <EmptyState
                    title="Belum ada rumah terdata"
                    description="Tambahkan rumah pertama untuk melihat grafik pemilahan sampah."
                    action={
                      <Button size="sm" onClick={() => setQuickModal('house')}>
                        <UserPlus className="h-4 w-4" />
                        Tambah Rumah
                      </Button>
                    }
                  />
                </div>
              ) : (
                <SortingDistribution distribution={distribution} />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Pencatatan Terbaru</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('wastes')}
                  className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800"
                >
                  Lihat semua
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {loading && <ListSkeleton rows={4} />}
              {!loading && recentWastes.length === 0 && (
                <EmptyState
                  title="Belum ada sampah tercatat"
                  description="Catat sampah pertama dari rumah warga untuk melihat aktivitas terbaru."
                />
              )}
              {!loading && recentWastes.length > 0 && (
                <RecentWasteList wastes={recentWastes} />
              )}
            </div>
          </section>
        </>
      )}

      {quickModal === 'house' && <HouseFormModal onClose={() => setQuickModal(null)} onSaved={handleSaved} />}

      <Modal
        open={quickModal === 'waste'}
        onClose={() => setQuickModal(null)}
        title="Catat Sampah Cepat"
        description="Pilih rumah, lalu isi berat dan jenis sampahnya."
      >
        <WasteForm houses={houses.data} onSaved={handleSaved} onCancel={() => setQuickModal(null)} />
      </Modal>
    </div>
  );
}
