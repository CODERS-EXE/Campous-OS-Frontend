"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Send,
  BarChart3,
  Wifi,
  WifiOff,
  CheckCheck,
  Trash2,
  Radio,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Notification, NotificationAnalytics, NotificationBroadcastPayload } from "@/lib/api";
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
import toast from "react-hot-toast";

const ROLES = [
  { value: "student", label: "Students" },
  { value: "faculty", label: "Faculty" },
  { value: "college_admin", label: "College Admins" },
  { value: "parent", label: "Parents" },
  { value: "warden", label: "Wardens" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const DEFAULT_FILTERS: NotificationFilterState = {
  search: "",
  type: "",
  priority: "",
  unreadOnly: false,
};

export default function SuperAdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();

  // Notification list + actions
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
  } = useNotifications({ limit: 100 });

  // Local filter state
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);

  // Broadcast form state
  const [form, setForm] = useState({
    title: "",
    body: "",
    priority: "normal",
    target_scope: "all" as "all" | "college" | "role",
    target_roles: [] as string[],
    college_id: "",
    action_url: "",
  });

  // Analytics
  const { data: analytics } = useQuery<NotificationAnalytics>({
    queryKey: ["notification-analytics"],
    queryFn: () => api.get<NotificationAnalytics>("/api/v1/notifications/analytics"),
    refetchInterval: 30000,
  });

  // Broadcast mutation
  const broadcastMutation = useMutation({
    mutationFn: (payload: NotificationBroadcastPayload) =>
      api.post("/api/v1/notifications/broadcast", payload),
    onSuccess: () => {
      toast.success("Broadcast sent successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-analytics"] });
      setForm({
        title: "",
        body: "",
        priority: "normal",
        target_scope: "all",
        target_roles: [],
        college_id: "",
        action_url: "",
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      target_roles: f.target_roles.includes(role)
        ? f.target_roles.filter((r) => r !== role)
        : [...f.target_roles, role],
    }));
  };

  const handleBroadcast = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    broadcastMutation.mutate({
      title: form.title,
      body: form.body,
      priority: form.priority,
      target_scope: form.target_scope,
      target_roles: form.target_scope === "role" ? form.target_roles : undefined,
      college_id: form.college_id || undefined,
      action_url: form.action_url || undefined,
    });
  };

  // Apply client-side filters
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
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Platform Notifications">
        <div className="space-y-6">

          {/* ── Connection Status ── */}
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

          {/* ── Analytics Cards ── */}
          {analytics && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Total Sent</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{analytics.total_sent}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Read</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.total_read}</p>
                  <p className="text-xs text-muted-foreground">{analytics.read_rate}% read rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Unread</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{analytics.total_unread}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Live Connections</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.active_connections}</p></CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* ── Broadcast Form ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" /> Broadcast Notification
                </CardTitle>
                <CardDescription>Send to all colleges, a specific college, or by role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="b-title">Title</Label>
                  <Input
                    id="b-title"
                    placeholder="Notification title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="b-body">Message</Label>
                  <textarea
                    id="b-body"
                    rows={3}
                    placeholder="Notification message…"
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Priority</Label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label>Target</Label>
                    <select
                      value={form.target_scope}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          target_scope: e.target.value as "all" | "college" | "role",
                          target_roles: [],
                        }))
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">All Colleges</option>
                      <option value="college">One College</option>
                      <option value="role">By Role</option>
                    </select>
                  </div>
                </div>

                {form.target_scope === "college" && (
                  <div className="space-y-1">
                    <Label htmlFor="b-college">College ID</Label>
                    <Input
                      id="b-college"
                      placeholder="MongoDB ObjectId of college"
                      value={form.college_id}
                      onChange={(e) => setForm((f) => ({ ...f, college_id: e.target.value }))}
                    />
                  </div>
                )}

                {form.target_scope === "role" && (
                  <div className="space-y-1">
                    <Label>Target Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => toggleRole(r.value)}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            form.target_roles.includes(r.value)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="b-url">Action URL (optional)</Label>
                  <Input
                    id="b-url"
                    placeholder="/some/page"
                    value={form.action_url}
                    onChange={(e) => setForm((f) => ({ ...f, action_url: e.target.value }))}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleBroadcast}
                  disabled={broadcastMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {broadcastMutation.isPending ? "Sending…" : "Send Broadcast"}
                </Button>
              </CardContent>
            </Card>

            {/* ── Analytics Breakdown ── */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Notification Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.keys(analytics.type_breakdown).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">By Type</p>
                      <div className="space-y-2">
                        {Object.entries(analytics.type_breakdown)
                          .sort(([, a], [, b]) => b - a)
                          .map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{type.replace(/_/g, " ")}</span>
                              <span className="font-semibold tabular-nums">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(analytics.priority_breakdown).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">By Priority</p>
                      <div className="space-y-2">
                        {Object.entries(analytics.priority_breakdown).map(([priority, count]) => (
                          <div key={priority} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{priority}</span>
                            <span className="font-semibold tabular-nums">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Notification History ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notification History
              </CardTitle>
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
                <NotificationEmptyState
                  hasFilters={hasFilters}
                  onClearFilters={() => setFilters(DEFAULT_FILTERS)}
                />
              ) : (
                <div className="space-y-3">
                  {filtered.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                      showDeleteButton
                      formatDate={formatDate}
                    />
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
