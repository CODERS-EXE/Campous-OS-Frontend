"use client";

import { BellOff, Search, SlidersHorizontal, Trash2, CheckCircle2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getNotificationTypeIcon, getPriorityBadgeStyle } from "./NotificationDropdown";

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
    <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filter Notifications</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notification title or content..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-10 h-10 rounded-2xl border-border/60 bg-background/60 text-sm focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="flex h-10 w-full items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {NOTIFICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          className="flex h-10 w-full items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Unread Toggle */}
        <div className="flex items-center sm:col-span-2 lg:col-span-1">
          <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none rounded-2xl border border-border/60 bg-background/60 px-4 h-10 w-full hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={filters.unreadOnly}
              onChange={(e) =>
                onChange({ ...filters, unreadOnly: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span>Unread Only</span>
          </label>
        </div>
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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border/60 bg-card/40 backdrop-blur-md">
      <div className="rounded-2xl bg-primary/10 p-5 mb-4 text-primary">
        <BellOff className="h-10 w-10 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold tracking-tight mb-1">
        {hasFilters ? "No matching notifications" : "All caught up!"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-4">
        {hasFilters
          ? "No notifications match your current filter criteria. Try adjusting your search query or reset filters."
          : "You have no notifications right now. New campus announcements, assignments, and alerts will appear here."}
      </p>
      {hasFilters && onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl font-semibold shadow-sm"
          onClick={onClearFilters}
        >
          Clear Active Filters
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
          className="flex items-start gap-4 rounded-3xl border border-border/60 bg-card/60 p-5"
        >
          <Skeleton className="h-10 w-10 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-44 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded-lg" />
            <Skeleton className="h-3 w-2/3 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationItem
// ─────────────────────────────────────────────────────────────────────────────

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
  const { icon, color } = getNotificationTypeIcon(notification.type);
  const priorityBadgeStyle = getPriorityBadgeStyle(notification.priority);

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 shadow-sm hover:shadow-md ${
        !notification.is_read
          ? "bg-primary/5 border-primary/30 dark:bg-primary/10 shadow-sm"
          : "bg-card/70 border-border/60 hover:bg-card/90"
      }`}
    >
      {/* Unread Accent Line */}
      {!notification.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full" />
      )}

      <div className="flex items-start gap-4">
        {/* Type Icon Badge */}
        <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${color}`}>
          {icon}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                UNREAD
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            {notification.body}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {formatDate(notification.created_at)}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${priorityBadgeStyle}`}>
              {notification.priority}
            </span>
            <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
              {notification.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-3">
        {!notification.is_read && onMarkRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkRead(notification.id)}
            className="h-8 text-xs font-semibold rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
            Mark Read
          </Button>
        )}
        {notification.action_url && (
          <Button
            variant="default"
            size="sm"
            asChild
            className="h-8 text-xs font-semibold rounded-xl"
          >
            <a href={notification.action_url} className="inline-flex items-center gap-1">
              View Details <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
        {showDeleteButton && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification.id)}
            className="h-8 text-xs font-semibold rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
