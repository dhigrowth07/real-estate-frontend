'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/hooks/useAuth';

export interface AppLayoutProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = ['/login', '/signup', '/accept-invite'];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar navigation */}
      <Sidebar className="fixed inset-y-0 left-0 z-40 hidden lg:flex" />

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <TopBar
          userName={user?.name || 'User'}
          userRole={user?.role || 'AGENT'}
          userEmail={user?.email || ''}
          onLogout={logout}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
