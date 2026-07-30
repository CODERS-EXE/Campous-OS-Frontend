"use client";

import { useState } from "react";
import { Bell, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Notification } from "@/lib/api";
import { useWebSocket } from "@/lib/contexts/WebSocketContext";
import { useNotifications } from "@/lib/hooks/useNotifications";
import {
  NotificationFilters,
  NotificationEmptyState,
  NotificationSkeleton,
  NotificationItem,
  type NotificationFilterState,
} from "@/components/shared/NotificationComponents";
import { formatDate } from "@/lib/utils";

const DEFAULT_FILTERS: NotificationFilterState = {
  search: "",
  type: "",
  priority: "",
  unreadOnly: false,
};

export default function ParentNotificationsPage() {
  const { isConnected } = useWebSocket();
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications({ limit: 100 });

  const filtered = (notifications as Notification[]).filter((n) => {
    if (filters.unreadOnly && n.is_read) return false;
    if (filters.type && n.type !== filters.type) return false;
    if (filters.priority && n.priority !== filters.priority) return false;
    if (filters.search) {
      const t = filters.search.toLowerCase();
      if (!n.title.toLowerCase().includes(t) && !n.body.toLowerCase().includes(t)) return false;
    }
    return true;
  });

  const hasFilters = !!(filters.search || filters.type || filters.priority || filters.unreadOnly);

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Notifications">
        <div className="space-y-6">

          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <><Wifi className="h-4 w-4 text-green-500" /><span className="text-muted-foreground">Live updates active</span></>
              ) : (
                <><WifiOff className="h-4 w-4 text-gray-400" /><span className="text-muted-foreground">Connecting…</span></>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllAsRead()} disabled={isMarkingAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read ({unreadCount})
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Unread</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{unreadCount}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{notifications.length}</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> All Notifications</CardTitle>
              <CardDescription>Attendance, results, fees, library, bus, and emergency alerts for your child</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
              />
              {isLoading ? (
                <NotificationSkeleton count={5} />
              ) : filtered.length === 0 ? (
                <NotificationEmptyState hasFilters={hasFilters} onClearFilters={() => setFilters(DEFAULT_FILTERS)} />
              ) : (
                <div className="space-y-3">
                  {filtered.map((n) => (
                    <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} formatDate={formatDate} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
