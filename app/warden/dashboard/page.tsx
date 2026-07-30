"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, CheckCircle2, Clock, Home, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, HostelStudent, Notification, Outpass, Room } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function WardenDashboard() {
  const { user } = useAuthStore();

  const studentsQuery = useQuery<HostelStudent[]>({
    queryKey: ["hostel-students", "all"],
    queryFn: () => api.get<HostelStudent[]>("/api/v1/hostel/students"),
    enabled: !!user,
  });

  const roomsQuery = useQuery<Room[]>({
    queryKey: ["rooms", "all"],
    queryFn: () => api.get<Room[]>("/api/v1/hostel/rooms"),
    enabled: !!user,
  });

  const outpassesQuery = useQuery<Outpass[]>({
    queryKey: ["outpasses", "all"],
    queryFn: () => api.get<Outpass[]>("/api/v1/hostel/outpasses"),
    enabled: !!user,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const pendingOutpasses = useMemo(
    () => outpassesQuery.data?.filter((o) => o.status === "pending") ?? [],
    [outpassesQuery.data]
  );

  const unreadNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => !n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const totalStudents = studentsQuery.data?.length || 0;
  const totalRooms = roomsQuery.data?.length || 0;
  const occupiedRooms = roomsQuery.data?.filter((r) => r.occupied > 0).length || 0;
  const availableRooms = roomsQuery.data?.filter((r) => r.is_available && r.occupied < r.capacity).length || 0;

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title={`Welcome, ${user?.name?.split(" ")[0] || "Warden"}`}>
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Statistics</CardTitle>
              <CardDescription>Overview of hostel operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="mt-2 text-2xl font-semibold">{totalStudents}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Total Rooms</p>
                  <p className="mt-2 text-2xl font-semibold">{totalRooms}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Occupied Rooms</p>
                  <p className="mt-2 text-2xl font-semibold">{occupiedRooms}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Available Rooms</p>
                  <p className="mt-2 text-2xl font-semibold">{availableRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Pending Outpass Requests</CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {outpassesQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading outpass requests...</p>
              )}
              {!outpassesQuery.isLoading && pendingOutpasses.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  No pending outpass requests!
                </div>
              )}
              <div className="space-y-3">
                {pendingOutpasses.slice(0, 3).map((outpass) => (
                  <div key={outpass.id} className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{outpass.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Roll: {outpass.student_roll_no}
                        </p>
                        <p className="mt-1 text-sm">{outpass.reason}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(outpass.from_date)} - {formatDate(outpass.to_date)}
                        </p>
                      </div>
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                ))}
              </div>
              {pendingOutpasses.length > 3 && (
                <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
                  <a href="/warden/outpasses">
                    View All {pendingOutpasses.length} Pending Requests
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notices and announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificationsQuery.isLoading && (
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                )}
                {!notificationsQuery.isLoading && (notificationsQuery.data?.length || 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                )}
                {notificationsQuery.data?.slice(0, 4).map((notification) => (
                  <div key={notification.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {notification.priority}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-tenant">
                        <Bell className="h-3 w-3" /> New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" /> Hostel Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="mt-2 text-2xl font-semibold text-orange-600">
                    {pendingOutpasses.length}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Unread Notices</p>
                  <p className="mt-2 text-2xl font-semibold">{unreadNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to important sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                <Button asChild variant="secondary" className="w-full">
                  <a href="/warden/outpasses" className="flex items-center justify-between gap-2">
                    Outpasses <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/warden/students" className="flex items-center justify-between gap-2">
                    Students <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/warden/rooms" className="flex items-center justify-between gap-2">
                    Rooms <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/warden/notifications" className="flex items-center justify-between gap-2">
                    Notifications <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
