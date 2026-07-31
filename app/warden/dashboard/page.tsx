"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  ShieldCheck,
  Sparkles,
  Users,
  AlertCircle,
  DoorClosed,
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatCard, DashboardCard } from "@/components/ui/card";
import { api, HostelStudent, Notification, Outpass, Room } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function WardenDashboard() {
  const { user } = useAuthStore();

  const studentsQuery = useQuery<HostelStudent[]>({
    queryKey: ["hostel-students", "all"],
    queryFn: () => api.get<HostelStudent[]>("/api/v1/hostel/students"),
    enabled: !!user,
  });

  const roomsQuery = useQuery<Room[]>({
    queryKey: ["rooms", "all"],
    queryFn: () => api.get<Room[]>("/api/v1/hostel/rooms"),
    enabled: !!user,
  });

  const outpassesQuery = useQuery<Outpass[]>({
    queryKey: ["outpasses", "all"],
    queryFn: () => api.get<Outpass[]>("/api/v1/hostel/outpasses"),
    enabled: !!user,
  });

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/api/v1/notifications"),
    enabled: !!user,
  });

  const pendingOutpasses = useMemo(
    () => outpassesQuery.data?.filter((o) => o.status === "pending") ?? [],
    [outpassesQuery.data]
  );

  const unreadNotifications = useMemo(
    () => notificationsQuery.data?.filter((n) => !n.is_read) ?? [],
    [notificationsQuery.data]
  );

  const totalStudents = studentsQuery.data?.length || 0;
  const totalRooms = roomsQuery.data?.length || 0;
  const occupiedRooms = roomsQuery.data?.filter((r) => r.occupied > 0).length || 0;
  const availableRooms = roomsQuery.data?.filter((r) => r.is_available && r.occupied < r.capacity).length || 0;
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Hostel Management Console">
        <div className="space-y-8">
          {/* ── Welcome Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-black/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5" /> Hostel & Residence Management
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  Welcome back, Warden {user?.name?.split(" ")[0] || "Warden"} 🏢
                </h1>
                <p className="text-sm md:text-base text-white/80 max-w-xl">
                  {todayDateStr} • Managing hostel occupancy, outpasses, and student residence safety.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/warden/outpasses">
                  <Button variant="secondary" className="rounded-full shadow-md font-semibold hover:scale-105 transition-all">
                    Review Outpasses ({pendingOutpasses.length}) <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/warden/ai-assistant">
                  <Button className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-semibold transition-all">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> AI Warden
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI Cards Grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Hostel Students"
              value={totalStudents}
              icon={Users}
              variant="indigo"
              subtitle="Resident students"
            />
            <StatCard
              title="Total Rooms"
              value={totalRooms}
              icon={Home}
              variant="amber"
              subtitle="Capacity across blocks"
            />
            <StatCard
              title="Occupancy Rate"
              value={`${occupancyPercentage}%`}
              icon={DoorClosed}
              variant="emerald"
              subtitle={`${occupiedRooms} occupied / ${availableRooms} available`}
            />
            <StatCard
              title="Pending Outpasses"
              value={pendingOutpasses.length}
              icon={Clock}
              variant="rose"
              subtitle="Action required"
            />
          </div>

          {/* ── Main Content Section: Outpasses & Notifications ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Pending Outpasses List */}
            <DashboardCard
              title="Pending Outpass Requests"
              description="Leave applications awaiting warden review"
              icon={Clock}
              action={<Link href="/warden/outpasses"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All ({pendingOutpasses.length}) <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
              className="lg:col-span-2"
            >
              <div>
                {outpassesQuery.isLoading && (
                  <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                    Loading outpasses...
                  </div>
                )}
                {!outpassesQuery.isLoading && pendingOutpasses.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-2xl bg-muted/20">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                    <p className="font-semibold text-sm">No pending outpasses!</p>
                    <p className="text-xs text-muted-foreground">All student outpass requests have been reviewed.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {pendingOutpasses.slice(0, 4).map((outpass) => (
                    <div
                      key={outpass.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{outpass.student_name}</h4>
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Roll: {outpass.student_roll_no}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{outpass.reason}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDate(outpass.from_date)} - {formatDate(outpass.to_date)}
                        </span>
                        <Link href="/warden/outpasses">
                          <Button size="sm" className="rounded-xl font-semibold bg-amber-600 hover:bg-amber-500 text-white">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>

            {/* Quick Actions Shortcuts */}
            <DashboardCard
              title="Warden Actions"
              description="Hostel management shortcuts"
              icon={ShieldCheck}
              contentClassName="space-y-3"
            >
              <div>
                <Link href="/warden/outpasses" className="w-full block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Clock className="h-4 w-4 text-amber-500" /> Outpass Approvals
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/warden/students" className="w-full block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Users className="h-4 w-4 text-indigo-500" /> Hostel Residents
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/warden/attendance" className="w-full block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Night Attendance
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/college-admin/hostel/rooms" className="w-full block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl hover:bg-purple-500/10 hover:text-purple-600 transition-all">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <DoorClosed className="h-4 w-4 text-purple-500" /> Room Allocations
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </DashboardCard>
          </div>

          {/* ── Lower Section: Notifications ── */}
          <DashboardCard
            title="Hostel Notices & Circulars"
            description="Recent announcements"
            icon={Bell}
            action={<Link href="/warden/notifications"><Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View All <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>}
          >
            <div>
              <div className="space-y-3">
                {notificationsQuery.isLoading && (
                  <div className="p-6 text-center text-sm text-muted-foreground animate-pulse">
                    Loading notifications...
                  </div>
                )}
                {!notificationsQuery.isLoading && notificationsQuery.data?.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No notifications available.
                  </div>
                )}
                {notificationsQuery.data?.slice(0, 4).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{notification.title}</h4>
                        {!notification.is_read && (
                          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{notification.body}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase">
                        {notification.priority}
                      </span>
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
