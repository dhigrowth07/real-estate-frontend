'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar navigation */}
      <Sidebar className="fixed inset-y-0 left-0 z-40 hidden lg:flex" />

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
