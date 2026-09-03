'use client';

import React, { useState } from 'react';
import { Search, Bell, Sparkles, HelpCircle, LogOut, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';

export interface TopBarProps {
  userName?: string;
  userRole?: 'ADMIN' | 'AGENT';
  userEmail?: string;
  unreadCount?: number;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export function TopBar({
  userName = 'Alex Mercer',
  userRole = 'AGENT',
  userEmail = 'alex.mercer@estatenexus.com',
  unreadCount = 1,
  onSearch,
  onLogout,
  onMenuToggle,
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="cursor-pointer rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar matching Reference */}
        <div className="hidden w-80 items-center rounded-full border border-slate-200 bg-slate-100/80 px-4 py-2 transition-all focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/10 md:flex md:w-96">
          <Search className="mr-2.5 h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search leads, properties, or agents..."
            className="w-full border-none bg-transparent text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-rose-600" />
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
                      <span>Hot Match Alert</span>
                    </div>
                    <MatchScoreBadge score={92} size="sm" />
                  </div>
                  <p className="mt-1 text-xs leading-snug text-slate-600">
                    Lead &quot;Sarah Johnson&quot; has a 92% match with &quot;Sunrise Apartments,
                    3BHK&quot;.
                  </p>
                  <span className="mt-1 block text-[10px] text-slate-400">5 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <button
          className="hidden cursor-pointer rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 md:flex"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* User Profile Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
              {userInitials}
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs font-bold text-slate-900">{userName}</p>
                <p className="truncate text-xs text-slate-500">{userEmail}</p>
                <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {userRole}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={onLogout}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
