"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, BookOpen, Home, LayoutDashboard, Users } from "lucide-react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, DashboardStats, Faculty, Notification, Student } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const CHART_COLORS = ["#4f46e5", "#0f766e", "#f97316", "#e11d48", "#8b5cf6"];

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

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="College Dashboard">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Students" value={stats?.total_students ?? 0} loading={statsLoading} />
          <StatCard icon={BookOpen} label="Faculty" value={stats?.total_faculty ?? 0} loading={statsLoading} />
          <StatCard icon={Bell} label="Unread Notices" value={stats?.unread_notifications ?? 0} loading={statsLoading} />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Campus analytics</CardTitle>
                <p className="text-sm text-muted-foreground">Live breakdown of student and faculty trends.</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-80">
                  <p className="mb-3 text-sm font-medium">Students by year</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={studentYearData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <p className="mb-3 text-sm font-medium">Faculty by department</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={facultyDepartmentData} dataKey="value" nameKey="name" outerRadius={80} fill="#0f766e" label>
                        {facultyDepartmentData.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Quick actions</CardTitle>
                <p className="text-sm text-muted-foreground">Jump directly into College Admin workflows.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Register Student", href: "/college-admin/students", icon: Users },
                { label: "Add Faculty", href: "/college-admin/faculty", icon: BookOpen },
                { label: "Add Parent", href: "/college-admin/parents", icon: Home },
                { label: "Add Warden", href: "/college-admin/wardens", icon: LayoutDashboard },
              ].map((action) => (
                <Button key={action.href} variant="outline" className="w-full justify-between" onClick={() => router.push(action.href)}>
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" /> {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading || facultyLoading || notifLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-16 w-full" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.title}</p>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.time)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity yet.</p>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </AuthGuard>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  );
}
