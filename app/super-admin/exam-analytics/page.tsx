"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamAnalytics } from "@/lib/api";

export default function SuperAdminExamAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<ExamAnalytics>({
    queryKey: ["exam-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/v1/exams/analytics/college-stats");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Exam Analytics">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Exam Analytics</h1>
            <p className="text-muted-foreground mt-2">
              University-wide examination statistics and performance metrics
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Exams
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.total_exams}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Completed Exams
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.completed_exams}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Ongoing Exams
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.ongoing_exams}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Scheduled Exams
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.scheduled_exams}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.total_students}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Pass Percentage
                  </div>
                  <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                    {analytics.pass_percentage.toFixed(1)}%
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Average SGPA
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.average_sgpa.toFixed(2)}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Average CGPA
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {analytics.average_cgpa.toFixed(2)}
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Student Results</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Results</span>
                      <span className="font-semibold">{analytics.total_results}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Passed</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {analytics.passed_students}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Failed</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {analytics.failed_students}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">With Backlogs</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {analytics.students_with_backlogs}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pass Rate</span>
                      <span className="font-semibold">{analytics.pass_percentage.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fail Rate</span>
                      <span className="font-semibold">
                        {(100 - analytics.pass_percentage).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg SGPA</span>
                      <span className="font-semibold">{analytics.average_sgpa.toFixed(2)} / 10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg CGPA</span>
                      <span className="font-semibold">{analytics.average_cgpa.toFixed(2)} / 10</span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              No analytics data available
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
