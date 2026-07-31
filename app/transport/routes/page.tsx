"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Route, Trash2, Edit2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, BusRoute, BusStop } from "@/lib/api";
import { FormField, SubmitButton } from "@/components/shared/forms";

const DEFAULT_STOPS: BusStop[] = [
  { name: "College Main Gate", latitude: 12.9716, longitude: 77.5946, estimated_time: "07:30 AM" },
  { name: "City Center", latitude: 12.9784, longitude: 77.6408, estimated_time: "07:50 AM" },
];

export default function TransportRoutesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editRoute, setEditRoute] = useState<BusRoute | null>(null);
  const [form, setForm] = useState({ route_name: "", timings: "", stops: DEFAULT_STOPS });

  const routesQuery = useQuery<BusRoute[]>({ queryKey: ["transport", "routes"], queryFn: () => api.getRoutes() });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.createRoute(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "routes"] }); setShowForm(false); resetForm(); toast.success("Route created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.updateRoute(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "routes"] }); setEditRoute(null); setShowForm(false); resetForm(); toast.success("Route updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRoute(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "routes"] }); toast.success("Route deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => setForm({ route_name: "", timings: "", stops: DEFAULT_STOPS });

  const addStop = () => {
    setForm(f => ({
      ...f,
      stops: [...f.stops, { name: "", latitude: 12.9716, longitude: 77.5946, estimated_time: "" }]
    }));
  };

  const removeStop = (idx: number) => {
    setForm(f => ({ ...f, stops: f.stops.filter((_, i) => i !== idx) }));
  };

  const updateStop = (idx: number, field: keyof BusStop, value: string | number) => {
    setForm(f => ({
      ...f,
      stops: f.stops.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRoute) {
      updateMutation.mutate({ id: editRoute.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openEdit = (route: BusRoute) => {
    setEditRoute(route);
    setForm({ route_name: route.route_name, timings: route.timings ?? "", stops: route.stops });
    setShowForm(true);
  };

  const routes = routesQuery.data ?? [];

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Route Management">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{routes.length} route{routes.length !== 1 ? "s" : ""} configured</p>
            <Button onClick={() => { setEditRoute(null); resetForm(); setShowForm(!showForm); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Route
            </Button>
          </div>

          {showForm && (
            <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/20">
              <CardHeader>
                <CardTitle className="text-base">{editRoute ? "Edit Route" : "Create New Route"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="route_name"
                      label="Route Name"
                      value={form.route_name}
                      onChange={(val) => setForm(f => ({ ...f, route_name: val }))}
                      required
                      placeholder="e.g., North Campus - City Centre"
                      icon={Route}
                    />
                    <FormField
                      id="timings"
                      label="Operating Timings"
                      value={form.timings}
                      onChange={(val) => setForm(f => ({ ...f, timings: val }))}
                      placeholder="e.g., 07:30 AM - 05:30 PM"
                      icon={Clock}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Route Stops ({form.stops.length})</label>
                      <Button type="button" size="sm" variant="outline" onClick={addStop} className="gap-1.5 h-7 text-xs rounded-xl">
                        <Plus className="h-3 w-3" /> Add Stop
                      </Button>
                    </div>
                    {form.stops.map((stop, idx) => (
                      <div key={idx} className="grid gap-2 rounded-2xl border border-border/70 bg-card/60 p-3 sm:grid-cols-5">
                        <div className="sm:col-span-2">
                          <FormField
                            id={`stop_name_${idx}`}
                            label="Stop Name"
                            value={stop.name}
                            onChange={(val) => updateStop(idx, "name", val)}
                            placeholder="Stop name"
                            icon={MapPin}
                          />
                        </div>
                        <div>
                          <FormField
                            id={`stop_lat_${idx}`}
                            label="Latitude"
                            type="number"
                            step="any"
                            value={stop.latitude}
                            onChange={(val) => updateStop(idx, "latitude", parseFloat(val))}
                          />
                        </div>
                        <div>
                          <FormField
                            id={`stop_lng_${idx}`}
                            label="Longitude"
                            type="number"
                            step="any"
                            value={stop.longitude}
                            onChange={(val) => updateStop(idx, "longitude", parseFloat(val))}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <FormField
                              id={`stop_eta_${idx}`}
                              label="ETA"
                              value={stop.estimated_time ?? ""}
                              onChange={(val) => updateStop(idx, "estimated_time", val)}
                              placeholder="07:30 AM"
                            />
                          </div>
                          {form.stops.length > 1 && (
                            <Button type="button" size="icon" variant="outline" className="h-10 w-10 shrink-0 rounded-2xl text-destructive hover:bg-destructive/10"
                              onClick={() => removeStop(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <SubmitButton
                      type="submit"
                      isLoading={createMutation.isPending || updateMutation.isPending}
                      loadingText={editRoute ? "Updating..." : "Creating..."}
                      successText={editRoute ? "Updated!" : "Created!"}
                    >
                      {editRoute ? "Update Route" : "Create Route"}
                    </SubmitButton>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditRoute(null); resetForm(); }} className="rounded-2xl">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Routes List */}
          {routesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading routes...</p>
          ) : routes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Route className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No routes created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {routes.map((route) => (
                <Card key={route.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Route className="h-4 w-4 text-violet-600" /> {route.route_name}
                        </CardTitle>
                        {route.timings && (
                          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {route.timings}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => openEdit(route)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => { if (confirm("Delete this route?")) deleteMutation.mutate(route.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-4">
                      {route.stops.map((stop, idx) => (
                        <div key={idx} className="relative pb-3 last:pb-0">
                          {idx < route.stops.length - 1 && (
                            <div className="absolute left-[-8px] top-4 h-full w-px bg-border" />
                          )}
                          <div className="flex items-start gap-2">
                            <div className={`relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${idx === 0 ? "bg-emerald-500" : idx === route.stops.length - 1 ? "bg-red-500" : "bg-violet-500"}`}>
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium leading-tight">{stop.name}</p>
                              {stop.estimated_time && (
                                <p className="text-xs text-muted-foreground">{stop.estimated_time}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {route.stops.length} stops
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
