'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Notification } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<any>(API_ENDPOINTS.NOTIFICATIONS.LIST, { limit: 10 });
      
      // Backend returns either an array or { notifications: [], unreadCount: number, total: number }
      if (Array.isArray(res)) {
        setNotifications(res);
        setUnreadCount(res.filter((n) => !n.isRead).length);
      } else if (res && typeof res === 'object') {
        const list = Array.isArray(res.notifications)
          ? res.notifications
          : Array.isArray(res.data)
            ? res.data
            : [];
        setNotifications(list);
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        } else {
          setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
        }
      }
    } catch {
      // Gracefully handle unauthenticated/network errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.get<{ unreadCount: number }>(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
      );
      if (typeof res?.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Ignore
    }
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    } catch {
      // Revert if error
      void fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch {
      void fetchNotifications();
    }
  };

  useEffect(() => {
    void fetchNotifications();
    void fetchUnreadCount();

    // Poll periodically every 30 seconds for live updates
    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
