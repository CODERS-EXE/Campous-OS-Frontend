"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { NotificationFilterState } from "@/components/shared/NotificationComponents";
import { useWebSocket } from "./WebSocketContext";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationContextType {
  // Data
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Filters
  filters: NotificationFilterState;
  setFilters: (filters: NotificationFilterState) => void;
  resetFilters: () => void;

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refetch: () => void;

  // Loading states
  isMarkingAllAsRead: boolean;

  // WebSocket
  isConnected: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: NotificationFilterState = {
  search: "",
  type: "",
  priority: "",
  unreadOnly: false,
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [filters, setFilters] =
    useState<NotificationFilterState>(DEFAULT_FILTERS);

  const { isConnected } = useWebSocket();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
    isMarkingAllAsRead,
  } = useNotifications({ limit: 100 });

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  // Apply client-side filters on top of the server-fetched list
  const filteredNotifications = useMemo(() => {
    let result = notifications as Notification[];

    if (filters.unreadOnly) {
      result = result.filter((n) => !n.is_read);
    }

    if (filters.type) {
      result = result.filter((n) => n.type === filters.type);
    }

    if (filters.priority) {
      result = result.filter((n) => n.priority === filters.priority);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.body.toLowerCase().includes(term)
      );
    }

    return result;
  }, [notifications, filters]);

  const value: NotificationContextType = {
    notifications: notifications as Notification[],
    filteredNotifications,
    unreadCount,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
    isMarkingAllAsRead,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useNotificationContext(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used inside NotificationProvider"
    );
  }
  return ctx;
}
