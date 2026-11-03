import { useState } from 'react';
import { ArrowLeft, Home, Leaf, Scale, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { StatCard } from '@/components/dashboard/StatCard';
import { SortingDistribution } from '@/components/dashboard/SortingDistribution';
import { RtBreakdown } from '@/components/dashboard/RtBreakdown';
import { RtFilter } from '@/components/dashboard/RtFilter';
import { WasteTypeBreakdown } from '@/components/dashboard/WasteTypeBreakdown';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { formatDateTime, formatNumber, formatPercent, formatWeight } from '@/lib/format';

interface PublicDashboardPageProps {
  onBack: () => void;
}

export function PublicDashboardPage({ onBack }: PublicDashboardPageProps) {
  const [rt, setRt] = useState<string | null>(null);
  const { summary, loading, error, reload } = useDashboardSummary(rt);

  const yaPercent = summary?.housesBySortingWaste.find((item) => item.isSortingWaste === 'ya')?.percent ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">EcoWaste Tracker</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Masuk
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Dashboard Publik</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Pendataan Sampah Warga</h1>
            {summary && (
              <p className="mt-1 text-sm text-slate-500">Diperbarui {formatDateTime(summary.generatedAt)}</p>
            )}
          </div>
          <RtFilter value={rt} onChange={setRt} />
        </section>

        {error && !loading && <ErrorState message={error} onRetry={reload} />}

        {loading && !summary && (
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-36 rounded-2xl" />
              ))}
            </section>
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        )}

        {summary && (
          <div className={`space-y-8 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`} aria-busy={loading}>
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
                value={`${formatPercent(yaPercent)}%`}
                hint={`${formatNumber(summary.overview.totalStudents)} mahasiswa KKN bertugas`}
                icon={Users}
                tone="amber"
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                {summary.overview.totalHouses === 0 ? (
                  <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                    <EmptyState title="Belum ada rumah terdata" description="Data pemilahan akan muncul di sini." />
                  </div>
                ) : (
                  <SortingDistribution total={summary.overview.totalHouses} items={summary.housesBySortingWaste} />
                )}
              </div>
              <div className="lg:col-span-2">
                <WasteTypeBreakdown items={summary.wastesByType} />
              </div>
            </section>

            <section>
              <RtBreakdown rows={summary.byRt} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
