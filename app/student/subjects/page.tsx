"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Assignment, Result } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function StudentSubjectsPage() {
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

  const subjects = useMemo(() => {
    const subjectMap: Record<string, { assignments: number; results: number }> = {};
    
    // Count assignments per subject
    assignmentsQuery.data?.forEach((assignment) => {
      const subject = assignment.subject || "General";
      if (!subjectMap[subject]) subjectMap[subject] = { assignments: 0, results: 0 };
      if (assignment.published) subjectMap[subject].assignments++;
    });

    // Count results per subject
    resultsQuery.data?.forEach((result) => {
      const subject = result.subject || "General";
      if (!subjectMap[subject]) subjectMap[subject] = { assignments: 0, results: 0 };
      subjectMap[subject].results++;
    });

    return Object.entries(subjectMap).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [assignmentsQuery.data, resultsQuery.data]);

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Subjects">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{subjects.length}</p>
                <p className="text-xs text-muted-foreground">Enrolled subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {subjects.reduce((sum, s) => sum + s.assignments, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Across all subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {subjects.reduce((sum, s) => sum + s.results, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Exams recorded</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> My Subjects
              </CardTitle>
              <CardDescription>Overview of all your enrolled subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsQuery.isLoading || resultsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading subjects...</p>
              ) : subjects.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No subjects available yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Subjects will appear once your faculty creates assignments or enters results.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => (
                    <Card key={subject.name}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tenant/10">
                            <BookOpen className="h-6 w-6 text-tenant" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{subject.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <span className="text-sm text-muted-foreground">Assignments</span>
                            <span className="font-semibold">{subject.assignments}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <span className="text-sm text-muted-foreground">Results</span>
                            <span className="font-semibold">{subject.results}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
