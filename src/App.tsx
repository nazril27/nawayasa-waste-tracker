import { useState } from 'react';
import { Toaster } from 'sonner';
import { AppShell, type PageKey } from '@/components/layout/AppShell';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { HousesPage } from '@/pages/HousesPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PublicDashboardPage } from '@/pages/PublicDashboardPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { WastesPage } from '@/pages/WastesPage';

type AuthView = 'login' | 'register' | 'public-dashboard';

function AppContent() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [page, setPage] = useState<PageKey>('dashboard');

  if (!user) {
    if (authView === 'public-dashboard') {
      return <PublicDashboardPage onBack={() => setAuthView('login')} />;
    }
    return (
      <>
        {authView === 'login' ? (
          <LoginPage onGoToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onGoToLogin={() => setAuthView('login')} />
        )}
        <div className="fixed inset-x-0 bottom-4 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setAuthView('public-dashboard')}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-md transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
          >
            Lihat Dashboard Publik
          </button>
        </div>
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage onNavigate={setPage} />;
      case 'houses':
        return <HousesPage />;
      case 'wastes':
        return <WastesPage />;
      case 'profile':
        return <ProfilePage />;
    }
  };

  return (
    <AppShell activePage={page} onNavigate={setPage}>
      {renderPage()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster richColors position="top-center" closeButton />
    </AuthProvider>
  );
}
