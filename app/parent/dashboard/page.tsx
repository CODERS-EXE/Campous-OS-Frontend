"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Bell, Bus, Calendar, GraduationCap, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Attendance, Notification, Result, Student } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function ParentDashboard() {
  const { user } = useAuthStore();

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students", "all"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
    enabled: !!user,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "all"],
    queryFn: () => api.get<Attendance[]>("/api/v1/attendance/mine"),
    enabled: !!user,
  });

  const myChildren = useMemo(() => {
    if (!user?.profile?.student_ids || !studentsQuery.data) return [];
    const childIds = user.profile.student_ids as string[];
    return studentsQuery.data.filter((student) => childIds.includes(student.user_id));
  }, [user, studentsQuery.data]);

  const unreadNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => !n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const childrenStats = useMemo(() => {
    return myChildren.map((child) => {
      const childAttendanceRecords: Array<{ status: string }> = [];
      attendanceQuery.data?.forEach((attendance) => {
        const record = attendance.records.find((r) => r.student_id === child.user_id);
        if (record) {
          childAttendanceRecords.push({ status: record.status });
        }
      });

      const present = childAttendanceRecords.filter((r) => r.status === "present").length;
      const total = childAttendanceRecords.length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0";

      return {
        id: child.user_id,
        name: child.name,
        roll_no: child.roll_no,
        department: child.department,
        year: child.year,
        attendancePercentage: percentage,
        totalSessions: total,
      };
    });
  }, [myChildren, attendanceQuery.data]);

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title={`Welcome, ${user?.name?.split(" ")[0] || "Parent"}`}>
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your children&apos;s overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Children</p>
                  <p className="mt-2 text-2xl font-semibold">{myChildren.length}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Notifications</p>
                  <p className="mt-2 text-2xl font-semibold">{unreadNotifications.length}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {childrenStats.reduce((sum, child) => sum + child.totalSessions, 0)}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {childrenStats.length > 0
                      ? (
                          childrenStats.reduce((sum, child) => sum + parseFloat(child.attendancePercentage), 0) /
                          childrenStats.length
                        ).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Children Overview</CardTitle>
              <CardDescription>Quick view of your children&apos;s information</CardDescription>
            </CardHeader>
            <CardContent>
              {studentsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading children...</p>
              )}
              {!studentsQuery.isLoading && myChildren.length === 0 && (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No children linked to your account.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please contact your college administrator.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {childrenStats.map((child) => (
                  <div key={child.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tenant/10">
                          <GraduationCap className="h-6 w-6 text-tenant" />
                        </div>
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {child.department} • Year {child.year}
                          </p>
                          <p className="text-xs text-muted-foreground">Roll: {child.roll_no}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{child.attendancePercentage}%</p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <Bus className="h-5 w-5" /> Bus Tracking
              </CardTitle>
              <CardDescription>Track your children&apos;s bus location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-xl bg-muted/50">
                <p className="text-center text-sm text-muted-foreground">
                  Live bus tracking available soon
                  <br />
                  <span className="text-xs">(Phase 3 - WebSocket + Maps)</span>
                </p>
              </div>
              <Button asChild variant="secondary" className="mt-4 w-full">
                <a href="/parent/bus">View Bus Tracking</a>
              </Button>
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
                  <a href="/parent/children" className="flex items-center justify-between gap-2">
                    My Children <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/parent/attendance" className="flex items-center justify-between gap-2">
                    Attendance <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/parent/results" className="flex items-center justify-between gap-2">
                    Results <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/parent/notifications" className="flex items-center justify-between gap-2">
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
