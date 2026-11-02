import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';

interface RegisterPageProps {
  onGoToLogin: () => void;
}

interface RegisterForm {
  name: string;
  nim: string;
  password: string;
  email: string;
}

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const EMPTY_FORM: RegisterForm = { name: '', nim: '', password: '', email: '' };

export function RegisterPage({ onGoToLogin }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const updateField = (field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): RegisterErrors => {
    const next: RegisterErrors = {};
    if (!form.name.trim()) next.name = 'Nama lengkap wajib diisi.';
    if (!form.nim.trim()) next.nim = 'NIM wajib diisi.';
    if (!form.password) next.password = 'Password wajib diisi.';
    else if (form.password.length < 6) next.password = 'Password minimal 6 karakter.';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'Format email tidak valid.';
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        nim: form.nim.trim(),
        password: form.password,
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
      });
      toast.success('Akun berhasil dibuat', { description: 'Silakan masuk dengan akun baru Anda.' });
      setForm(EMPTY_FORM);
      onGoToLogin();
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error('Pendaftaran gagal', { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Buat Akun"
      subtitle="Daftarkan diri Anda sebagai surveyor KKN."
      footer={
        <>
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
          >
            Masuk
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Nama Lengkap" htmlFor="name" error={errors.name} required>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nama sesuai KTM"
            className={inputClass(!!errors.name)}
          />
        </Field>

        <Field label="NIM" htmlFor="nim" error={errors.nim} required>
          <input
            id="nim"
            type="text"
            inputMode="numeric"
            value={form.nim}
            onChange={(e) => updateField('nim', e.target.value)}
            placeholder="Contoh: 2110511001"
            className={inputClass(!!errors.nim)}
          />
        </Field>

        <Field label="Password" htmlFor="register-password" error={errors.password} required hint="Minimal 6 karakter.">
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Buat password"
              className={`${inputClass(!!errors.password)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute inset-y-0 right-2 flex items-center rounded-lg px-2 text-slate-400 transition-colors hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field label="Email" htmlFor="register-email" error={errors.email} hint="Opsional.">
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="nama@email.com"
            className={inputClass(!!errors.email)}
          />
        </Field>

        {formError && (
          <div
            role="alert"
            className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {!submitting && <UserPlus className="h-4 w-4" />}
          Daftar
        </Button>
      </form>
    </AuthLayout>
  );
}
