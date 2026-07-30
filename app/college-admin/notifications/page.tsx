"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Send,
  Wifi,
  WifiOff,
  CheckCheck,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Notification, NotificationCreatePayload } from "@/lib/api";
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

const TARGET_ROLES = [
  { value: "student", label: "Students" },
  { value: "faculty", label: "Faculty" },
  { value: "parent", label: "Parents" },
  { value: "warden", label: "Wardens" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "exam_schedule", label: "Exam Schedule" },
  { value: "assignment", label: "Assignment" },
  { value: "fee_reminder", label: "Fee Reminder" },
  { value: "event", label: "Event" },
  { value: "general", label: "General" },
];

const DEFAULT_FILTERS: NotificationFilterState = {
  search: "",
  type: "",
  priority: "",
  unreadOnly: false,
};

export default function CollegeAdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
  } = useNotifications({ limit: 100 });

  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "announcement",
    priority: "normal",
    target_scope: "role" as "all" | "role",
    role: "student",
    action_url: "",
  });

  const sendMutation = useMutation({
    mutationFn: (payload: NotificationCreatePayload) =>
      api.post("/api/v1/notifications", payload),
    onSuccess: () => {
      toast.success("Notification sent");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setForm((f) => ({ ...f, title: "", body: "", action_url: "" }));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSend = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    sendMutation.mutate({
      title: form.title,
      body: form.body,
      type: form.type,
      priority: form.priority,
      target_scope: form.target_scope,
      role: form.target_scope === "role" ? form.role : undefined,
      action_url: form.action_url || undefined,
    });
  };

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
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Notifications">
        <div className="space-y-6">

          {/* Connection status */}
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

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Unread</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{unreadCount}</p><p className="text-xs text-muted-foreground">Notifications</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Total</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{notifications.length}</p><p className="text-xs text-muted-foreground">All notifications</p></CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Send Announcement Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" /> Send Announcement
                </CardTitle>
                <CardDescription>Notify students, faculty, parents, or wardens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="n-title">Title</Label>
                  <Input
                    id="n-title"
                    placeholder="Announcement title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="n-body">Message</Label>
                  <textarea
                    id="n-body"
                    rows={4}
                    placeholder="Write your announcement…"
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Type</Label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Audience</Label>
                    <select
                      value={form.target_scope}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, target_scope: e.target.value as "all" | "role" }))
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Entire College</option>
                      <option value="role">By Role</option>
                    </select>
                  </div>

                  {form.target_scope === "role" && (
                    <div className="space-y-1">
                      <Label>Role</Label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {TARGET_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="n-url">Action URL (optional)</Label>
                  <Input
                    id="n-url"
                    placeholder="/student/assignments"
                    value={form.action_url}
                    onChange={(e) => setForm((f) => ({ ...f, action_url: e.target.value }))}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sendMutation.isPending ? "Sending…" : "Send Notification"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <NotificationFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(DEFAULT_FILTERS)}
                />

                {isLoading ? (
                  <NotificationSkeleton count={4} />
                ) : filtered.length === 0 ? (
                  <NotificationEmptyState
                    hasFilters={hasFilters}
                    onClearFilters={() => setFilters(DEFAULT_FILTERS)}
                  />
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
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
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
