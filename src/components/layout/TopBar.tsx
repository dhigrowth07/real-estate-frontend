'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Sparkles, HelpCircle, LogOut, Menu, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { MatchScoreBadge } from '@/components/ui/MatchScoreBadge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatTimeAgo, cn } from '@/lib/utils';

export interface TopBarProps {
  userName?: string;
  userRole?: 'ADMIN' | 'AGENT';
  userEmail?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export function TopBar({
  userName = 'Alex Mercer',
  userRole = 'AGENT',
  userEmail = 'alex.mercer@infragen.io',
  onSearch,
  onLogout,
  onMenuToggle,
}: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading: isNotificationsLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      void markAsRead(n.id);
    }
    setShowNotifications(false);

    const matchId = n.matchId || n.match?.id || (n.metadata as any)?.matchId;
    const leadId = (n.metadata as any)?.leadId || n.match?.leadId;
    const propertyId = (n.metadata as any)?.propertyId || n.match?.propertyId;

    const params = new URLSearchParams();
    if (matchId) params.set('matchId', matchId);
    if (leadId) params.set('leadId', leadId);
    if (propertyId) params.set('propertyId', propertyId);

    const queryString = params.toString();
    router.push(queryString ? `/matches?${queryString}` : '/matches');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      void fetchNotifications();
    }
    setShowNotifications((prev) => !prev);
  };

  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 shadow-2xs backdrop-blur-md md:px-6">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden w-80 items-center rounded-full border border-slate-300/80 bg-slate-100/90 px-4 py-2 shadow-2xs transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/15 md:flex md:w-96">
          <Search className="mr-2.5 h-4 w-4 shrink-0 text-slate-500" />
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
        {/* Notification Bell & Live Alerts Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative cursor-pointer rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
              </span>
            )}
          </button>

          {/* Real-time Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-92 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Alerts & Notifications</h4>
                  {unreadCount > 0 ? (
                    <Badge variant="primary" size="sm">
                      {unreadCount} new
                    </Badge>
                  ) : null}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => void markAllAsRead()}
                    className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List Container */}
              <div className="mt-3 max-h-[380px] space-y-2 overflow-y-auto pr-0.5">
                {isNotificationsLoading && notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span>Loading alerts...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <Bell className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                    <p className="font-bold text-slate-700">No alerts yet</p>
                    <p className="mx-auto mt-1 max-w-[220px] text-[11px] text-slate-400">
                      Real-time match alerts and system notifications will automatically appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const score =
                      n.metadata && typeof (n.metadata as any).score === 'number'
                        ? Number((n.metadata as any).score)
                        : null;

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          'group relative cursor-pointer rounded-xl border p-3 transition-all hover:border-slate-300 hover:shadow-xs',
                          n.isRead
                            ? 'border-slate-100 bg-white text-slate-700 opacity-80'
                            : 'border-blue-200/80 bg-blue-50/40 text-slate-900 ring-1 ring-blue-600/10'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                            <span className="truncate">{n.title}</span>
                          </div>
                          {score !== null && <MatchScoreBadge score={score} size="sm" />}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {n.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between border-t border-slate-100/60 pt-1.5 text-[10px] text-slate-400">
                          <span>{formatTimeAgo(n.createdAt)}</span>
                          {!n.isRead && (
                            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2 text-center">
                  <Link
                    href="/matches"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View All Matches &rarr;
                  </Link>
                </div>
              )}
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
        <div className="relative" ref={profileRef}>
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
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5">
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
