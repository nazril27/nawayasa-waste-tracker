import { useState } from 'react';
import { Hash, IdCard, LogOut, Mail, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    toast.success('Anda telah keluar', { description: 'Sampai jumpa lagi di lapangan.' });
  };

  const details = [
    { icon: UserRound, label: 'Nama Lengkap', value: user.name },
    { icon: Hash, label: 'NIM', value: user.nim || '-' },
    { icon: Mail, label: 'Email', value: user.email || 'Belum diisi' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-28 bg-gradient-to-br from-emerald-600 to-emerald-800">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)',
            }}
            aria-hidden="true"
          />
        </div>
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-700 shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <IdCard className="h-4 w-4" />
                  Surveyor KKN
                </p>
              </div>
            </div>
          </div>

          <dl className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="truncate text-sm font-semibold text-slate-900">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex justify-end">
            <Button variant="danger" onClick={handleSignOut} loading={signingOut}>
              {!signingOut && <LogOut className="h-4 w-4" />}
              Keluar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
