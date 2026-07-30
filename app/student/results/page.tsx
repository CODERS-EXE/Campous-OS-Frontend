"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, TrendingUp } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Result } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function StudentResultsPage() {
  const { user } = useAuthStore();

  const resultsQuery = useQuery<Result[]>({
    queryKey: ["results", "my"],
    queryFn: () => api.get<Result[]>(`/api/v1/results/student/${user?.id}`),
    enabled: !!user?.id,
  });

  const subjectGroups = useMemo(() => {
    const groups: Record<string, Result[]> = {};
    resultsQuery.data?.forEach((result) => {
      const subject = result.subject || "General";
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(result);
    });
    return groups;
  }, [resultsQuery.data]);

  const totalMarks = useMemo(() => {
    return resultsQuery.data?.reduce((sum, result) => sum + (result.total_marks || 0), 0) || 0;
  }, [resultsQuery.data]);

  const averageMarks = useMemo(() => {
    const count = resultsQuery.data?.filter((r) => r.total_marks !== null && r.total_marks !== undefined).length || 0;
    return count > 0 ? (totalMarks / count).toFixed(2) : "0";
  }, [resultsQuery.data, totalMarks]);

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Results">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{resultsQuery.data?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Across all subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalMarks}</p>
                <p className="text-xs text-muted-foreground">Cumulative score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Average Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{averageMarks}</p>
                <p className="text-xs text-muted-foreground">Per exam</p>
              </CardContent>
            </Card>
          </div>

          {resultsQuery.isLoading && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Loading your results...</p>
              </CardContent>
            </Card>
          )}

          {!resultsQuery.isLoading && resultsQuery.data?.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No results available yet.</p>
              </CardContent>
            </Card>
          )}

          {Object.entries(subjectGroups).map(([subject, results]) => (
            <Card key={subject}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" /> {subject}
                </CardTitle>
                <CardDescription>{results.length} exam(s) recorded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 font-medium">Exam Name</th>
                        <th className="px-3 py-2 font-medium text-right">Internal</th>
                        <th className="px-3 py-2 font-medium text-right">Practical</th>
                        <th className="px-3 py-2 font-medium text-right">Total</th>
                        <th className="px-3 py-2 font-medium">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.map((result) => (
                        <tr key={result.id}>
                          <td className="px-3 py-3">{result.exam_name || "—"}</td>
                          <td className="px-3 py-3 text-right">{result.internal_marks ?? "—"}</td>
                          <td className="px-3 py-3 text-right">{result.practical_marks ?? "—"}</td>
                          <td className="px-3 py-3 text-right font-semibold">{result.total_marks ?? "—"}</td>
                          <td className="px-3 py-3">
                            {result.grade ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                {result.grade}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {resultsQuery.data && resultsQuery.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Subjects Covered</p>
                    <p className="mt-2 text-2xl font-semibold">{Object.keys(subjectGroups).length}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">Total Exams</p>
                    <p className="mt-2 text-2xl font-semibold">{resultsQuery.data.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
