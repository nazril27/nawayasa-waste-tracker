import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface HouseImagePickerProps {
  currentImageUrl?: string | null;
  selectedFile: File | null;
  onSelect: (file: File | null) => void;
  error?: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function HouseImagePicker({ currentImageUrl, selectedFile, onSelect, error }: HouseImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const displayUrl = previewUrl ?? currentImageUrl ?? null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      setSizeError('Ukuran file melebihi 5 MB.');
      onSelect(null);
    } else {
      setSizeError(null);
      onSelect(file);
    }
    event.target.value = '';
  };

  const shownError = error ?? sizeError;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        Foto Rumah<span className="ml-0.5 font-normal text-slate-400"> (opsional)</span>
      </label>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {displayUrl ? (
            <img src={displayUrl} alt="Pratinjau foto rumah" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <ImagePlus className="h-7 w-7" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <ImagePlus className="h-4 w-4" />
            {displayUrl ? 'Ganti Foto' : 'Pilih Foto'}
          </button>
          {selectedFile && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Hapus pilihan
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
