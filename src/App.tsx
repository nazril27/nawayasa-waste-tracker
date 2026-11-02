import { useState } from 'react';
import { Toaster } from 'sonner';
import { AppShell, type PageKey } from '@/components/layout/AppShell';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardPage } from '@/pages/DashboardPage';
import { HousesPage } from '@/pages/HousesPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { WastesPage } from '@/pages/WastesPage';

type AuthView = 'login' | 'register';

function AppContent() {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [page, setPage] = useState<PageKey>('dashboard');

  if (!user) {
    return authView === 'login' ? (
      <LoginPage onGoToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onGoToLogin={() => setAuthView('login')} />
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
