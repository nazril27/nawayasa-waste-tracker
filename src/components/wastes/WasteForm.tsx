import { useState, type FormEvent } from 'react';
import { Save, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { HouseCombobox } from '@/components/wastes/HouseCombobox';
import { wasteApi } from '@/lib/api/wastes';
import { getErrorMessage } from '@/lib/api/client';
import { getStoredUser } from '@/lib/session';
import { isHouseVisibleToUser } from '@/lib/houses';
import { WASTE_OPTIONS } from '@/lib/labels';
import type { House, WastePayload, WasteType } from '@/types';

const MAX_WEIGHT_KG = 1000;

interface WasteFormProps {
  houses: House[];
  onSaved: () => void;
  onCancel?: () => void;
}

interface WasteFormState {
  typesOfWaste: WasteType | '';
  weight: string;
  houseId: number | null;
  note: string;
}

type WasteFormErrors = Partial<Record<keyof WasteFormState, string>>;

const EMPTY_FORM: WasteFormState = {
  typesOfWaste: '',
  weight: '',
  houseId: null,
  note: '',
};

const TYPE_SELECTED_CLASS: Record<WasteType, string> = {
  organik: 'border-lime-500 bg-lime-50 text-lime-700 ring-4 ring-lime-100',
  nonorganik: 'border-sky-500 bg-sky-50 text-sky-700 ring-4 ring-sky-100',
  residu: 'border-slate-500 bg-slate-100 text-slate-700 ring-4 ring-slate-200',
  lainnya: 'border-orange-400 bg-orange-50 text-orange-700 ring-4 ring-orange-100',
};

function validate(form: WasteFormState): WasteFormErrors {
  const errors: WasteFormErrors = {};

  if (!form.typesOfWaste) errors.typesOfWaste = 'Pilih jenis sampah.';

  const weight = Number(form.weight);
  if (!form.weight.trim()) errors.weight = 'Berat sampah wajib diisi.';
  else if (!Number.isFinite(weight) || weight <= 0) errors.weight = 'Berat harus lebih dari 0 kg.';
  else if (weight > MAX_WEIGHT_KG) errors.weight = `Berat maksimal ${MAX_WEIGHT_KG} kg.`;

  return errors;
}

export function WasteForm({ houses, onSaved, onCancel }: WasteFormProps) {
  const currentUser = getStoredUser();
  const availableHouses = houses.filter((house) => isHouseVisibleToUser(house, currentUser?.id ?? null));
  const [form, setForm] = useState<WasteFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<WasteFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = <K extends keyof WasteFormState>(field: K, value: WasteFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.typesOfWaste) return;

    if (!currentUser) {
      toast.error('Sesi tidak ditemukan', { description: 'Silakan masuk kembali untuk mencatat sampah.' });
      return;
    }

    const payload: WastePayload = {
      typesOfWaste: form.typesOfWaste,
      weight: Number(form.weight),
      houseId: form.houseId ?? null,
      note: form.note.trim() ? form.note.trim() : null,
      userId: currentUser.id,
    };

    setSubmitting(true);
    try {
      await wasteApi.create(payload);
      const house = payload.houseId ? houses.find((item) => item.id === payload.houseId) : null;
      toast.success('Catatan sampah tersimpan', {
        description: house
          ? `${payload.weight} kg dari keluarga ${house.headOfFamilyName} telah dicatat.`
          : `${payload.weight} kg sampah telah dicatat.`,
      });
      setForm(EMPTY_FORM);
      onSaved();
    } catch (err) {
      toast.error('Gagal menyimpan catatan', { description: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* 1. Jenis Sampah */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">
          Jenis Sampah<span className="ml-0.5 text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Jenis sampah">
          {WASTE_OPTIONS.map(({ value, label }) => {
            const selected = form.typesOfWaste === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => updateField('typesOfWaste', value)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                  selected ? TYPE_SELECTED_CLASS[value] : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {errors.typesOfWaste && (
          <p className="text-xs font-medium text-red-600" role="alert">
            {errors.typesOfWaste}
          </p>
        )}
      </div>

      {/* 2. Berat Sampah */}
      <Field label="Berat Sampah (kg)" htmlFor="waste-weight" error={errors.weight} required>
        <div className="relative">
          <Scale className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            id="waste-weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={form.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            placeholder="3.5"
            className={`${inputClass(!!errors.weight)} pl-10`}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3.5 my-auto flex h-fit text-sm font-medium text-slate-400">
            kg
          </span>
        </div>
      </Field>

      {/* 3. Rumah (Opsional) */}
      <Field label="Rumah" htmlFor="waste-house" hint="Opsional. Cari berdasarkan nama kepala keluarga, RT, atau jalan.">
        <HouseCombobox
          id="waste-house"
          houses={availableHouses}
          selectedId={form.houseId}
          onSelect={(houseId) => updateField('houseId', houseId)}
        />
      </Field>

      {/* 4. Keterangan (Opsional) */}
      <Field label="Keterangan" htmlFor="waste-note" hint="Opsional, contoh: Sampah kerja bakti, ranting pohon, dsb.">
        <textarea
          id="waste-note"
          rows={2}
          value={form.note}
          onChange={(e) => updateField('note', e.target.value)}
          placeholder="Catatan tambahan (opsional)"
          className={inputClass()}
        />
      </Field>

      {/* Submit / Cancel Actions */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Batal
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {!submitting && <Save className="h-4 w-4" />}
          Simpan Catatan
        </Button>
      </div>
    </form>
  );
}
