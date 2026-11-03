import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/format';
import type { PageMeta } from '@/types';

interface PaginationProps {
  meta: PageMeta;
  itemLabel: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ meta, itemLabel, onPageChange, disabled = false }: PaginationProps) {
  if (meta.total === 0) return null;

  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Menampilkan{' '}
        <span className="font-semibold text-slate-900">
          {formatNumber(from)}–{formatNumber(to)}
        </span>{' '}
        dari {formatNumber(meta.total)} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={disabled || meta.page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <span className="w-28 text-center text-sm font-medium text-slate-600">
          Hal. {meta.page} / {meta.totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={disabled || meta.page >= meta.totalPages}
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
