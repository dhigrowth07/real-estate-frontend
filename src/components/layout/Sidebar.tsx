'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Sparkles,
  Kanban,
  UserPlus,
  Settings,
  Building,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Matches & Alerts', href: '/matches', icon: Sparkles, badge: 'AI' },
  { name: 'Pipeline', href: '/pipeline', icon: Kanban },
  { name: 'Team & Invites', href: '/team', icon: UserPlus },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-700',
        className
      )}
    >
      {/* Agency Branding / Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
          <Building className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base leading-tight font-bold tracking-tight text-slate-900">
            Infragen Real Estate
          </h1>
          <p className="text-xs font-medium text-slate-500">Matching CRM</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 transition-colors',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">Single-Tenant Active</span>
          </div>
          <p className="mt-1 text-[11px] leading-tight text-slate-500">
            Matching Engine v1.0 • Phase 1 MVP
          </p>
        </div>
      </div>
    </aside>
  );
}
