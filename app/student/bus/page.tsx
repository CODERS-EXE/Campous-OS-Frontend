"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bus, Clock, MapPin, Phone, Route, User, Wifi, WifiOff, Zap } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, MyBusResponse } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  moving: { label: "En Route", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300", dot: "bg-emerald-500" },
  stopped: { label: "At Stop", color: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300", dot: "bg-blue-500" },
  idle: { label: "Idle", color: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300", dot: "bg-amber-500" },
  delayed: { label: "Delayed", color: "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-300", dot: "bg-red-500" },
};

function LiveMapCanvas({ location, stops }: { location: MyBusResponse["location"]; stops: MyBusResponse["route"]["stops"] }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border">
      {/* Animated map grid */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="absolute border-t border-slate-400" style={{ top: `${(i + 1) * 12.5}%`, left: 0, right: 0 }} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute border-l border-slate-400" style={{ left: `${(i + 1) * 10}%`, top: 0, bottom: 0 }} />
        ))}
      </div>

      {/* Route path SVG */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {stops.length > 1 && stops.map((_, idx) => {
          if (idx === stops.length - 1) return null;
          const x1 = 15 + (idx / (stops.length - 1)) * 70;
          const y1 = 25 + (idx % 2 === 0 ? 20 : 60);
          const x2 = 15 + ((idx + 1) / (stops.length - 1)) * 70;
          const y2 = 25 + ((idx + 1) % 2 === 0 ? 20 : 60);
          return (
            <line key={idx} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
              stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round" />
          );
        })}
      </svg>

      {/* Stop markers */}
      {stops.map((stop, idx) => {
        const x = 15 + (idx / Math.max(stops.length - 1, 1)) * 70;
        const y = 25 + (idx % 2 === 0 ? 20 : 60);
        return (
          <div key={idx} className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}>
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${idx === 0 ? "bg-emerald-500" : idx === stops.length - 1 ? "bg-red-500" : "bg-violet-500"}`} />
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white shadow">
              {stop.name}
            </div>
          </div>
        );
      })}

      {/* Animated bus marker */}
      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
        style={{ left: `45%`, top: `45%` }}>
        <div className="relative">
          <div className={`absolute -inset-3 rounded-full bg-blue-500 opacity-30 ${tick % 2 === 0 ? "scale-100" : "scale-125"} transition-transform duration-700`} />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-xl border-2 border-white">
            <Bus className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-medium">LIVE</span>
      </div>

      {/* Speed chip */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
        <Zap className="h-3 w-3 text-amber-500" />
        <span className="text-xs font-medium">{location.speed.toFixed(0)} km/h</span>
      </div>

      {/* GPS Coords */}
      <div className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1.5 shadow-md backdrop-blur-sm">
        <span className="text-xs text-muted-foreground">
          {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
        </span>
      </div>
    </div>
  );
}

export default function StudentBusPage() {
  const { user } = useAuthStore();
  const [pollingActive, setPollingActive] = useState(true);

  const busQuery = useQuery<MyBusResponse>({
    queryKey: ["transport", "my-bus"],
    queryFn: () => api.getMyBus(),
    enabled: !!user,
    refetchInterval: pollingActive ? 30000 : false,
    retry: false,
  });

  if (!user) return null;

  const bus = busQuery.data;
  const locStatus = bus ? statusConfig[bus.location.status] ?? statusConfig.moving : null;

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Live Bus Tracking">
        <div className="space-y-6">
          {busQuery.isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Bus className="mx-auto h-12 w-12 text-muted-foreground/40 animate-pulse" />
                <p className="mt-3 text-sm text-muted-foreground">Loading your bus information...</p>
              </CardContent>
            </Card>
          )}

          {busQuery.isError && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="py-10 text-center">
                <WifiOff className="mx-auto h-12 w-12 text-amber-400" />
                <p className="mt-3 font-medium text-amber-700 dark:text-amber-300">No Bus Assignment Found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are not assigned to any bus route yet. Please contact your college administrator.
                </p>
              </CardContent>
            </Card>
          )}

          {bus && (
            <>
              {/* Live Map */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" /> Live Bus Location
                      </CardTitle>
                      <CardDescription>Real-time GPS tracking of your assigned bus</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5"
                      onClick={() => setPollingActive(!pollingActive)}>
                      {pollingActive ? <Wifi className="h-3.5 w-3.5 text-emerald-600" /> : <WifiOff className="h-3.5 w-3.5" />}
                      {pollingActive ? "Live" : "Paused"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <LiveMapCanvas location={bus.location} stops={bus.route.stops} />
                </CardContent>
              </Card>

              {/* Status and ETA */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">Bus Status</p>
                    {locStatus && (
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${locStatus.color}`}>
                        <span className={`h-2 w-2 rounded-full ${locStatus.dot} animate-pulse`} />
                        {locStatus.label}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Arrival</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      <span className="text-2xl font-bold">
                        {bus.eta_minutes > 0 ? `${bus.eta_minutes} min` : "Arriving"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs text-muted-foreground mb-1">Current Speed</p>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <span className="text-2xl font-bold">{bus.location.speed.toFixed(0)} km/h</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                {/* Bus & Driver Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="h-5 w-5 text-blue-600" /> Bus & Driver Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                      <span className="text-sm text-muted-foreground">Bus Number</span>
                      <span className="font-semibold text-blue-600">{bus.bus.bus_number}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" /> Driver Name
                      </div>
                      <span className="font-medium">{bus.bus.driver_name}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" /> Driver Phone
                      </div>
                      <a href={`tel:${bus.bus.driver_phone}`} className="font-medium text-blue-600 hover:underline">{bus.bus.driver_phone}</a>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                      <span className="text-sm text-muted-foreground">Seating Capacity</span>
                      <span className="font-medium">{bus.bus.capacity} seats</span>
                    </div>
                    {bus.assignment.stop_name && (
                      <div className="flex items-center justify-between rounded-xl bg-violet-50 dark:bg-violet-950/30 px-4 py-3 border border-violet-200 dark:border-violet-800">
                        <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
                          <MapPin className="h-4 w-4" /> Your Boarding Stop
                        </div>
                        <span className="font-semibold text-violet-700 dark:text-violet-300">{bus.assignment.stop_name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Route Stops */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5 text-violet-600" /> {bus.route.route_name}
                    </CardTitle>
                    {bus.route.timings && (
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {bus.route.timings}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {bus.route.stops.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No stop information available</p>
                    ) : (
                      <div className="relative pl-4">
                        {bus.route.stops.map((stop, idx) => (
                          <div key={idx} className="relative pb-4 last:pb-0">
                            {idx < bus.route.stops.length - 1 && (
                              <div className="absolute left-[-8px] top-4 h-full w-0.5 bg-border" />
                            )}
                            <div className="flex items-start gap-3">
                              <div className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 shadow-sm ${
                                idx === 0 ? "bg-emerald-500" : idx === bus.route.stops.length - 1 ? "bg-red-500" : stop.name === bus.assignment.stop_name ? "bg-violet-600" : "bg-slate-400"
                              }`}>
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium ${stop.name === bus.assignment.stop_name ? "text-violet-600 dark:text-violet-400" : ""}`}>
                                    {stop.name}
                                    {stop.name === bus.assignment.stop_name && (
                                      <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">Your Stop</span>
                                    )}
                                  </p>
                                  {stop.estimated_time && (
                                    <span className="text-xs text-muted-foreground">{stop.estimated_time}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Location auto-refreshes every 30 seconds · Last updated: {new Date(bus.location.timestamp).toLocaleTimeString()}
              </p>
            </>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
