import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { clearStoredUser, getStoredUser, storeUser } from '@/lib/session';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const signIn = useCallback((next: User) => {
    storeUser(next);
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The backend keeps no session, so the local sign-out still applies if the call fails.
    }
    clearStoredUser();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
