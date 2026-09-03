'use client';

import React, { useState } from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';

export interface TopBarProps {
  userName?: string;
  userRole?: 'ADMIN' | 'AGENT';
  userEmail?: string;
  unreadCount?: number;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export function TopBar({
  userName = 'Admin User',
  userRole = 'ADMIN',
  userEmail = 'admin@infragen.com',
  unreadCount = 2,
  onSearch,
  onLogout,
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur-xs">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search leads, properties, phones..."
          className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-4 pl-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:outline-hidden"
        />
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Preview */}
          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-84 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Alerts & Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="primary" size="sm">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span>High Match Alert</span>
                    </div>
                    <MatchScoreBadge score={100} size="sm" />
                  </div>
                  <p className="mt-1 text-xs leading-snug text-slate-600">
                    Lead &quot;Vipul Sharma&quot; matches Property &quot;3BHK Villa
                    Whitefield&quot;.
                  </p>
                  <span className="mt-1 block text-[10px] text-slate-400">2 mins ago</span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      <span>Match Compatibility</span>
                    </div>
                    <MatchScoreBadge score={85} size="sm" />
                  </div>
                  <p className="mt-1 text-xs leading-snug text-slate-600">
                    Lead &quot;Kavita Rao&quot; matches Property &quot;Indiranagar Flat&quot;.
                  </p>
                  <span className="mt-1 block text-[10px] text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm leading-tight font-bold text-slate-900">{userName}</span>
                <span
                  className={
                    userRole === 'ADMIN'
                      ? 'rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700'
                      : 'rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700'
                  }
                >
                  {userRole}
                </span>
              </div>
              <span className="text-xs text-slate-500">{userEmail}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-semibold text-slate-900">{userName}</p>
                <p className="truncate text-xs text-slate-500">{userEmail}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={onLogout}
                  className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
