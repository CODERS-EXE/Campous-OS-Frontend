"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, DoorOpen, Home, Layers, UserCheck, Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, HostelStats } from "@/lib/api";

export default function CollegeAdminHostelDashboardPage() {
  const statsQuery = useQuery<HostelStats>({
    queryKey: ["hostel", "stats"],
    queryFn: () => api.getHostelStats(),
  });

  const stats = statsQuery.data;

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Hostel Management Dashboard">
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hostel Buildings</p>
                    <p className="text-3xl font-bold">{stats?.total_buildings ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                    <DoorOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rooms</p>
                    <p className="text-3xl font-bold">{stats?.total_rooms ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hostel Residents</p>
                    <p className="text-3xl font-bold">{stats?.hostel_students ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-3xl font-bold">{stats?.pending_requests ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Occupancy Overview */}
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-indigo-600" /> Occupancy & Room Status
                </CardTitle>
                <CardDescription>Live breakdown of hostel capacity and bed availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Occupancy Rate</span>
                    <span className="text-indigo-600 font-bold">{stats?.occupancy_percentage ?? 0}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats?.occupancy_percentage ?? 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {stats?.total_occupied ?? 0} out of {stats?.total_capacity ?? 0} total beds currently occupied
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border bg-muted/30 p-3.5 text-center">
                    <p className="text-xs text-muted-foreground">Occupied Rooms</p>
                    <p className="text-xl font-bold text-indigo-600 mt-1">{stats?.occupied_rooms ?? 0}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-3.5 text-center">
                    <p className="text-xs text-muted-foreground">Available Rooms</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{stats?.available_rooms ?? 0}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-3.5 text-center">
                    <p className="text-xs text-muted-foreground">Pending Requests</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">{stats?.pending_requests ?? 0}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-3.5 text-center">
                    <p className="text-xs text-muted-foreground">Pending Outpasses</p>
                    <p className="text-xl font-bold text-purple-600 mt-1">{stats?.pending_outpasses ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" /> Module Navigation
                </CardTitle>
                <CardDescription>Direct management operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/college-admin/hostel/buildings">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-left font-normal hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Buildings</p>
                        <p className="text-xs text-muted-foreground">Manage hostel blocks & floors</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>

                <Link href="/college-admin/hostel/rooms">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-left font-normal hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                        <DoorOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Rooms</p>
                        <p className="text-xs text-muted-foreground">Create & edit room inventory</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>

                <Link href="/college-admin/hostel/allocations">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-left font-normal hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Allocations</p>
                        <p className="text-xs text-muted-foreground">Assign, change, or vacate rooms</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>

                <Link href="/college-admin/hostel/requests">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl text-left font-normal hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Student Requests</p>
                        <p className="text-xs text-muted-foreground">Review & approve room requests</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
