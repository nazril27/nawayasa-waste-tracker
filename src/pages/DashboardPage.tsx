import { useState } from 'react';
import { ArrowRight, Home, Plus, Scale, UserPlus, Users } from 'lucide-react';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { SortingDistribution } from '@/components/dashboard/SortingDistribution';
import { RecentWasteList } from '@/components/dashboard/RecentWasteList';
import { QuickWasteModal } from '@/components/dashboard/QuickWasteModal';
import { HouseFormModal } from '@/components/houses/HouseFormModal';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { usePagedList } from '@/hooks/usePagedList';
import { wasteApi } from '@/lib/api/wastes';
import { formatNumber, formatPercent, formatWeight } from '@/lib/format';
import type { PageKey } from '@/components/layout/AppShell';

type QuickModal = 'house' | 'waste' | null;

const RECENT_LIMIT = 5;

interface DashboardPageProps {
  onNavigate: (page: PageKey) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const { summary, loading, error, reload } = useDashboardSummary(null);
  const recent = usePagedList(wasteApi.listPage, 1, RECENT_LIMIT);
  const [quickModal, setQuickModal] = useState<QuickModal>(null);

  const firstName = user?.name.split(' ')[0] ?? '';

  const handleSaved = () => {
    setQuickModal(null);
    reload();
    recent.reload();
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
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setQuickModal('house')}>
            <UserPlus className="h-4 w-4" />
            Tambah Rumah
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setQuickModal('waste')}>
            <Plus className="h-4 w-4" />
            Catat Sampah Cepat
          </Button>
        </div>
      </section>

      {error && !loading && <ErrorState message={error} onRetry={reload} />}

      {loading && !summary && (
        <section className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </section>
      )}

      {summary && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Rumah Terdata"
              value={formatNumber(summary.overview.totalHouses)}
              hint={`${formatNumber(summary.overview.totalFamilyMembers)} anggota keluarga`}
              icon={Home}
              tone="emerald"
            />
            <StatCard
              label="Total Berat Sampah"
              value={formatWeight(summary.overview.totalWasteWeightKg)}
              hint={`${formatNumber(summary.overview.totalWasteRecords)} kali pencatatan`}
              icon={Scale}
              tone="sky"
            />
            <StatCard
              label="Rumah yang Memilah"
              value={`${formatPercent(summary.housesBySortingWaste.find((i) => i.isSortingWaste === 'ya')?.percent ?? 0)}%`}
              hint={`${formatNumber(summary.overview.totalStudents)} mahasiswa KKN bertugas`}
              icon={Users}
              tone="amber"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {summary.overview.totalHouses === 0 ? (
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
                <SortingDistribution total={summary.overview.totalHouses} items={summary.housesBySortingWaste} />
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

              {recent.loading && recent.data.length === 0 && <ListSkeleton rows={4} />}
              {!recent.loading && recent.error && <ErrorState message={recent.error} onRetry={recent.reload} />}
              {!recent.loading && !recent.error && recent.data.length === 0 && (
                <EmptyState
                  title="Belum ada sampah tercatat"
                  description="Catat sampah pertama dari rumah warga untuk melihat aktivitas terbaru."
                />
              )}
              {!recent.error && recent.data.length > 0 && <RecentWasteList wastes={recent.data} />}
            </div>
          </section>
        </>
      )}

      {quickModal === 'house' && <HouseFormModal onClose={() => setQuickModal(null)} onSaved={handleSaved} />}
      {quickModal === 'waste' && <QuickWasteModal onClose={() => setQuickModal(null)} onSaved={handleSaved} />}
    </div>
  );
}
