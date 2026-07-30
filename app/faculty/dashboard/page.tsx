"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ClipboardList, Clock, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Assignment, Attendance, DashboardStats, Notification, TimetableEntry } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function FacultyDashboard() {
  const { user } = useAuthStore();

  const statsQuery = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/api/v1/users/dashboard/stats"),
    enabled: !!user,
  });

  const timetableQuery = useQuery<TimetableEntry[]>({
    queryKey: ["timetable", user?.id],
    queryFn: () => api.get<TimetableEntry[]>(`/api/v1/timetable/faculty/${user?.id}`),
    enabled: !!user?.id,
  });

  const assignmentsQuery = useQuery<Assignment[]>({
    queryKey: ["assignments", "faculty"],
    queryFn: () => api.get<Assignment[]>("/api/v1/assignments?limit=5"),
    enabled: !!user,
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "mine"],
    queryFn: () => api.get<Attendance[]>("/api/v1/attendance/mine"),
    enabled: !!user,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const today = useMemo(() => {
    const now = new Date();
    return now.getDay();
  }, []);

  const todayClasses = useMemo(() => {
    return timetableQuery.data?.filter((entry) => entry.day_of_week === ((today + 6) % 7)) ?? [];
  }, [today, timetableQuery.data]);

  const pendingAssignments = useMemo(() => {
    return assignmentsQuery.data?.filter((assignment) => assignment.published && assignment.due_date && new Date(assignment.due_date) >= new Date()) ?? [];
  }, [assignmentsQuery.data]);

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Faculty Dashboard">
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>College scoped metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="mt-2 text-2xl font-semibold">{statsQuery.data?.total_students ?? "—"}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Assigned Classes</p>
                  <p className="mt-2 text-2xl font-semibold">{todayClasses.length}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Unread Notifications</p>
                  <p className="mt-2 text-2xl font-semibold">{statsQuery.data?.unread_notifications ?? "—"}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Attendance Sessions</p>
                  <p className="mt-2 text-2xl font-semibold">{attendanceQuery.data?.length ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Today&apos;s Timetable</CardTitle>
              <CardDescription>Classes scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timetableQuery.isLoading && <p className="text-sm text-muted-foreground">Loading timetable...</p>}
                {!timetableQuery.isLoading && todayClasses.length === 0 && <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>}
                {todayClasses.map((entry) => (
                  <div key={entry.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{entry.subject}</p>
                        <p className="text-sm text-muted-foreground">{entry.classroom || "No classroom"}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {entry.start_time} - {entry.end_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Due assignments from your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignmentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
                {!assignmentsQuery.isLoading && pendingAssignments.length === 0 && (
                  <p className="text-sm text-muted-foreground">No pending assignments.</p>
                )}
                {pendingAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border p-4">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.subject || "General"}</p>
                    {assignment.due_date && <p className="text-sm text-muted-foreground">Due {formatDate(assignment.due_date)}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest notifications for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificationsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
                {!notificationsQuery.isLoading && notificationsQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                )}
                {notificationsQuery.data?.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(notification.created_at)}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {notification.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{notification.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump to the most important pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button asChild variant="secondary" className="w-full">
                  <a href="/faculty/attendance" className="flex items-center justify-between gap-2">
                    Attendance <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/faculty/assignments" className="flex items-center justify-between gap-2">
                    Assignments <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/faculty/results" className="flex items-center justify-between gap-2">
                    Results <ArrowRight className="h-4 w-4" />
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
