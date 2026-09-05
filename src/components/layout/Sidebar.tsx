'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UserSearch,
  Building2,
  BellRing,
  Kanban,
  MessageSquare,
  Users2,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Leads', href: '/leads', icon: UserSearch },
  { name: 'Inventory', href: '/properties', icon: Building2 },
  { name: 'Matches', href: '/matches', icon: BellRing },
  { name: 'Pipeline', href: '/pipeline', icon: Kanban },
  { name: 'Team', href: '/team', icon: Users2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const userInitials = (user?.name || 'Alex Mercer')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        'z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-800',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-18 items-center gap-3.5 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-xs">
          IG
        </div>
        <div>
          <h1 className="text-lg leading-tight font-bold tracking-tight text-blue-700">Infragen</h1>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Professional Suite
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150',
                isActive
                  ? 'border-l-4 border-blue-600 bg-blue-50/70 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-blue-600' : 'text-slate-400'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-sm font-bold text-blue-700 shadow-xs">
            {userInitials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold text-slate-900">
              {user?.name || 'Alex Mercer'}
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {user?.role === 'ADMIN' ? 'Agency Admin' : 'Senior Agent'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
