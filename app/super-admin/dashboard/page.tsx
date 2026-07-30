"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, DollarSign, GraduationCap, TrendingUp, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, College } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface PlatformStats {
  total_colleges: number;
  active_colleges: number;
  total_users: number;
  total_students: number;
  total_faculty: number;
}

export default function SuperAdminDashboard() {
  const collegesQuery = useQuery({
    queryKey: ["colleges"],
    queryFn: () => api.get<College[]>("/api/v1/colleges"),
  });

  const statsQuery = useQuery<PlatformStats>({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      // Calculate stats from colleges data
      const colleges = await api.get<College[]>("/api/v1/colleges");
      return {
        total_colleges: colleges.length,
        active_colleges: colleges.filter((c) => c.status === "active").length,
        total_users: 0, // Placeholder
        total_students: 0, // Placeholder
        total_faculty: 0, // Placeholder
      };
    },
  });

  const recentColleges = useMemo(() => {
    if (!collegesQuery.data) return [];
    return collegesQuery.data.slice(0, 5);
  }, [collegesQuery.data]);

  const activeColleges = useMemo(() => {
    if (!collegesQuery.data) return 0;
    return collegesQuery.data.filter((c) => c.status === "active").length;
  }, [collegesQuery.data]);

  const suspendedColleges = useMemo(() => {
    if (!collegesQuery.data) return 0;
    return collegesQuery.data.filter((c) => c.status === "suspended").length;
  }, [collegesQuery.data]);

  const planDistribution = useMemo(() => {
    if (!collegesQuery.data) return { free: 0, basic: 0, premium: 0, enterprise: 0 };
    const dist = { free: 0, basic: 0, basic_monthly: 0, premium: 0, premium_monthly: 0, enterprise: 0 };
    collegesQuery.data.forEach((c) => {
      if (c.plan === "free") dist.free++;
      else if (c.plan === "basic") dist.basic++;
      else if (c.plan === "premium") dist.premium++;
      else if (c.plan === "enterprise") dist.enterprise++;
    });
    return dist;
  }, [collegesQuery.data]);

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Platform Overview">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Total Colleges"
              value={collegesQuery.data?.length ?? 0}
              loading={collegesQuery.isLoading}
              subtext="All registered"
            />
            <StatCard
              icon={GraduationCap}
              label="Active Colleges"
              value={activeColleges}
              loading={collegesQuery.isLoading}
              subtext="Currently active"
              valueColor="text-green-600"
            />
            <StatCard
              icon={Users}
              label="Suspended"
              value={suspendedColleges}
              loading={collegesQuery.isLoading}
              subtext="Temporarily inactive"
              valueColor="text-orange-600"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value="—"
              loading={false}
              subtext="Monthly recurring"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Colleges</CardTitle>
                <CardDescription>Latest colleges onboarded to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {collegesQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentColleges.length > 0 ? (
                  <div className="space-y-3">
                    {recentColleges.map((college) => (
                      <div key={college.id} className="flex items-center gap-4 rounded-xl border p-4">
                        <div
                          className="h-12 w-12 rounded-xl"
                          style={{ backgroundColor: college.theme_color }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{college.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {college.subdomain}.campusos.com
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(college.created_at || "")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
                              college.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : college.status === "suspended"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {college.status}
                          </span>
                          <p className="mt-1 text-xs text-muted-foreground capitalize">
                            {college.plan} plan
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No colleges onboarded yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Colleges by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-sm font-medium">Free</span>
                    <span className="text-lg font-bold">{planDistribution.free}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-sm font-medium">Basic</span>
                    <span className="text-lg font-bold">{planDistribution.basic}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-sm font-medium">Premium</span>
                    <span className="text-lg font-bold">{planDistribution.premium}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-sm font-medium">Enterprise</span>
                    <span className="text-lg font-bold">{planDistribution.enterprise}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Platform Health
              </CardTitle>
              <CardDescription>System status and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Database</p>
                  <p className="mt-2 text-lg font-semibold text-green-600">Healthy</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">API Response</p>
                  <p className="mt-2 text-lg font-semibold text-green-600">Fast</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Storage</p>
                  <p className="mt-2 text-lg font-semibold">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to important sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button asChild variant="secondary" className="w-full">
                  <a href="/super-admin/colleges" className="flex items-center justify-between gap-2">
                    Manage Colleges <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/super-admin/analytics" className="flex items-center justify-between gap-2">
                    View Analytics <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <a href="/super-admin/settings" className="flex items-center justify-between gap-2">
                    System Settings <ArrowRight className="h-4 w-4" />
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

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  subtext,
  valueColor = "text-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading: boolean;
  subtext?: string;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
