"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Exam } from "@/lib/api";
import { CheckCircle, Download, Calculator } from "lucide-react";

export default function ExamResultsPage() {
  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ["exams-for-results"],
    queryFn: async () => {
      const res = await fetch("/api/v1/exams/?status=completed");
      if (!res.ok) throw new Error("Failed to fetch exams");
      return res.json();
    },
  });

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Results Management">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Results Management</h1>
            <p className="text-muted-foreground mt-2">
              Calculate, verify, and publish exam results
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))}
            </div>
          ) : exams && exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{exam.name}</h3>
                        {exam.results_published && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Published
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exam.academic_year} | Semester {exam.semester} |{" "}
                        {exam.total_students} students
                      </div>
                      {exam.published_at && (
                        <div className="text-xs text-muted-foreground">
                          Published on:{" "}
                          {new Date(exam.published_at).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!exam.results_published ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Calculator className="mr-2 h-4 w-4" />
                            Calculate Results
                          </Button>
                          <Button size="sm">Publish Results</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {!exam.results_published && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Results not yet published. Calculate and verify before
                        publishing to students.
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No completed exams available for result management
              </p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
