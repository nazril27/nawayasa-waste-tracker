import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Hash, Mail, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { useAuth } from '@/context/AuthContext';

type IdentifierMode = 'nim' | 'email';

interface LoginPageProps {
  onGoToRegister: () => void;
}

export function LoginPage({ onGoToRegister }: LoginPageProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<IdentifierMode>('nim');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: IdentifierMode) => {
    setMode(next);
    setIdentifier('');
    setErrors({});
    setFormError(null);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!identifier.trim()) {
      next.identifier = mode === 'nim' ? 'NIM wajib diisi.' : 'Email wajib diisi.';
    } else if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(identifier.trim())) {
      next.identifier = 'Format email tidak valid.';
    }
    if (!password) next.password = 'Password wajib diisi.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await authApi.login({ identifier: identifier.trim(), password });
      signIn(user);
      toast.success(`Selamat datang, ${user.name}!`);
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error('Login gagal', { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Gunakan NIM atau email yang sudah terdaftar."
      footer={
        <>
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
          >
            Daftar sekarang
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Metode masuk">
            {(['nim', 'email'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={mode === option}
                onClick={() => switchMode(option)}
                className={`rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                  mode === option ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option === 'nim' ? 'Masuk dengan NIM' : 'Masuk dengan Email'}
              </button>
            ))}
          </div>
        </div>

        <Field label={mode === 'nim' ? 'NIM' : 'Email'} htmlFor="identifier" error={errors.identifier} required>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              {mode === 'nim' ? <Hash className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            </span>
            <input
              id="identifier"
              type={mode === 'email' ? 'email' : 'text'}
              autoComplete={mode === 'email' ? 'email' : 'username'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === 'nim' ? 'Contoh: 2110511001' : 'nama@email.com'}
              className={`${inputClass(!!errors.identifier)} pl-10`}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password} required>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
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

        {formError && (
          <div
            role="alert"
            className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {!submitting && <LogIn className="h-4 w-4" />}
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
