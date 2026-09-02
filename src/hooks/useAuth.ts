'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthSession } from '@/types';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }
      const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      setUser(userData);
    } catch {
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAuth() {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        const userData = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
        if (isMounted) {
          setUser(userData);
        }
      } catch {
        localStorage.removeItem('auth_token');
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (session: AuthSession) => {
    localStorage.setItem('auth_token', session.accessToken);
    setUser(session.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    login,
    logout,
    refreshUser: fetchCurrentUser,
  };
}
