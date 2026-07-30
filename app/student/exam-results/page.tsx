"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamResult } from "@/lib/api";
import { Download, TrendingUp, Award } from "lucide-react";

export default function StudentExamResultsPage() {
  // In production, get student_id from auth context
  const studentId = "current-student-id";

  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ["student-results", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/exams/students/${studentId}/all-results`);
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
  });

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Exam Results">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Exam Results</h1>
              <p className="text-muted-foreground mt-2">
                View your semester results and academic performance
              </p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Marksheet
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </Card>
                ))}
              </div>
              <Card className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-40 w-full" />
              </Card>
            </div>
          ) : results && results.length > 0 ? (
            <>
              {/* Overall Performance Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Current CGPA
                      </div>
                      <div className="text-3xl font-bold mt-2">
                        {results[0].cgpa?.toFixed(2) || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Out of 10.0
                      </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Latest SGPA
                      </div>
                      <div className="text-3xl font-bold mt-2">
                        {results[0].sgpa?.toFixed(2) || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Semester {results[0].semester}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Credits
                    </div>
                    <div className="text-3xl font-bold mt-2">
                      {results.reduce((sum, r) => sum + r.credits_earned, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Credits earned
                    </div>
                  </div>
                </Card>
              </div>

              {/* Semester-wise Results */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Semester Results</h2>
                {results.map((result) => (
                  <Card key={result.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Semester {result.semester} - {result.academic_year}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {result.branch}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              result.result_status === "pass"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : result.result_status === "fail"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {result.result_status.toUpperCase()}
                          </span>
                        </div>
                        {result.has_backlogs && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            {result.backlog_count} backlog(s)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">SGPA</div>
                        <div className="text-xl font-bold">
                          {result.sgpa?.toFixed(2) || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">CGPA</div>
                        <div className="text-xl font-bold">
                          {result.cgpa?.toFixed(2) || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Percentage
                        </div>
                        <div className="text-xl font-bold">
                          {result.percentage?.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Credits</div>
                        <div className="text-xl font-bold">
                          {result.credits_earned}/{result.total_credits}
                        </div>
                      </div>
                    </div>

                    {/* Subject-wise Marks */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left pb-2 font-medium">Subject</th>
                            <th className="text-center pb-2 font-medium">Internal</th>
                            <th className="text-center pb-2 font-medium">External</th>
                            <th className="text-center pb-2 font-medium">Total</th>
                            <th className="text-center pb-2 font-medium">Grade</th>
                            <th className="text-center pb-2 font-medium">Credits</th>
                            <th className="text-center pb-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.subjects.map((subject, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2">
                                <div className="font-medium">
                                  {subject.subject_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {subject.subject_code}
                                </div>
                              </td>
                              <td className="text-center py-2">
                                {subject.internal_marks?.toFixed(0) || "-"}
                              </td>
                              <td className="text-center py-2">
                                {subject.external_marks?.toFixed(0) || "-"}
                              </td>
                              <td className="text-center py-2 font-medium">
                                {subject.total_marks?.toFixed(0) || "-"}
                              </td>
                              <td className="text-center py-2 font-bold">
                                {subject.grade || "-"}
                              </td>
                              <td className="text-center py-2">
                                {subject.credits}
                              </td>
                              <td className="text-center py-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    subject.result_status === "pass"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : subject.result_status === "fail"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                  }`}
                                >
                                  {subject.result_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No results published yet. Check back after your exams are completed.
              </p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
