"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, Edit2, MapPin, Phone, Plus, Trash2, User, Wifi } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, BusVehicle, BusRoute } from "@/lib/api";

const statusColors: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  in_transit: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
  maintenance: "text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-300",
  inactive: "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
};

export default function TransportBusesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editBus, setEditBus] = useState<BusVehicle | null>(null);
  const [locationBus, setLocationBus] = useState<BusVehicle | null>(null);
  const [form, setForm] = useState({ bus_number: "", driver_name: "", driver_phone: "", capacity: "40", route_id: "", status: "active" });
  const [locForm, setLocForm] = useState({ latitude: "12.9716", longitude: "77.5946", speed: "35", status: "moving" });

  const busesQuery = useQuery<BusVehicle[]>({ queryKey: ["transport", "buses"], queryFn: () => api.getBuses() });
  const routesQuery = useQuery<BusRoute[]>({ queryKey: ["transport", "routes"], queryFn: () => api.getRoutes() });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.createBus(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "buses"] }); setShowForm(false); resetForm(); toast.success("Bus added successfully"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.updateBus(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "buses"] }); setEditBus(null); resetForm(); toast.success("Bus updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBus(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "buses"] }); toast.success("Bus deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const locationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.updateBusLocation(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "buses"] }); setLocationBus(null); toast.success("Location updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => setForm({ bus_number: "", driver_name: "", driver_phone: "", capacity: "40", route_id: "", status: "active" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, capacity: parseInt(form.capacity), route_id: form.route_id || undefined };
    if (editBus) {
      updateMutation.mutate({ id: editBus.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (bus: BusVehicle) => {
    setEditBus(bus);
    setForm({ bus_number: bus.bus_number, driver_name: bus.driver_name, driver_phone: bus.driver_phone, capacity: String(bus.capacity), route_id: bus.route_id ?? "", status: bus.status });
    setShowForm(true);
  };

  const buses = busesQuery.data ?? [];
  const routes = routesQuery.data ?? [];

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Fleet Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{buses.length} bus{buses.length !== 1 ? "es" : ""} registered</p>
            <Button onClick={() => { setEditBus(null); resetForm(); setShowForm(!showForm); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Bus
            </Button>
          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-base">{editBus ? "Edit Bus" : "Register New Bus"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Bus Number *</label>
                    <input required value={form.bus_number} onChange={e => setForm(f => ({ ...f, bus_number: e.target.value }))}
                      placeholder="MH 01 AB 1234" className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Driver Name *</label>
                    <input required value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))}
                      placeholder="Ramesh Kumar" className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Driver Phone *</label>
                    <input required value={form.driver_phone} onChange={e => setForm(f => ({ ...f, driver_phone: e.target.value }))}
                      placeholder="+91 9876543210" className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Capacity</label>
                    <input type="number" min="10" max="80" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Assign Route</label>
                    <select value={form.route_id} onChange={e => setForm(f => ({ ...f, route_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">-- No Route --</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="active">Active</option>
                      <option value="in_transit">In Transit</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {editBus ? "Update Bus" : "Register Bus"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditBus(null); resetForm(); }}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* GPS Simulator */}
          {locationBus && (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-600" /> Update GPS Location — {locationBus.bus_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); locationMutation.mutate({ id: locationBus.id, data: { latitude: parseFloat(locForm.latitude), longitude: parseFloat(locForm.longitude), speed: parseFloat(locForm.speed), status: locForm.status } }); }}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                    <input type="number" step="any" value={locForm.latitude} onChange={e => setLocForm(f => ({ ...f, latitude: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                    <input type="number" step="any" value={locForm.longitude} onChange={e => setLocForm(f => ({ ...f, longitude: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Speed (km/h)</label>
                    <input type="number" min="0" value={locForm.speed} onChange={e => setLocForm(f => ({ ...f, speed: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Movement Status</label>
                    <select value={locForm.status} onChange={e => setLocForm(f => ({ ...f, status: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="moving">Moving</option>
                      <option value="stopped">Stopped</option>
                      <option value="idle">Idle</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
                    <Button type="submit" disabled={locationMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">Update GPS Location</Button>
                    <Button type="button" variant="outline" onClick={() => setLocationBus(null)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Fleet Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bus className="h-5 w-5 text-blue-600" /> Registered Fleet</CardTitle>
              <CardDescription>Manage all campus buses and driver assignments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {busesQuery.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading fleet...</p>
              ) : buses.length === 0 ? (
                <div className="p-12 text-center">
                  <Bus className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No buses registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Bus No.</th>
                        <th className="px-4 py-3 font-medium">Driver</th>
                        <th className="px-4 py-3 font-medium">Route</th>
                        <th className="px-4 py-3 font-medium">Capacity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {buses.map((bus) => (
                        <tr key={bus.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold">{bus.bus_number}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{bus.driver_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{bus.driver_phone}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {bus.route_name ? (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-violet-500" />
                                <span>{bus.route_name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No route</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{bus.capacity} seats</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[bus.status] ?? statusColors.inactive}`}>
                              {bus.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-600 hover:bg-green-50 border-green-200"
                                onClick={() => { setLocationBus(bus); setLocForm({ latitude: "12.9716", longitude: "77.5946", speed: "35", status: "moving" }); }}>
                                <Wifi className="h-3 w-3 mr-1" /> GPS
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(bus)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:bg-destructive/10"
                                onClick={() => { if (confirm("Delete this bus?")) deleteMutation.mutate(bus.id); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
