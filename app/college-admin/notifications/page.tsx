"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Notification } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function CollegeAdminNotificationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/v1/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => !n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const readNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200";
      case "low":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Notifications">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Unread</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{unreadNotifications.length}</p>
                <p className="text-xs text-muted-foreground">New notifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{notificationsQuery.data?.length || 0}</p>
                <p className="text-xs text-muted-foreground">All notifications</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Unread Notifications
              </CardTitle>
              <CardDescription>New notifications require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              )}
              {!notificationsQuery.isLoading && unreadNotifications.length === 0 && (
                <div className="py-8 text-center">
                  <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">No unread notifications.</p>
                </div>
              )}
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-xl border border-tenant/20 bg-tenant/5 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-tenant" />
                          <p className="font-semibold">{notification.title}</p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{notification.body}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markReadMutation.mutate(notification.id)}
                        disabled={markReadMutation.status === "pending"}
                      >
                        <CheckCheck className="mr-2 h-4 w-4" /> Mark Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {readNotifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCheck className="h-5 w-5" /> Read Notifications
                </CardTitle>
                <CardDescription>Previously viewed notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {readNotifications.map((notification) => (
                    <div key={notification.id} className="rounded-xl border p-4 opacity-70">
                      <div className="flex items-start gap-3">
                        <CheckCheck className="mt-1 h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.created_at)}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
