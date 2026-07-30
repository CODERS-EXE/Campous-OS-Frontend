"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  Building2,
  TrendingUp,
} from "lucide-react";
import { api, LibraryAnalytics } from "@/lib/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminLibraryPage() {
  const { data: analytics, isLoading } = useQuery<LibraryAnalytics>({
    queryKey: ["library-analytics"],
    queryFn: () => api.getLibraryAnalytics(),
  });

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Library Analytics">
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Books"
              value={isLoading ? "…" : (analytics?.total_books ?? 0)}
              icon={BookOpen}
              color="bg-blue-500"
              subtitle="Across all colleges"
            />
            <StatCard
              label="Currently Issued"
              value={isLoading ? "…" : (analytics?.total_issued ?? 0)}
              icon={BookOpenCheck}
              color="bg-emerald-500"
              subtitle="Active checkouts"
            />
            <StatCard
              label="Overdue Books"
              value={isLoading ? "…" : (analytics?.overdue_issues ?? 0)}
              icon={AlertTriangle}
              color="bg-red-500"
              subtitle="Past due date"
            />
            <StatCard
              label="Total Fines"
              value={isLoading ? "…" : `₹${(analytics?.total_fines_collected ?? 0).toFixed(0)}`}
              icon={TrendingUp}
              color="bg-violet-500"
              subtitle="All colleges combined"
            />
          </div>

          {/* Per-college breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                College-wise Library Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8 text-muted-foreground">Loading…</div>
              ) : !analytics?.college_stats?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-3 opacity-30" />
                  <p>No college library data available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3 pr-4 font-medium text-muted-foreground">College</th>
                        <th className="text-right pb-3 pr-4 font-medium text-muted-foreground">Books</th>
                        <th className="text-right pb-3 pr-4 font-medium text-muted-foreground">Issued</th>
                        <th className="text-right pb-3 font-medium text-muted-foreground">Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.college_stats.map((col) => (
                        <tr key={col.college_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3 pr-4 font-medium">{col.college_name}</td>
                          <td className="py-3 pr-4 text-right">{col.total_books}</td>
                          <td className="py-3 pr-4 text-right">{col.total_issued}</td>
                          <td className="py-3 text-right">
                            {col.total_overdue > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <AlertTriangle className="h-3 w-3" />
                                {col.total_overdue}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
