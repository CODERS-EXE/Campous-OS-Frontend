"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bus, Clock, MapPin, Phone, Route, User, Users, Wifi, WifiOff, Zap } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, MyBusResponse, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  moving: { label: "En Route", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300", dot: "bg-emerald-500" },
  stopped: { label: "At Stop", color: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300", dot: "bg-blue-500" },
  idle: { label: "Idle", color: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300", dot: "bg-amber-500" },
  delayed: { label: "Delayed", color: "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-300", dot: "bg-red-500" },
};

function MiniMapCanvas({ location, stops }: { location: MyBusResponse["location"]; stops: MyBusResponse["route"]["stops"] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border">
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute border-t border-slate-400" style={{ top: `${(i + 1) * 14.28}%`, left: 0, right: 0 }} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute border-l border-slate-400" style={{ left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0 }} />
        ))}
      </div>
      <svg className="absolute inset-0 w-full h-full">
        {stops.length > 1 && stops.map((_, idx) => {
          if (idx === stops.length - 1) return null;
          const x1 = 10 + (idx / (stops.length - 1)) * 80;
          const y1 = 30 + (idx % 2 === 0 ? 15 : 55);
          const x2 = 10 + ((idx + 1) / (stops.length - 1)) * 80;
          const y2 = 30 + ((idx + 1) % 2 === 0 ? 15 : 55);
          return <line key={idx} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
            stroke="#6d28d9" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />;
        })}
      </svg>
      {stops.map((_, idx) => {
        const x = 10 + (idx / Math.max(stops.length - 1, 1)) * 80;
        const y = 30 + (idx % 2 === 0 ? 15 : 55);
        return (
          <div key={idx} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow ${idx === 0 ? "bg-emerald-500" : idx === stops.length - 1 ? "bg-red-500" : "bg-violet-500"}`} />
          </div>
        );
      })}
      <div className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "50%" }}>
        <div className={`absolute -inset-2 rounded-full bg-blue-500 opacity-25 ${tick % 2 === 0 ? "scale-100" : "scale-125"} transition-transform duration-700`} />
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg">
          <Bus className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 shadow backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-medium">LIVE</span>
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 shadow backdrop-blur-sm">
        <Zap className="h-2.5 w-2.5 text-amber-500" />
        <span className="text-[10px] font-medium">{location.speed.toFixed(0)} km/h</span>
      </div>
    </div>
  );
}

function ChildBusCard({ child, pollingActive }: { child: Student; pollingActive: boolean }) {
  const busQuery = useQuery<MyBusResponse>({
    queryKey: ["transport", "my-bus", child.user_id],
    queryFn: () => api.getMyBus(child.user_id),
    refetchInterval: pollingActive ? 30000 : false,
    retry: false,
  });

  const bus = busQuery.data;
  const locStatus = bus ? statusConfig[bus.location.status] ?? statusConfig.moving : null;

  return (
    <Card className="overflow-hidden">
      {/* Child Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/10 text-violet-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{child.name}</p>
          <p className="text-xs text-muted-foreground">{child.department} · Year {child.year}</p>
        </div>
        {busQuery.isLoading && <span className="ml-auto text-xs text-muted-foreground animate-pulse">Loading...</span>}
      </div>

      <CardContent className="p-4 space-y-4">
        {busQuery.isError ? (
          <div className="rounded-xl border border-dashed py-6 text-center">
            <WifiOff className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No bus assignment found</p>
          </div>
        ) : !bus ? null : (
          <>
            <MiniMapCanvas location={bus.location} stops={bus.route.stops} />
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">Status</p>
                {locStatus && (
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${locStatus.dot} animate-pulse`} />
                    <span className="text-xs font-medium">{locStatus.label}</span>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">ETA</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">
                  {bus.eta_minutes > 0 ? `${bus.eta_minutes}m` : "Now"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">Speed</p>
                <p className="mt-1 text-sm font-bold text-amber-600">{bus.location.speed.toFixed(0)} km/h</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bus className="h-3.5 w-3.5" /> Bus
                </div>
                <span className="font-semibold text-blue-600">{bus.bus.bus_number}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> Driver
                </div>
                <span className="font-medium">{bus.bus.driver_name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </div>
                <a href={`tel:${bus.bus.driver_phone}`} className="font-medium text-blue-600 hover:underline text-sm">
                  {bus.bus.driver_phone}
                </a>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Route className="h-3.5 w-3.5" /> Route
                </div>
                <span className="font-medium text-right max-w-[60%] truncate">{bus.route.route_name}</span>
              </div>
              {bus.assignment.stop_name && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Boarding Stop
                  </div>
                  <span className="font-semibold text-violet-600">{bus.assignment.stop_name}</span>
                </div>
              )}
              {bus.route.timings && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Schedule
                  </div>
                  <span className="text-muted-foreground">{bus.route.timings}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentBusPage() {
  const { user } = useAuthStore();
  const [pollingActive, setPollingActive] = useState(true);

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["my-children"],
    queryFn: () => api.getMyChildren(),
    enabled: !!user,
  });

  const myChildren = useMemo(() => {
    if (!user?.profile?.student_ids || !studentsQuery.data) return [];
    const childIds = user.profile.student_ids as string[];
    return studentsQuery.data.filter((student) => childIds.includes(student.user_id));
  }, [user, studentsQuery.data]);

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Live Bus Tracking">
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {myChildren.length > 0
                ? `Tracking ${myChildren.length} child${myChildren.length > 1 ? "ren" : ""}`
                : "Waiting for child data..."}
            </p>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPollingActive(!pollingActive)}>
              {pollingActive ? <Wifi className="h-3.5 w-3.5 text-emerald-600" /> : <WifiOff className="h-3.5 w-3.5" />}
              {pollingActive ? "Live Updates ON" : "Updates Paused"}
            </Button>
          </div>

          {studentsQuery.isLoading && (
            <Card>
              <CardContent className="py-10 text-center">
                <Bus className="mx-auto h-10 w-10 text-muted-foreground/40 animate-pulse" />
                <p className="mt-3 text-sm text-muted-foreground">Loading bus information...</p>
              </CardContent>
            </Card>
          )}

          {!studentsQuery.isLoading && myChildren.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 font-medium">No Children Linked</p>
                <p className="mt-1 text-sm text-muted-foreground">Contact your college administrator to link your children.</p>
              </CardContent>
            </Card>
          )}

          {/* Children Bus Cards */}
          {myChildren.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {myChildren.map((child) => (
                <ChildBusCard key={child.user_id} child={child} pollingActive={pollingActive} />
              ))}
            </div>
          )}

          {/* Info Panel */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">About Bus Tracking</CardTitle>
              <CardDescription>How live bus tracking works</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Real-time GPS</p>
                    <p className="text-xs text-muted-foreground">Location updates every 30 seconds from the bus device</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-violet-600">
                    <Route className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Route Visibility</p>
                    <p className="text-xs text-muted-foreground">See all stops and scheduled timings for the route</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ETA Estimates</p>
                    <p className="text-xs text-muted-foreground">Dynamic arrival estimates based on current speed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
