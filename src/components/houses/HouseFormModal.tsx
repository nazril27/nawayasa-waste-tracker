import { useState, type FormEvent } from 'react';
import { Home, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { houseApi } from '@/lib/api/houses';
import { getErrorMessage } from '@/lib/api/client';
import { getStoredUser } from '@/lib/session';
import { RT_OPTIONS, SORTING_OPTIONS, rtLabel } from '@/lib/labels';
import type { House, HousePayload, HouseUpdatePayload, SortingStatus } from '@/types';

interface HouseFormModalProps {
  house?: House;
  onClose: () => void;
  onSaved: () => void;
}

interface HouseFormState {
  rt: string;
  headOfFamilyName: string;
  numberOfFamilyMembers: string;
  isSortingWaste: SortingStatus | '';
  streetName: string;
  houseNumber: string;
}

type HouseFormErrors = Partial<Record<keyof HouseFormState, string>>;

const EMPTY_FORM: HouseFormState = {
  rt: '',
  headOfFamilyName: '',
  numberOfFamilyMembers: '',
  isSortingWaste: '',
  streetName: '',
  houseNumber: '',
};

const SORTING_SELECTED_CLASS: Record<SortingStatus, string> = {
  ya: 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100',
  sebagian: 'border-amber-400 bg-amber-50 text-amber-700 ring-4 ring-amber-100',
  tidak: 'border-red-400 bg-red-50 text-red-700 ring-4 ring-red-100',
};

function toFormState(house: House): HouseFormState {
  return {
    rt: house.rt,
    headOfFamilyName: house.headOfFamilyName,
    numberOfFamilyMembers: String(house.numberOfFamilyMembers),
    isSortingWaste: house.isSortingWaste,
    streetName: house.streetName ?? '',
    houseNumber: house.houseNumber ? String(house.houseNumber) : '',
  };
}

function validate(form: HouseFormState): HouseFormErrors {
  const errors: HouseFormErrors = {};
  if (!form.rt) errors.rt = 'Pilih RT terlebih dahulu.';

  if (!form.headOfFamilyName.trim()) errors.headOfFamilyName = 'Nama kepala keluarga wajib diisi.';

  const members = Number(form.numberOfFamilyMembers);
  if (!form.numberOfFamilyMembers.trim()) errors.numberOfFamilyMembers = 'Jumlah anggota keluarga wajib diisi.';
  else if (!Number.isInteger(members) || members < 1 || members > 50) {
    errors.numberOfFamilyMembers = 'Masukkan angka bulat antara 1 dan 50.';
  }

  if (!form.isSortingWaste) errors.isSortingWaste = 'Pilih status pemilahan sampah.';
  return errors;
}

export function HouseFormModal({ house, onClose, onSaved }: HouseFormModalProps) {
  const isEdit = house !== undefined;
  const [form, setForm] = useState<HouseFormState>(() => (house ? toFormState(house) : EMPTY_FORM));
  const [errors, setErrors] = useState<HouseFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const rtOptions =
    house && !RT_OPTIONS.some((option) => option.value === house.rt)
      ? [...RT_OPTIONS, { value: house.rt, label: rtLabel(house.rt) }]
      : RT_OPTIONS;

  const updateField = <K extends keyof HouseFormState>(field: K, value: HouseFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.isSortingWaste) return;

    const fields = {
      rt: form.rt,
      headOfFamilyName: form.headOfFamilyName.trim(),
      numberOfFamilyMembers: Number(form.numberOfFamilyMembers),
      isSortingWaste: form.isSortingWaste,
    };

    setSubmitting(true);
    try {
      if (house) {
        const payload: HouseUpdatePayload = {
          ...fields,
          streetName: form.streetName.trim() || null,
          houseNumber: form.houseNumber.trim() || null,
        };
        await houseApi.update(house.id, payload);
        toast.success('Data rumah berhasil diperbarui', {
          description: `Data keluarga ${payload.headOfFamilyName} di ${rtLabel(payload.rt)} telah diperbarui.`,
        });
      } else {
        const currentUser = getStoredUser();
        if (!currentUser) {
          toast.error('Sesi tidak ditemukan', { description: 'Silakan masuk kembali untuk menambahkan rumah.' });
          return;
        }
        const payload: HousePayload = {
          userId: currentUser.id,
          ...fields,
          ...(form.streetName.trim() ? { streetName: form.streetName.trim() } : {}),
          ...(form.houseNumber.trim() ? { houseNumber: form.houseNumber.trim() } : {}),
        };
        await houseApi.create(payload);
        toast.success('Rumah berhasil ditambahkan', {
          description: `Keluarga ${payload.headOfFamilyName} di ${rtLabel(payload.rt)} telah terdata.`,
        });
      }
      onSaved();
    } catch (err) {
      toast.error(isEdit ? 'Gagal memperbarui data rumah' : 'Gagal menyimpan data rumah', {
        description: getErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit Data Rumah' : 'Tambah Rumah'}
      description={
        isEdit ? 'Perbarui data keluarga yang tinggal di rumah ini.' : 'Lengkapi data keluarga yang tinggal di rumah ini.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="house-form" loading={submitting}>
            {!submitting && <Save className="h-4 w-4" />}
            {isEdit ? 'Simpan Perubahan' : 'Simpan Rumah'}
          </Button>
        </>
      }
    >
      <form id="house-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="RT" htmlFor="house-rt" error={errors.rt} required>
            <select
              id="house-rt"
              value={form.rt}
              onChange={(e) => updateField('rt', e.target.value)}
              className={inputClass(!!errors.rt)}
            >
              <option value="">Pilih RT</option>
              {rtOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jumlah Anggota Keluarga" htmlFor="house-members" error={errors.numberOfFamilyMembers} required>
            <input
              id="house-members"
              type="number"
              min={1}
              max={50}
              value={form.numberOfFamilyMembers}
              onChange={(e) => updateField('numberOfFamilyMembers', e.target.value)}
              placeholder="4"
              className={inputClass(!!errors.numberOfFamilyMembers)}
            />
          </Field>
        </div>

        <Field label="Nama Kepala Keluarga" htmlFor="house-head" error={errors.headOfFamilyName} required>
          <div className="relative">
            <Home className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
            <input
              id="house-head"
              type="text"
              value={form.headOfFamilyName}
              onChange={(e) => updateField('headOfFamilyName', e.target.value)}
              placeholder="Bpk. Budi Santoso"
              className={`${inputClass(!!errors.headOfFamilyName)} pl-10`}
            />
          </div>
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Memilah Sampah<span className="ml-0.5 text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Memilah sampah">
            {SORTING_OPTIONS.map(({ value, label }) => {
              const selected = form.isSortingWaste === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => updateField('isSortingWaste', value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                    selected ? SORTING_SELECTED_CLASS[value] : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.isSortingWaste && (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.isSortingWaste}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nama Jalan" htmlFor="house-street" hint="Opsional, contoh: Jl. Mawar">
            <input
              id="house-street"
              type="text"
              value={form.streetName}
              onChange={(e) => updateField('streetName', e.target.value)}
              placeholder="Jl. Mawar"
              className={inputClass()}
            />
          </Field>
          <Field label="Nomor Rumah" htmlFor="house-number" hint="Opsional, contoh: 12A">
            <input
              id="house-number"
              type="text"
              value={form.houseNumber}
              onChange={(e) => updateField('houseNumber', e.target.value)}
              placeholder="12A"
              className={inputClass()}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
