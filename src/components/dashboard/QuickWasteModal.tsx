import { Modal } from '@/components/ui/Modal';
import { ErrorState, ListSkeleton } from '@/components/ui/States';
import { WasteForm } from '@/components/wastes/WasteForm';
import { useFetchList } from '@/hooks/useFetchList';
import { houseApi } from '@/lib/api/houses';

interface QuickWasteModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function QuickWasteModal({ onClose, onSaved }: QuickWasteModalProps) {
  const houses = useFetchList(houseApi.listAll);

  return (
    <Modal
      open
      onClose={onClose}
      title="Catat Sampah Cepat"
      description="Pilih rumah, lalu isi berat dan jenis sampahnya."
    >
      {houses.loading && <ListSkeleton rows={3} />}
      {!houses.loading && houses.error && <ErrorState message={houses.error} onRetry={houses.reload} />}
      {!houses.loading && !houses.error && (
        <WasteForm houses={houses.data} onSaved={onSaved} onCancel={onClose} />
      )}
    </Modal>
  );
}
