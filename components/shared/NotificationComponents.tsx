"use client";

import { BellOff, Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationFilterState {
  search: string;
  type: string;
  priority: string;
  unreadOnly: boolean;
}

interface NotificationFiltersProps {
  filters: NotificationFilterState;
  onChange: (filters: NotificationFilterState) => void;
  onReset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationFilters
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  { value: "", label: "All Types" },
  { value: "assignment", label: "Assignments" },
  { value: "attendance", label: "Attendance" },
  { value: "results", label: "Results" },
  { value: "fee_reminder", label: "Fees" },
  { value: "outpass", label: "Outpass" },
  { value: "hostel_room", label: "Hostel" },
  { value: "announcement", label: "Announcements" },
  { value: "broadcast", label: "Broadcasts" },
  { value: "placement", label: "Placements" },
  { value: "exam_schedule", label: "Exams" },
  { value: "deadline", label: "Deadlines" },
  { value: "system", label: "System" },
  { value: "general", label: "General" },
];

const PRIORITIES = [
  { value: "", label: "All Priorities" },
  { value: "urgent", label: "🚨 Urgent" },
  { value: "high", label: "⚠️ High" },
  { value: "normal", label: "📬 Normal" },
  { value: "low", label: "📨 Low" },
];

export function NotificationFilters({
  filters,
  onChange,
  onReset,
}: NotificationFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.type || filters.priority || filters.unreadOnly;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filter Notifications</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Type filter */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        {/* Unread toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(e) =>
              onChange({ ...filters, unreadOnly: e.target.checked })
            }
            className="rounded border-input"
          />
          <span>Unread only</span>
        </label>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationEmptyState
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function NotificationEmptyState({
  hasFilters = false,
  onClearFilters,
}: NotificationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <BellOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {hasFilters ? "No matching notifications" : "All caught up!"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {hasFilters
          ? "No notifications match your current filters. Try adjusting or clearing them."
          : "You have no notifications right now. New ones will appear here."}
      </p>
      {hasFilters && onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onClearFilters}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationSkeleton
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationSkeletonProps {
  count?: number;
}

export function NotificationSkeleton({ count = 5 }: NotificationSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border p-4"
        >
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationItem – reusable notification list item
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  assignment: "📝",
  attendance: "✅",
  results: "📊",
  fee_reminder: "💰",
  outpass: "🎫",
  hostel_room: "🏠",
  announcement: "📢",
  broadcast: "📣",
  placement: "💼",
  exam_schedule: "📅",
  timetable: "🕐",
  leave: "🏖️",
  event: "🎉",
  deadline: "⏰",
  system: "⚙️",
  general: "📬",
};

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    priority: string;
    created_at: string;
    is_read: boolean;
    action_url?: string;
  };
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
  formatDate: (date: string) => string;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  showDeleteButton = false,
  formatDate,
}: NotificationItemProps) {
  const icon = TYPE_ICONS[notification.type] ?? "📬";
  const badge = PRIORITY_BADGE[notification.priority] ?? PRIORITY_BADGE.normal;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        !notification.is_read
          ? "bg-blue-50/60 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm">{notification.title}</p>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {notification.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDate(notification.created_at)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${badge}`}
            >
              {notification.priority}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {notification.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2 justify-end">
        {!notification.is_read && onMarkRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkRead(notification.id)}
            className="text-xs"
          >
            Mark read
          </Button>
        )}
        {notification.action_url && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs"
          >
            <a href={notification.action_url}>View</a>
          </Button>
        )}
        {showDeleteButton && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="text-xs text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
