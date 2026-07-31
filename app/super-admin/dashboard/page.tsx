"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Globe,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
  Server,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard, DashboardCard, InfoCard } from "@/components/ui/card";
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
    const dist = { free: 0, basic: 0, premium: 0, enterprise: 0 };
    collegesQuery.data.forEach((c) => {
      if (c.plan === "free") dist.free++;
      else if (c.plan === "basic") dist.basic++;
      else if (c.plan === "premium") dist.premium++;
      else if (c.plan === "enterprise") dist.enterprise++;
    });
    return dist;
  }, [collegesQuery.data]);

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Platform Master Console">
        <div className="space-y-8">
          {/* ── Welcome Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-purple-500/20">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-purple-400/30">
                  <Globe className="h-3.5 w-3.5 text-purple-300" /> Multi-Tenant SaaS Control Panel
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  CampusOS Super Admin Console ⚡
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-xl">
                  {todayDateStr} • Global monitoring of registered colleges, active subscriptions, and platform health.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/super-admin/colleges">
                  <Button variant="secondary" className="rounded-full shadow-md font-semibold hover:scale-105 transition-all">
                    <Building2 className="mr-2 h-4 w-4" /> Manage Colleges
                  </Button>
                </Link>
                <Link href="/super-admin/ai-assistant">
                  <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-semibold transition-all">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> Platform AI
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Colleges"
              value={collegesQuery.isLoading ? "..." : (collegesQuery.data?.length ?? 0)}
              icon={Building2}
              variant="indigo"
              subtitle="Registered institutions"
              trend={{ value: "+12%", isPositive: true, label: "from last month" }}
            />

            <StatCard
              title="Active Tenants"
              value={collegesQuery.isLoading ? "..." : activeColleges}
              icon={GraduationCap}
              variant="emerald"
              subtitle="Fully functional"
              trend={{ value: "100%", isPositive: true, label: "healthy status" }}
            />

            <StatCard
              title="Suspended Tenants"
              value={collegesQuery.isLoading ? "..." : suspendedColleges}
              icon={ShieldAlert}
              variant="amber"
              subtitle="Pending review"
            />

            <StatCard
              title="Platform Health"
              value="99.9%"
              icon={Activity}
              variant="violet"
              subtitle="Uptime SLA SLA"
              trend={{ value: "+0.1%", isPositive: true, label: "uptime" }}
            />
          </div>

          {/* ── Main Content Section: Onboarded Colleges & Subscription Distribution ── */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Recent Colleges List */}
            <Card className="xl:col-span-2 border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-500" /> Recently Onboarded Colleges
                  </CardTitle>
                  <CardDescription>Institutions registered on CampusOS</CardDescription>
                </div>
                <Link href="/super-admin/colleges">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                    View All <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {collegesQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                    ))}
                  </div>
                ) : recentColleges.length > 0 ? (
                  <div className="space-y-3">
                    {recentColleges.map((college) => (
                      <div
                        key={college.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                            style={{ backgroundColor: college.theme_color || "#6366f1" }}
                          >
                            {college.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{college.name}</h4>
                            <p className="text-xs text-muted-foreground">{college.subdomain}.campusos.com</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              college.status === "active"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : college.status === "suspended"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {college.status}
                          </span>
                          <span className="text-xs font-medium capitalize text-muted-foreground">
                            {college.plan} plan
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No colleges onboarded yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Distribution & System Status */}
            <div className="space-y-6">
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Plan Distribution</CardTitle>
                  <CardDescription>Colleges by subscription tier</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-background/50">
                    <span className="text-xs font-semibold text-muted-foreground">Free Tier</span>
                    <span className="text-base font-extrabold">{planDistribution.free}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-background/50">
                    <span className="text-xs font-semibold text-muted-foreground">Basic Plan</span>
                    <span className="text-base font-extrabold text-indigo-500">{planDistribution.basic}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-background/50">
                    <span className="text-xs font-semibold text-muted-foreground">Premium Plan</span>
                    <span className="text-base font-extrabold text-purple-500">{planDistribution.premium}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-background/50">
                    <span className="text-xs font-semibold text-muted-foreground">Enterprise Plan</span>
                    <span className="text-base font-extrabold text-emerald-500">{planDistribution.enterprise}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-500" /> Platform Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">MongoDB Cluster</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Healthy (Primary)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">FastAPI Backend</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Latency ~18ms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Next.js Frontend</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Edge Rendered</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Lower Section: Quick Actions ── */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Platform Quick Actions</CardTitle>
              <CardDescription>Master administrative navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link href="/super-admin/colleges" className="w-full">
                  <Button variant="secondary" className="w-full justify-between h-12 rounded-xl font-semibold">
                    Manage Registered Colleges <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/super-admin/analytics" className="w-full">
                  <Button variant="secondary" className="w-full justify-between h-12 rounded-xl font-semibold">
                    Global Platform Analytics <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/super-admin/settings" className="w-full">
                  <Button variant="secondary" className="w-full justify-between h-12 rounded-xl font-semibold">
                    System Master Settings <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
