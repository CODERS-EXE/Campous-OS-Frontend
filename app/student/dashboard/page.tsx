"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Bell, BookOpen, Calendar, CheckCircle2, Clock } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          allSubmissions.push(...subs.filter(s => s.student_id === user?.id));
        } catch {
          // Ignore errors
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
    return publishedAssignments.filter((a) => !submitted.has(a.id) && (!a.due_date || new Date(a.due_date) >= new Date()));
  }, [publishedAssignments, submissionsQuery.data]);

  const unreadNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => !n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const totalMarks = useMemo(() => {
    return resultsQuery.data?.reduce((sum, result) => sum + (result.total_marks || 0), 0) || 0;
  }, [resultsQuery.data]);

  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    assignmentsQuery.data?.forEach((a) => a.subject && subjectSet.add(a.subject));
    resultsQuery.data?.forEach((r) => r.subject && subjectSet.add(r.subject));
    return subjectSet.size;
  }, [assignmentsQuery.data, resultsQuery.data]);

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title={`Welcome, ${user?.name?.split(" ")[0] || "Student"}`}>
        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your academic overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="mt-2 text-2xl font-semibold">{subjects}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="mt-2 text-2xl font-semibold">{totalMarks}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Results</p>
                  <p className="mt-2 text-2xl font-semibold">{resultsQuery.data?.length || 0}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Unread Notices</p>
                  <p className="mt-2 text-2xl font-semibold">{unreadNotifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Assignments awaiting submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignmentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
                {!assignmentsQuery.isLoading && pendingAssignments.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    No pending assignments!
                  </div>
                )}
                {pendingAssignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground">{assignment.subject || "General"}</p>
                      </div>
                      {assignment.due_date && (
                        <span className="flex items-center gap-1 text-sm text-orange-600">
                          <Clock className="h-3 w-3" />
                          {formatDate(assignment.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Your latest exam scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resultsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading results...</p>}
                {!resultsQuery.isLoading && (resultsQuery.data?.length || 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No results yet.</p>
                )}
                {resultsQuery.data?.slice(0, 3).map((result) => (
                  <div key={result.id} className="rounded-xl border p-4">
                    <p className="font-medium">{result.subject}</p>
                    <p className="text-sm text-muted-foreground">{result.exam_name || "Exam"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold">{result.total_marks || "—"}</span>
                      {result.grade && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          {result.grade}
                        </span>
                      )}
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
                {notificationsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
                {!notificationsQuery.isLoading && (notificationsQuery.data?.length || 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                )}
                {notificationsQuery.data?.slice(0, 4).map((notification) => (
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

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to important sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4">
                <Button asChild variant="secondary" className="w-full">
                  <a href="/student/assignments" className="flex items-center justify-between gap-2">
                    Assignments <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/student/results" className="flex items-center justify-between gap-2">
                    Results <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/student/timetable" className="flex items-center justify-between gap-2">
                    Timetable <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/student/subjects" className="flex items-center justify-between gap-2">
                    Subjects <ArrowRight className="h-4 w-4" />
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
