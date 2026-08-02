"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ExamResult, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ParentExamResultsPage() {
  const { user } = useAuthStore();
  // Parent can have multiple children — support switching between them
  const rawChildIds: string[] = (user?.profile as { student_ids?: string[] })?.student_ids || [];

  const { data: children = [], isLoading: isLoadingChildren } = useQuery<Student[]>({
    queryKey: ["my-children"],
    queryFn: () => api.get<Student[]>("/api/v1/users/my-children"),
    enabled: rawChildIds.length > 0,
  });

  const [selectedChildId, setSelectedChildId] = useState<string>("");
  // Use first child as default once loaded
  const effectiveChildId = selectedChildId || children[0]?.user_id || rawChildIds[0] || user?.id || "";

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ["child-results", effectiveChildId],
    queryFn: () => api.getStudentAllResults(effectiveChildId),
    enabled: !!effectiveChildId,
  });

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous)
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const selectedChild = children.find(c => c.user_id === effectiveChildId);

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Child's Exam Results">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Child&apos;s Exam Results</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your child&apos;s academic performance and exam results
            </p>
          </div>

          {/* Child Selection (if multiple children) */}
          {children.length > 1 && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Select Child:</label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  {children.map(child => (
                    <option key={child.user_id} value={child.user_id}>
                      {child.name} - {child.roll_no}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </Card>
                ))}
              </div>
            </div>
          ) : results && results.length > 0 ? (
            <>
              {/* Performance Overview */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Current CGPA
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {results[0].cgpa?.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Out of 10.0
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Latest Semester
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {results[0].sgpa?.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    SGPA - Sem {results[0].semester}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Backlogs
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {results.reduce((sum, r) => sum + r.backlog_count, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Across all semesters
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Credits Earned
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {results.reduce((sum, r) => sum + r.credits_earned, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total credits
                  </div>
                </Card>
              </div>

              {/* Semester Performance Trend */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Semester Performance Trend
                </h2>
                <div className="space-y-3">
                  {results.map((result, index) => {
                    const prevResult = results[index + 1];
                    return (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              Sem {result.semester}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.academic_year}
                            </div>
                          </div>
                          <div className="h-12 w-px bg-border" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-muted-foreground">
                                SGPA:
                              </span>
                              <span className="font-semibold">
                                {result.sgpa?.toFixed(2) || "N/A"}
                              </span>
                              {prevResult && result.sgpa && prevResult.sgpa && (
                                <span className="flex items-center gap-1">
                                  {getTrendIcon(result.sgpa, prevResult.sgpa)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                CGPA:
                              </span>
                              <span className="font-semibold">
                                {result.cgpa?.toFixed(2) || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium mb-1 ${
                              result.result_status === "pass"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {result.result_status.toUpperCase()}
                          </div>
                          {result.has_backlogs && (
                            <div className="text-xs text-orange-600 dark:text-orange-400">
                              {result.backlog_count} backlog(s)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Subject-wise Performance (Latest Semester) */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Latest Semester - Subject Performance
                </h2>
                <div className="space-y-2">
                  {results[0].subjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{subject.subject_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {subject.subject_code}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Marks</div>
                          <div className="font-semibold">
                            {subject.total_marks?.toFixed(0) || "-"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Grade</div>
                          <div className="font-bold text-lg">
                            {subject.grade || "-"}
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              subject.result_status === "pass"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {subject.result_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No exam results available for your child yet.
              </p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}