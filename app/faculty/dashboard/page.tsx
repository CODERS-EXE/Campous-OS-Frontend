"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Bell,
  Award,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard, DashboardCard } from "@/components/ui/card";
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
    return (
      assignmentsQuery.data?.filter(
        (assignment) => assignment.published && assignment.due_date && new Date(assignment.due_date) >= new Date()
      ) ?? []
    );
  }, [assignmentsQuery.data]);

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Faculty Command Center">
        <div className="space-y-8">
          {/* ── Welcome Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-black/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <BookOpen className="h-3.5 w-3.5" /> Academic Faculty Hub
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  Welcome back, Prof. {user?.name?.split(" ")[0] || "Faculty"} 👨‍🏫
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-xl">
                  {todayDateStr} • You have {todayClasses.length} class{todayClasses.length === 1 ? "" : "es"} scheduled for today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/faculty/attendance">
                  <Button variant="secondary" className="rounded-full shadow-md font-semibold hover:scale-105 transition-all">
                    Mark Attendance <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/faculty/ai-assistant">
                  <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-semibold transition-all">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> AI Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Students"
              value={statsQuery.data?.total_students ?? "—"}
              icon={Users}
              variant="indigo"
              subtitle="Enrolled across classes"
            />
            <StatCard
              title="Today's Classes"
              value={todayClasses.length}
              icon={CalendarDays}
              variant="emerald"
              subtitle="Timetable entries"
            />
            <StatCard
              title="Attendance Sessions"
              value={attendanceQuery.data?.length ?? "—"}
              icon={ClipboardList}
              variant="amber"
              subtitle="Logged sessions"
            />
            <StatCard
              title="Unread Notices"
              value={statsQuery.data?.unread_notifications ?? "—"}
              icon={Bell}
              variant="rose"
              subtitle="Notifications"
            />
          </div>

          {/* ── Main Content Section: Timetable & Assignments ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Schedule */}
            <DashboardCard
              title="Today's Lecture Schedule"
              description="Classes assigned to you today"
              icon={CalendarDays}
              action={<Link href="/faculty/timetable"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">Full Timetable <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
              className="lg:col-span-2"
            >
              <div className="space-y-3">
                  {timetableQuery.isLoading && (
                    <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                      Loading schedule...
                    </div>
                  )}
                  {!timetableQuery.isLoading && todayClasses.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-2xl bg-muted/20">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                      <p className="font-semibold text-sm">No lectures scheduled today!</p>
                      <p className="text-xs text-muted-foreground">Enjoy your research & prep time.</p>
                    </div>
                  )}
                  {todayClasses.map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 hover:border-emerald-500/30 transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {entry.classroom || "Lecture Hall"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {entry.subject}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {entry.start_time} - {entry.end_time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
            </DashboardCard>

            {/* Pending Assignments */}
            <DashboardCard
              title="Active Assignments"
              description="Published tasks"
              icon={BookOpen}
              action={<Link href="/faculty/assignments"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">Manage <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
            >
              <div className="space-y-3">
                  {assignmentsQuery.isLoading && (
                    <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                      Loading assignments...
                    </div>
                  )}
                  {!assignmentsQuery.isLoading && pendingAssignments.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No active assignments.
                    </div>
                  )}
                  {pendingAssignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-3.5 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                    >
                      <p className="font-bold text-sm">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">{assignment.subject || "General"}</p>
                      {assignment.due_date && (
                        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Due {formatDate(assignment.due_date)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
            </DashboardCard>
          </div>

          {/* ── Lower Section: Notifications & Quick Actions ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Notifications */}
            <DashboardCard
              title="Notifications & Circulars"
              description="Recent updates for faculty"
              icon={Bell}
              action={<Link href="/faculty/notifications"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
              className="lg:col-span-2"
            >
              <div className="space-y-3">
                  {notificationsQuery.isLoading && (
                    <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                      Loading notifications...
                    </div>
                  )}
                  {!notificationsQuery.isLoading && notificationsQuery.data?.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No notifications yet.
                    </div>
                  )}
                  {notificationsQuery.data?.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-sm">{notification.title}</p>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                          {notification.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">{formatDate(notification.created_at)}</p>
                    </div>
                  ))}
                </div>
            </DashboardCard>

            {/* Quick Actions Card */}
            <DashboardCard
              title="Quick Actions"
              description="Faculty workflow shortcuts"
              icon={GraduationCap}
              contentClassName="space-y-3"
            >
              <div>
                <Link href="/faculty/attendance" className="w-full block mb-3">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Users className="h-4 w-4 text-emerald-500" /> Attendance Management
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/faculty/marks-entry" className="w-full block mb-3">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Award className="h-4 w-4 text-indigo-500" /> Exam Marks Entry
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/faculty/assignments" className="w-full block mb-3">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <BookOpen className="h-4 w-4 text-amber-500" /> Create Assignment
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/faculty/notes" className="w-full block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-purple-500/10 hover:text-purple-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <ClipboardList className="h-4 w-4 text-purple-500" /> Course Notes
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </DashboardCard>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
