import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Camera, ImagePlus, Undo2, X } from 'lucide-react';

interface HouseImagePickerProps {
  currentImageUrl?: string | null;
  selectedFile: File | null;
  onSelect: (file: File | null) => void;
  isExistingRemoved?: boolean;
  onRemoveExisting?: (removed: boolean) => void;
  error?: string | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Mengompres foto beresolusi tinggi (misal dari kamera HP modern 12-48MP)
 * agar ukuran file ringan (< 1.5MB) saat diunggah dari lapangan tanpa mengurangi detail rumah.
 */
async function compressImageIfNeeded(file: File, maxDimension = 1920): Promise<File> {
  // Jika file sudah di bawah 1.5 MB, tidak perlu kompresi
  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        0.82
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export function HouseImagePicker({
  currentImageUrl,
  selectedFile,
  onSelect,
  isExistingRemoved = false,
  onRemoveExisting,
  error,
  disabled = false,
}: HouseImagePickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const activeExistingUrl = isExistingRemoved ? null : currentImageUrl;
  const displayUrl = previewUrl ?? activeExistingUrl ?? null;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const rawFile = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!rawFile) return;

    setProcessing(true);
    setValidationError(null);

    try {
      const file = await compressImageIfNeeded(rawFile);

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setValidationError('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
        onSelect(null);
      } else if (file.size > MAX_FILE_SIZE) {
        setValidationError('Ukuran foto melebihi 5 MB.');
        onSelect(null);
      } else {
        setValidationError(null);
        onRemoveExisting?.(false);
        onSelect(file);
      }
    } catch {
      setValidationError('Gagal memproses foto.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveExisting = () => {
    onSelect(null);
    setValidationError(null);
    onRemoveExisting?.(true);
  };

  const handleUndoRemoveExisting = () => {
    onRemoveExisting?.(false);
  };

  const shownError = error ?? validationError;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        Foto Rumah<span className="ml-0.5 font-normal text-slate-400"> (opsional)</span>
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
          {displayUrl ? (
            <img src={displayUrl} alt="Pratinjau foto rumah" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
              <Camera className="h-7 w-7 text-slate-300" />
              <span className="text-[11px] font-medium text-slate-400">Belum ada foto</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Kamera Langsung untuk Mobile/Lapangan */}
            <button
              type="button"
              disabled={disabled || processing}
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {displayUrl ? 'Ambil Ulang' : 'Buka Kamera'}
            </button>

            {/* Tombol Pilih dari File / Galeri */}
            <button
              type="button"
              disabled={disabled || processing}
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4 text-slate-500" />
              {displayUrl ? 'Pilih Galeri' : 'Pilih dari Galeri'}
            </button>
          </div>

          {processing && (
            <p className="text-xs font-medium text-emerald-600 animate-pulse">
              Memproses & mengoptimasi foto...
            </p>
          )}

          {/* Opsi Tambahan / Hapus / Restore */}
          {selectedFile ? (
            <button
              type="button"
              disabled={disabled || processing}
              onClick={() => onSelect(null)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Batal pilih foto ini
            </button>
          ) : isExistingRemoved ? (
            <button
              type="button"
              disabled={disabled || processing}
              onClick={handleUndoRemoveExisting}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Kembalikan foto awal
            </button>
          ) : currentImageUrl ? (
            <button
              type="button"
              disabled={disabled || processing}
              onClick={handleRemoveExisting}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Hapus foto saat ini
            </button>
          ) : null}
        </div>

        {/* Hidden Camera Input (Memaksa membuka kamera belakang ponsel di iOS & Android) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={disabled || processing}
          className="hidden"
        />

        {/* Hidden Gallery Input (Membuka file/galeri penyimpanan perangkat) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled || processing}
          className="hidden"
        />
      </div>

      {shownError ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {shownError}
        </p>
      ) : (
        <p className="text-xs text-slate-500">Format JPG, PNG, atau WebP. Maksimal 5 MB.</p>
      )}
    </div>
  );
}
