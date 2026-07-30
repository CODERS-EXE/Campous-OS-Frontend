"use client";

import { useQuery } from "@tanstack/react-query";
import { Bus, MapPin, Route, Users, Zap } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, BusVehicle, BusRoute, StudentBusAssignment } from "@/lib/api";

const statusColors: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  in_transit: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
  maintenance: "text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-300",
  inactive: "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
};

export default function TransportDashboardPage() {
  const busesQuery = useQuery<BusVehicle[]>({
    queryKey: ["transport", "buses"],
    queryFn: () => api.getBuses(),
  });

  const routesQuery = useQuery<BusRoute[]>({
    queryKey: ["transport", "routes"],
    queryFn: () => api.getRoutes(),
  });

  const assignmentsQuery = useQuery<StudentBusAssignment[]>({
    queryKey: ["transport", "assignments"],
    queryFn: () => api.getAssignments(),
  });

  const buses = busesQuery.data ?? [];
  const routes = routesQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];

  const activeBuses = buses.filter((b) => b.status === "active" || b.status === "in_transit");
  const inMaintenanceBuses = buses.filter((b) => b.status === "maintenance");

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Transport Dashboard">
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                    <Bus className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fleet</p>
                    <p className="text-3xl font-bold">{buses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active / In Transit</p>
                    <p className="text-3xl font-bold">{activeBuses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-violet-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg">
                    <Route className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Routes</p>
                    <p className="text-3xl font-bold">{routes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Students</p>
                    <p className="text-3xl font-bold">{assignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Fleet Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-blue-600" /> Fleet Status
                </CardTitle>
                <CardDescription>Real-time bus fleet overview</CardDescription>
              </CardHeader>
              <CardContent>
                {busesQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading fleet...</p>
                ) : buses.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No buses registered yet. Add buses from the <strong>Fleet</strong> tab.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {buses.map((bus) => (
                      <div key={bus.id} className="flex items-center justify-between rounded-xl border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                            <Bus className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{bus.bus_number}</p>
                            <p className="text-xs text-muted-foreground">{bus.driver_name} · {bus.route_name || "No route"}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[bus.status] ?? statusColors.inactive}`}>
                          {bus.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Routes Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-violet-600" /> Routes Overview
                </CardTitle>
                <CardDescription>Active transport routes and stops</CardDescription>
              </CardHeader>
              <CardContent>
                {routesQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading routes...</p>
                ) : routes.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No routes configured. Add routes from the <strong>Routes</strong> tab.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {routes.map((route) => (
                      <div key={route.id} className="rounded-xl border p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{route.route_name}</p>
                          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            {route.stops.length} stops
                          </span>
                        </div>
                        {route.timings && (
                          <p className="mt-1 text-xs text-muted-foreground">🕐 {route.timings}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {route.stops.slice(0, 4).map((stop, idx) => (
                            <span key={idx} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {stop.name}
                            </span>
                          ))}
                          {route.stops.length > 4 && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              +{route.stops.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Alert */}
          {inMaintenanceBuses.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="pt-6">
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  ⚠️ {inMaintenanceBuses.length} bus{inMaintenanceBuses.length > 1 ? "es are" : " is"} under maintenance:
                  {" "}{inMaintenanceBuses.map(b => b.bus_number).join(", ")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
