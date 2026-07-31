"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, Edit2, MapPin, Phone, Plus, Trash2, User, Wifi, Navigation, Gauge } from "lucide-react";
import { FormField, FormSelect, SubmitButton } from "@/components/shared/forms";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, BusVehicle, BusRoute } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function TransportBusesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editBus, setEditBus] = useState<BusVehicle | null>(null);
  const [locationBus, setLocationBus] = useState<BusVehicle | null>(null);
  const [form, setForm] = useState({ bus_number: "", driver_name: "", driver_phone: "", capacity: "40", route_id: "", status: "active" });
  const [locForm, setLocForm] = useState({ latitude: "12.9716", longitude: "77.5946", speed: "35", status: "moving" });

  const { data: buses = [], isLoading } = useQuery<BusVehicle[]>({
    queryKey: ["transport", "buses"],
    queryFn: () => api.getBuses(),
  });
  const { data: routes = [] } = useQuery<BusRoute[]>({
    queryKey: ["transport", "routes"],
    queryFn: () => api.getRoutes(),
  });

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

  const busStatusMap: Record<string, string> = {
    active: "active",
    in_transit: "active",
    maintenance: "under_maintenance",
    inactive: "inactive",
  };

  const busStatusLabel: Record<string, string> = {
    active: "Active",
    in_transit: "In Transit",
    maintenance: "Maintenance",
    inactive: "Inactive",
  };

  // Table Columns
  const columns: ColumnDef<BusVehicle>[] = [
    {
      header: "Bus Number",
      accessorKey: "bus_number",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-extrabold text-foreground flex items-center gap-1.5">
          <Bus className="h-3.5 w-3.5 text-blue-500" /> {row.bus_number}
        </span>
      ),
    },
    {
      header: "Driver",
      accessorKey: "driver_name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" /> {row.driver_name}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> {row.driver_phone}
          </p>
        </div>
      ),
    },
    {
      header: "Assigned Route",
      accessorKey: "route_name",
      sortable: true,
      cell: (row) =>
        row.route_name ? (
          <span className="flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400">
            <MapPin className="h-3.5 w-3.5" /> {row.route_name}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">No route assigned</span>
        ),
    },
    {
      header: "Capacity",
      accessorKey: "capacity",
      sortable: true,
      cell: (row) => <span className="font-bold">{row.capacity} seats</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <StatusBadge status={busStatusMap[row.status] || "inactive"} label={busStatusLabel[row.status] || row.status} />
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-emerald-600 hover:bg-emerald-500/10 rounded-xl text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setLocationBus(row);
              setLocForm({ latitude: "12.9716", longitude: "77.5946", speed: "35", status: "moving" });
            }}
          >
            <Wifi className="h-3 w-3 mr-1" /> GPS
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-indigo-500/10 hover:text-indigo-500 rounded-xl"
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-500/10 rounded-xl"
            onClick={(e) => { e.stopPropagation(); if (confirm("Delete this bus?")) deleteMutation.mutate(row.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Fleet Management">
        <div className="space-y-6">
          {/* Add / Edit Bus Form */}
          {showForm && (
            <Card className="border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 backdrop-blur-xl rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bus className="h-4 w-4 text-blue-500" />
                  {editBus ? "Edit Bus Details" : "Register New Bus"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    id="bus_number"
                    label="Bus Number"
                    value={form.bus_number}
                    onChange={(val) => setForm((f) => ({ ...f, bus_number: val }))}
                    required
                    placeholder="MH 01 AB 1234"
                    icon={Bus}
                  />

                  <FormField
                    id="driver_name"
                    label="Driver Name"
                    value={form.driver_name}
                    onChange={(val) => setForm((f) => ({ ...f, driver_name: val }))}
                    required
                    placeholder="Ramesh Kumar"
                    icon={User}
                  />

                  <FormField
                    id="driver_phone"
                    label="Driver Phone"
                    type="tel"
                    value={form.driver_phone}
                    onChange={(val) => setForm((f) => ({ ...f, driver_phone: val }))}
                    required
                    placeholder="+91 9876543210"
                    icon={Phone}
                  />

                  <FormField
                    id="capacity"
                    label="Seating Capacity"
                    type="number"
                    min={10}
                    max={80}
                    value={form.capacity}
                    onChange={(val) => setForm((f) => ({ ...f, capacity: val }))}
                    icon={Gauge}
                  />

                  <FormSelect
                    id="route_id"
                    label="Assign Route"
                    value={form.route_id}
                    onChange={(val) => setForm((f) => ({ ...f, route_id: val }))}
                    placeholder="-- No Route --"
                    options={routes.map((r) => ({ value: r.id, label: r.route_name }))}
                    icon={Navigation}
                  />

                  <FormSelect
                    id="status"
                    label="Bus Status"
                    value={form.status}
                    onChange={(val) => setForm((f) => ({ ...f, status: val }))}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "in_transit", label: "In Transit" },
                      { value: "maintenance", label: "Maintenance" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                  />

                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3 pt-2">
                    <SubmitButton
                      type="submit"
                      isLoading={createMutation.isPending || updateMutation.isPending}
                      loadingText={editBus ? "Updating..." : "Registering..."}
                      successText={editBus ? "Updated!" : "Registered!"}
                    >
                      {editBus ? "Update Bus" : "Register Bus"}
                    </SubmitButton>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditBus(null); resetForm(); }} className="rounded-2xl">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* GPS Location Update Form */}
          {locationBus && (
            <Card className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 backdrop-blur-xl rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-emerald-500" />
                  Update GPS — {locationBus.bus_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    locationMutation.mutate({
                      id: locationBus.id,
                      data: { latitude: parseFloat(locForm.latitude), longitude: parseFloat(locForm.longitude), speed: parseFloat(locForm.speed), status: locForm.status },
                    });
                  }}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <FormField
                    id="latitude"
                    label="Latitude"
                    type="number"
                    step="any"
                    value={locForm.latitude}
                    onChange={(val) => setLocForm((f) => ({ ...f, latitude: val }))}
                    icon={MapPin}
                  />
                  <FormField
                    id="longitude"
                    label="Longitude"
                    type="number"
                    step="any"
                    value={locForm.longitude}
                    onChange={(val) => setLocForm((f) => ({ ...f, longitude: val }))}
                    icon={MapPin}
                  />
                  <FormField
                    id="speed"
                    label="Speed (km/h)"
                    type="number"
                    step="any"
                    value={locForm.speed}
                    onChange={(val) => setLocForm((f) => ({ ...f, speed: val }))}
                    icon={Gauge}
                  />
                  <FormSelect
                    id="loc_status"
                    label="Movement Status"
                    value={locForm.status}
                    onChange={(val) => setLocForm((f) => ({ ...f, status: val }))}
                    options={[
                      { value: "moving", label: "Moving" },
                      { value: "stopped", label: "Stopped" },
                      { value: "idle", label: "Idle" },
                      { value: "delayed", label: "Delayed" },
                    ]}
                  />

                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4 pt-2">
                    <SubmitButton
                      type="submit"
                      variant="success"
                      isLoading={locationMutation.isPending}
                      loadingText="Updating GPS..."
                      successText="GPS Updated!"
                    >
                      Update GPS Location
                    </SubmitButton>
                    <Button type="button" variant="outline" onClick={() => setLocationBus(null)} className="rounded-2xl">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Premium Fleet DataTable */}
          <DataTable
            title={`Registered Fleet (${buses.length})`}
            description="Manage all campus buses, drivers, routes, and GPS status"
            data={buses}
            columns={columns}
            searchPlaceholder="Search bus number, driver, route..."
            searchFields={["bus_number", "driver_name", "driver_phone", "route_name"]}
            exportFileName="bus_fleet"
            isLoading={isLoading}
            emptyMessage="No buses registered. Click 'Add Bus' to register your first vehicle."
            actions={
              <Button
                onClick={() => { setEditBus(null); resetForm(); setShowForm(!showForm); }}
                className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Bus
              </Button>
            }
          />
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
