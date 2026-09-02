'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  iconName: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', iconName: 'dashboard' },
  { label: 'Leads', href: '/leads', iconName: 'users' },
  { label: 'Properties', href: '/properties', iconName: 'home' },
  { label: 'Matches', href: '/matches', iconName: 'sparkles', badge: 'Auto' },
  { label: 'Pipeline', href: '/pipeline', iconName: 'kanban' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-slate-200 bg-white p-4">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <div className="flex items-center gap-3">
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
        <div className="font-semibold text-slate-800">Backend API</div>
        <div className="truncate font-mono text-[11px] text-slate-500">
          {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}
        </div>
      </div>
    </aside>
  );
}
