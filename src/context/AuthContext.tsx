'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, AuthSession } from '@/types';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/signup', '/accept-invite'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      if (!token) {
        setUser(null);
        setAccessToken(null);
        setIsLoading(false);
        return;
      }
      setAccessToken(token);
      const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      setUser(userData);
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCurrentUser();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCurrentUser]);

  // Route protection redirect
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && isPublicRoute) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  const login = (session: AuthSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', session.accessToken);
    }
    setAccessToken(session.accessToken);
    setUser(session.user);
    router.push('/');
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    setAccessToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
