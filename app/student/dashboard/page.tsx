"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  TrendingUp,
  FileText,
  AlertCircle,
  ChevronRight,
  BookOpenCheck,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard, DashboardCard } from "@/components/ui/card";
import { api, Assignment, Notification, Result, Submission } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const assignmentsQuery = useQuery<Assignment[]>({
    queryKey: ["assignments", "student"],
    queryFn: () => api.get<Assignment[]>("/api/v1/assignments?limit=100"),
    enabled: !!user,
  });

  const resultsQuery = useQuery<Result[]>({
    queryKey: ["results", "my"],
    queryFn: () => api.get<Result[]>(`/api/v1/results/student/${user?.id}`),
    enabled: !!user?.id,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const submissionsQuery = useQuery<Submission[]>({
    queryKey: ["submissions", "my"],
    queryFn: async () => {
      const assignments = assignmentsQuery.data || [];
      const allSubmissions: Submission[] = [];
      for (const assignment of assignments) {
        try {
          const subs = await api.get<Submission[]>(`/api/v1/assignments/${assignment.id}/submissions`);
          allSubmissions.push(...subs.filter((s) => s.student_id === user?.id));
        } catch {
          // Ignore
        }
      }
      return allSubmissions;
    },
    enabled: !!user && !!assignmentsQuery.data,
  });

  const publishedAssignments = useMemo(
    () => assignmentsQuery.data?.filter((a) => a.published) ?? [],
    [assignmentsQuery.data]
  );

  const pendingAssignments = useMemo(() => {
    const submitted = new Set(submissionsQuery.data?.map((s) => s.assignment_id) ?? []);
    return publishedAssignments.filter(
      (a) => !submitted.has(a.id) && (!a.due_date || new Date(a.due_date) >= new Date())
    );
  }, [publishedAssignments, submissionsQuery.data]);

  const unreadNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => !n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const totalMarks = useMemo(() => {
    return resultsQuery.data?.reduce((sum, result) => sum + (result.total_marks || 0), 0) || 0;
  }, [resultsQuery.data]);

  const subjectsCount = useMemo(() => {
    const subjectSet = new Set<string>();
    assignmentsQuery.data?.forEach((a) => a.subject && subjectSet.add(a.subject));
    resultsQuery.data?.forEach((r) => r.subject && subjectSet.add(r.subject));
    return subjectSet.size;
  }, [assignmentsQuery.data, resultsQuery.data]);

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Student Portal">
        <div className="space-y-8">
          {/* ── Welcome Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-black/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <GraduationCap className="h-3.5 w-3.5" /> Student Workspace
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-xl">
                  {todayDateStr} • Keep up the momentum! You have {pendingAssignments.length} pending assignments this week.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/student/assignments">
                  <Button variant="secondary" className="rounded-full shadow-md font-semibold hover:scale-105 transition-all">
                    View Assignments <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/student/ai-assistant">
                  <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-semibold transition-all">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> Ask AI
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Enrolled Subjects"
              value={subjectsCount}
              icon={BookOpen}
              variant="indigo"
              subtitle="Active courses"
            />
            <StatCard
              title="Total Marks Earned"
              value={totalMarks}
              icon={Award}
              variant="emerald"
              trend={{ value: "Live", isPositive: true, label: "updated" }}
            />
            <StatCard
              title="Published Results"
              value={resultsQuery.data?.length || 0}
              icon={BookOpenCheck}
              variant="amber"
              subtitle="Exam evaluations"
            />
            <StatCard
              title="Unread Notices"
              value={unreadNotifications.length}
              icon={Bell}
              variant="rose"
              subtitle="Action required"
            />
          </div>

          {/* ── Main Content Section: Assignments & Recent Results ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Pending Assignments */}
            <DashboardCard
              title="Pending Assignments"
              description="Tasks requiring your submission"
              icon={Clock}
              action={<Link href="/student/assignments"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
              className="lg:col-span-2"
            >
              <div>
                <div className="space-y-3">
                  {assignmentsQuery.isLoading && (
                    <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                      Loading assignments...
                    </div>
                  )}
                  {!assignmentsQuery.isLoading && pendingAssignments.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-2xl bg-muted/20">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                      <p className="font-semibold text-sm">All caught up!</p>
                      <p className="text-xs text-muted-foreground">You have no pending assignment submissions.</p>
                    </div>
                  )}
                  {pendingAssignments.slice(0, 4).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {assignment.subject || "General"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {assignment.title}
                        </h4>
                      </div>

                      {assignment.due_date && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            Due {formatDate(assignment.due_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            </DashboardCard>

            {/* Recent Results */}
            <DashboardCard
              title="Recent Results"
              description="Latest scores"
              icon={Award}
              action={<Link href="/student/results"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
            >
              <div>
                <div className="space-y-3">
                  {resultsQuery.isLoading && (
                    <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                      Loading results...
                    </div>
                  )}
                  {!resultsQuery.isLoading && (resultsQuery.data?.length || 0) === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No results published yet.
                    </div>
                  )}
                  {resultsQuery.data?.slice(0, 4).map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-sm">{result.subject}</p>
                        <p className="text-xs text-muted-foreground">{result.exam_name || "Internal Exam"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold">{result.total_marks || "—"}</span>
                        {result.grade && (
                          <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {result.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
            </DashboardCard>
          </div>

          {/* ── Lower Section: Notifications & Quick Actions + AI Banner ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Notifications */}
            <DashboardCard
              title="Recent Announcements"
              description="Campus notices and announcements"
              icon={Bell}
              action={<Link href="/student/notifications"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
              className="lg:col-span-2"
            >
              <div>
                <div className="space-y-3">
                  {notificationsQuery.isLoading && (
                    <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                      Loading announcements...
                    </div>
                  )}
                  {!notificationsQuery.isLoading && (notificationsQuery.data?.length || 0) === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No notices posted yet.
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
            </DashboardCard>

            {/* Quick Actions & AI Assistant Box */}
            <div className="space-y-6">
              <DashboardCard
                title="Quick Actions"
                description="Frequent student navigation"
                contentClassName="grid grid-cols-2 gap-3"
              >
                  <Link href="/student/assignments" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">
                      <BookOpen className="mr-2 h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-semibold">Assignments</span>
                    </Button>
                  </Link>
                  <Link href="/student/results" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all">
                      <Award className="mr-2 h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold">Results</span>
                    </Button>
                  </Link>
                  <Link href="/student/timetable" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-all">
                      <CalendarDays className="mr-2 h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold">Timetable</span>
                    </Button>
                  </Link>
                  <Link href="/student/library" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl hover:bg-purple-500/10 hover:text-purple-600 transition-all">
                      <BookOpenCheck className="mr-2 h-4 w-4 text-purple-500" />
                      <span className="text-xs font-semibold">Library</span>
                    </Button>
                  </Link>
              </DashboardCard>

              {/* AI Widget Box */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-900 p-5 text-white shadow-md border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-400/30">
                    <Sparkles className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">CampusOS AI Assistant</h4>
                    <p className="text-xs text-purple-200">Study help & instant summaries</p>
                  </div>
                </div>
                <p className="text-xs text-purple-100/80 mb-4">
                  Need help with your assignments or upcoming exams? Ask your AI tutor anything!
                </p>
                <Link href="/student/ai-assistant">
                  <Button size="sm" className="w-full rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold shadow-sm">
                    Open AI Assistant <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
