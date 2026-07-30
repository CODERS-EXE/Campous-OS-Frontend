"use client";

import { useMemo, useState } from "react";
import { Bell, BellOff, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useWebSocket } from "@/lib/contexts/WebSocketContext";
import { formatDate } from "@/lib/utils";

export default function StudentNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const { isConnected } = useWebSocket();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.is_read),
    [notifications]
  );

  const readNotifications = useMemo(
    () => notifications.filter((n) => n.is_read),
    [notifications]
  );

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
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
    return icons[type] || "📬";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200";
      case "normal":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200";
      case "low":
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Notifications">
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    Live updates active
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-muted-foreground">
                    Connecting to live updates...
                  </span>
                </>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Unread</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">New notifications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{notifications.length}</p>
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
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              )}
              {!isLoading && unreadNotifications.length === 0 && (
                <div className="py-8 text-center">
                  <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No unread notifications.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-xl border border-tenant/20 bg-tenant/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
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
                          <span className="text-xs text-muted-foreground capitalize">
                            {notification.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        disabled={isMarkingAsRead}
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
                        <CheckCheck className="h-4 w-4 text-green-600 mt-1" />
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
