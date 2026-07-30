"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Building2 } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, College } from "@/lib/api";

export default function AnalyticsPage() {
  const collegesQuery = useQuery({
    queryKey: ["colleges"],
    queryFn: () => api.get<College[]>("/api/v1/colleges"),
  });

  const growthData = useMemo(() => {
    if (!collegesQuery.data) return [];
    
    // Group colleges by month
    const monthlyData: Record<string, number> = {};
    collegesQuery.data.forEach((college) => {
      if (college.created_at) {
        const month = new Date(college.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
  }, [collegesQuery.data]);

  const statusBreakdown = useMemo(() => {
    if (!collegesQuery.data) return { active: 0, suspended: 0, inactive: 0 };
    
    return collegesQuery.data.reduce(
      (acc, college) => {
        if (college.status === "active") acc.active++;
        else if (college.status === "suspended") acc.suspended++;
        else acc.inactive++;
        return acc;
      },
      { active: 0, suspended: 0, inactive: 0 }
    );
  }, [collegesQuery.data]);

  const planBreakdown = useMemo(() => {
    if (!collegesQuery.data) return {};
    
    return collegesQuery.data.reduce((acc: Record<string, number>, college) => {
      acc[college.plan] = (acc[college.plan] || 0) + 1;
      return acc;
    }, {});
  }, [collegesQuery.data]);

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Platform Analytics">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Colleges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{collegesQuery.data?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{statusBreakdown.active}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Suspended</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{statusBreakdown.suspended}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">—</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Colleges Growth
              </CardTitle>
              <CardDescription>Monthly onboarding trend</CardDescription>
            </CardHeader>
            <CardContent>
              {growthData.length > 0 ? (
                <div className="space-y-3">
                  {growthData.map((data) => (
                    <div key={data.month} className="flex items-center justify-between rounded-xl border p-4">
                      <span className="font-medium">{data.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-tenant"
                            style={{
                              width: `${(data.count / Math.max(...growthData.map((d) => d.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right font-semibold">{data.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">No data available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> Status Distribution
                </CardTitle>
                <CardDescription>Colleges by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <span className="font-medium text-green-600">Active</span>
                    <span className="text-2xl font-bold">{statusBreakdown.active}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <span className="font-medium text-orange-600">Suspended</span>
                    <span className="text-2xl font-bold">{statusBreakdown.suspended}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-4">
                    <span className="font-medium text-gray-600">Inactive</span>
                    <span className="text-2xl font-bold">{statusBreakdown.inactive}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Plan Distribution
                </CardTitle>
                <CardDescription>Colleges by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(planBreakdown).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between rounded-xl border p-4">
                      <span className="font-medium capitalize">{plan}</span>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="mt-2 text-2xl font-semibold">—</p>
                  <p className="text-xs text-muted-foreground">Real-time users</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                  <p className="mt-2 text-2xl font-semibold">—</p>
                  <p className="text-xs text-muted-foreground">GB consumed</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">API Requests</p>
                  <p className="mt-2 text-2xl font-semibold">—</p>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
