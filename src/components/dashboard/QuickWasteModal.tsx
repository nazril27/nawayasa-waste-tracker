import { Modal } from '@/components/ui/Modal';
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
      description="Pilih jenis dan berat sampah. Rumah warga bersifat opsional."
    >
      <WasteForm houses={houses.data} onSaved={onSaved} onCancel={onClose} />
    </Modal>
  );
}
