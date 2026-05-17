'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import type {ReactNode} from 'react';
import {getCurrentUser, logout as logoutApi} from '@/lib/auth';
import {clearToken} from '@/lib/api';
import type {User} from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await getCurrentUser();
      setUser(me);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getCurrentUser()
      .then((me) => {
        if (isMounted) {
          setUser(me);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          clearToken();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{user, isLoading, refresh, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
