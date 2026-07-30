"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle, RefreshCcw } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Notification } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function FacultyNotificationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => api.post<{ ok: boolean }>(`/api/v1/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Notifications">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Stay updated with the latest announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">Total notifications: {notificationsQuery.data?.length ?? 0}</p>
                <Button variant="outline" size="sm" onClick={() => notificationsQuery.refetch()}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
              {notificationsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
              {!notificationsQuery.isLoading && notificationsQuery.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">No notifications available.</p>
              )}
              <div className="space-y-3">
                {notificationsQuery.data?.map((notification) => (
                  <div key={notification.id} className={`rounded-xl border p-4 transition ${notification.is_read ? "border-border bg-background" : "border-tenant bg-tenant/5"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(notification.created_at)}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs uppercase tracking-wide">
                          {notification.is_read ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read ? (
                      <div className="mt-4">
                        <Button variant="secondary" size="sm" onClick={() => markReadMutation.mutate(notification.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark as read
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
