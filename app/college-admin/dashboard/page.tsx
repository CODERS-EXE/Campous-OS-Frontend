"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  ChevronRight,
  CreditCard,
  GraduationCap,
  Home,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
  UserPlus,
} from "lucide-react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard, DashboardCard } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, DashboardStats, Faculty, Notification, Student } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function CollegeAdminDashboard() {
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/api/v1/users/dashboard/stats"),
  });

  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
  });

  const { data: faculty, isLoading: facultyLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: () => api.get<Faculty[]>("/api/v1/users/faculty"),
  });

  const studentYearData = useMemo(
    () =>
      students
        ? Object.entries(
            students.reduce<Record<string, number>>((acc, student) => {
              const key = String(student.year ?? "Unknown");
              acc[key] = (acc[key] ?? 0) + 1;
              return acc;
            }, {})
          ).map(([year, value]) => ({ name: `Year ${year}`, value }))
        : [],
    [students]
  );

  const facultyDepartmentData = useMemo(
    () =>
      faculty
        ? Object.entries(
            faculty.reduce<Record<string, number>>((acc, member) => {
              const key = member.department || "General";
              acc[key] = (acc[key] ?? 0) + 1;
              return acc;
            }, {})
          ).map(([department, value]) => ({ name: department, value }))
        : [],
    [faculty]
  );

  const recentActivity = useMemo(() => {
    const items: { id: string; title: string; description: string; time: string; type: string }[] = [];

    if (notifications) {
      items.push(
        ...notifications.slice(0, 3).map((notification) => ({
          id: notification.id,
          title: notification.title,
          description: notification.body,
          time: notification.created_at,
          type: "Notification",
        }))
      );
    }

    if (students) {
      items.push(
        ...students
          .slice(-2)
          .reverse()
          .map((student) => ({
            id: student.id,
            title: `New student ${student.name}`,
            description: `${student.course ?? student.department ?? "Student"} enrollment`,
            time: student.created_at ?? "",
            type: "Student",
          }))
      );
    }

    if (faculty) {
      items.push(
        ...faculty
          .slice(-2)
          .reverse()
          .map((member) => ({
            id: member.id,
            title: `New faculty ${member.name}`,
            description: `${member.department} assigned`,
            time: member.created_at ?? "",
            type: "Faculty",
          }))
      );
    }

    return items
      .filter((item) => item.time)
      .sort((a, b) => Number(new Date(b.time)) - Number(new Date(a.time)))
      .slice(0, 5);
  }, [faculty, notifications, students]);

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="College Administration">
        <div className="space-y-8">
          {/* ── Welcome Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <Building2 className="h-3.5 w-3.5" /> Institution Management Hub
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  College Administration Overview 🏛️
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-xl">
                  {todayDateStr} • Managing student admissions, faculty allocations, fee collection, exams & campus operations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/college-admin/students">
                  <Button variant="secondary" className="rounded-full shadow-md font-semibold hover:scale-105 transition-all">
                    <UserPlus className="mr-2 h-4 w-4" /> Manage Students
                  </Button>
                </Link>
                <Link href="/college-admin/ai-assistant">
                  <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-semibold transition-all">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> Admin AI
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Enrolled Students"
              value={statsLoading ? "..." : (stats?.total_students ?? 0)}
              icon={Users}
              variant="indigo"
              trend={{ value: "Active", isPositive: true, label: "campus roster" }}
            />
            <StatCard
              title="Total Faculty Members"
              value={statsLoading ? "..." : (stats?.total_faculty ?? 0)}
              icon={BookOpen}
              variant="cyan"
              subtitle="Teaching staff"
            />
            <StatCard
              title="Unread Notices"
              value={statsLoading ? "..." : (stats?.unread_notifications ?? 0)}
              icon={Bell}
              variant="rose"
              subtitle="Pending circulars"
            />
            <StatCard
              title="System Operational"
              value="100%"
              icon={Activity}
              variant="emerald"
              subtitle="All services online"
              trend={{ value: "✓", isPositive: true, label: "Healthy" }}
            />
          </div>

          {/* ── Charts & Analytics Section ── */}
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Campus Analytics Charts */}
            <DashboardCard
              title="Campus Analytics"
              description="Demographic breakdown of students and faculty"
              icon={TrendingUp}
              className="xl:col-span-2"
            >
              <div className="grid gap-8 md:grid-cols-2">
                  {/* Students by Year Bar Chart */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Students by Year</p>
                    <div className="h-64 w-full">
                      {studentsLoading ? (
                        <Skeleton className="h-full w-full rounded-2xl" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={studentYearData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1e1e2d", borderRadius: "12px", border: "none", color: "#fff" }}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Faculty by Department Pie Chart */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Faculty by Department</p>
                    <div className="h-64 w-full">
                      {facultyLoading ? (
                        <Skeleton className="h-full w-full rounded-2xl" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={facultyDepartmentData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={75}
                              innerRadius={40}
                              paddingAngle={4}
                              fill="#0f766e"
                            >
                              {facultyDepartmentData.map((entry, index) => (
                                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1e1e2d", borderRadius: "12px", border: "none", color: "#fff" }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
            </DashboardCard>

            {/* Quick Actions Shortcuts */}
            <DashboardCard
              title="Admin Actions"
              description="Direct navigation shortcuts"
              icon={LayoutDashboard}
              contentClassName="space-y-3"
            >
              <div>
                {[
                  { label: "Manage Students", href: "/college-admin/students", icon: Users, color: "text-indigo-500" },
                  { label: "Faculty Directory", href: "/college-admin/faculty", icon: BookOpen, color: "text-emerald-500" },
                  { label: "Parent Records", href: "/college-admin/parents", icon: Home, color: "text-amber-500" },
                  { label: "Hostel Overview", href: "/college-admin/hostel/dashboard", icon: Building2, color: "text-purple-500" },
                  { label: "Fee Management", href: "/college-admin/fees", icon: CreditCard, color: "text-rose-500" },
                ].map((action) => (
                  <Button
                    key={action.href}
                    variant="outline"
                    className="w-full justify-between h-12 rounded-xl hover:bg-muted/80 transition-all mb-3"
                    onClick={() => router.push(action.href)}
                  >
                    <span className="flex items-center gap-3.5 text-xs font-semibold">
                      <action.icon className={`h-4 w-4 ${action.color}`} /> {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* ── Lower Section: Recent Activity Timeline ── */}
          <DashboardCard
            title="Recent Campus Activity"
            description="Live log of announcements, student & faculty additions"
            icon={Activity}
          >
            <div>
              {studentsLoading || facultyLoading || notifLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{item.title}</h4>
                          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDate(item.time)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No recent activity recorded.
                </div>
              )}
              </div>
            </DashboardCard>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
