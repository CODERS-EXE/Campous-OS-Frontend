"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  Bell,
  Bus,
  Calendar,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  BookOpenCheck,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Attendance, Notification, Student } from "@/lib/api";
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

  const avgAttendance = useMemo(() => {
    if (childrenStats.length === 0) return "0";
    const sum = childrenStats.reduce((acc, c) => acc + parseFloat(c.attendancePercentage), 0);
    return (sum / childrenStats.length).toFixed(1);
  }, [childrenStats]);

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Parent Portal">
        <div className="space-y-8">
          {/* ── Welcome Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-black/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <HeartHandshake className="h-3.5 w-3.5" /> Parent & Guardian Hub
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  Welcome back, {user?.name?.split(" ")[0] || "Parent"} 👋
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-xl">
                  {todayDateStr} • Monitor academic progress, attendance, and fee status for your children in real time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/parent/children">
                  <Button variant="secondary" className="rounded-full shadow-md font-semibold hover:scale-105 transition-all">
                    View Children Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/parent/ai-assistant">
                  <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-semibold transition-all">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> AI Parent Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Linked Children</p>
                    <h3 className="text-3xl font-extrabold mt-1">{myChildren.length}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <GraduationCap className="h-3 w-3 text-indigo-500" /> Enrolled students
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Attendance</p>
                    <h3 className="text-3xl font-extrabold mt-1">{avgAttendance}%</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Combined rate
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</p>
                    <h3 className="text-3xl font-extrabold mt-1">
                      {childrenStats.reduce((sum, child) => sum + child.totalSessions, 0)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-amber-500" /> Recorded classes
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unread Notices</p>
                    <h3 className="text-3xl font-extrabold mt-1">{unreadNotifications.length}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Bell className="h-3 w-3 text-rose-500" /> Notifications
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <Bell className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Main Content Section: Children Overview & Notifications ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Children Overview Cards */}
            <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" /> Children Progress Cards
                  </CardTitle>
                  <CardDescription>Academic status & attendance performance</CardDescription>
                </div>
                <Link href="/parent/children">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                    View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {studentsQuery.isLoading && (
                  <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                    Loading child profiles...
                  </div>
                )}
                {!studentsQuery.isLoading && myChildren.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-2xl bg-muted/20">
                    <Users className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-semibold text-sm">No children linked to your account.</p>
                    <p className="text-xs text-muted-foreground">Please contact your college administrator.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {childrenStats.map((child) => (
                    <div
                      key={child.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {child.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {child.department} • Year {child.year} • Roll: {child.roll_no}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-extrabold text-foreground">{child.attendancePercentage}%</p>
                          <p className="text-[11px] text-muted-foreground font-medium">Attendance Rate</p>
                        </div>
                        <Link href="/parent/attendance">
                          <Button size="sm" variant="outline" className="rounded-xl font-semibold">
                            Report <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Transport Widget */}
            <div className="space-y-6">
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                  <CardDescription>Parent portal navigation</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Link href="/parent/exam-results" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">
                      <Award className="mr-2 h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-semibold">Exam Results</span>
                    </Button>
                  </Link>
                  <Link href="/parent/fees" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all">
                      <BookOpenCheck className="mr-2 h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold">Child Fees</span>
                    </Button>
                  </Link>
                  <Link href="/parent/attendance" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-all">
                      <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold">Attendance</span>
                    </Button>
                  </Link>
                  <Link href="/parent/bus" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-purple-500/10 hover:text-purple-600 transition-all">
                      <Bus className="mr-2 h-4 w-4 text-purple-500" />
                      <span className="text-xs font-semibold">Bus Tracking</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Bus Live Tracking Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent p-5 border border-amber-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                    <Bus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Bus Live Tracking</h4>
                    <p className="text-xs text-muted-foreground">Monitor route & ETA</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Check route status and real-time location updates for your child&apos;s college transport.
                </p>
                <Link href="/parent/bus">
                  <Button size="sm" className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-sm">
                    Open Bus Tracker <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Lower Section: Notifications ── */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-rose-500" /> Official Notices & Announcements
                </CardTitle>
                <CardDescription>Important notifications from the college administration</CardDescription>
              </div>
              <Link href="/parent/notifications">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                  View All Notices <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificationsQuery.isLoading && (
                  <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                    Loading notifications...
                  </div>
                )}
                {!notificationsQuery.isLoading && (notificationsQuery.data?.length || 0) === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No notices published yet.
                  </div>
                )}
                {notificationsQuery.data?.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{notification.title}</h4>
                        {!notification.is_read && (
                          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notification.body}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase">
                        {notification.priority}
                      </span>
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
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
