"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, Edit2, Plus, Trash2, Users, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, HostelBuilding, HostelRoom } from "@/lib/api";

const statusColors: Record<string, string> = {
  available: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  occupied: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
  maintenance: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
};

export default function HostelRoomsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<HostelRoom | null>(null);
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    room_number: "",
    hostel_name: "Main Hostel",
    building_id: "",
    floor: "1",
    capacity: "2",
    room_type: "double",
    status: "available",
    amenities: "Bed, Study Table, Wardrobe",
  });

  const roomsQuery = useQuery<HostelRoom[]>({
    queryKey: ["hostel", "rooms", buildingFilter, statusFilter],
    queryFn: () => api.getHostelRooms({ building_id: buildingFilter || undefined, status_filter: statusFilter || undefined }),
  });

  const buildingsQuery = useQuery<HostelBuilding[]>({
    queryKey: ["hostel", "buildings"],
    queryFn: () => api.getHostelBuildings(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.createHostelRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setShowForm(false);
      resetForm();
      toast.success("Room created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.updateHostelRoom(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setEditRoom(null);
      setShowForm(false);
      resetForm();
      toast.success("Room updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteHostelRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      toast.success("Room deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({
      room_number: "",
      hostel_name: "Main Hostel",
      building_id: "",
      floor: "1",
      capacity: "2",
      room_type: "double",
      status: "available",
      amenities: "Bed, Study Table, Wardrobe",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArr = form.amenities.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      ...form,
      floor: parseInt(form.floor),
      capacity: parseInt(form.capacity),
      building_id: form.building_id || undefined,
      amenities: amenitiesArr,
    };

    if (editRoom) {
      updateMutation.mutate({ id: editRoom.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (rm: HostelRoom) => {
    setEditRoom(rm);
    setForm({
      room_number: rm.room_number,
      hostel_name: rm.hostel_name,
      building_id: rm.building_id || "",
      floor: String(rm.floor || 1),
      capacity: String(rm.capacity),
      room_type: rm.room_type,
      status: rm.status,
      amenities: rm.amenities ? rm.amenities.join(", ") : "Bed, Study Table, Wardrobe",
    });
    setShowForm(true);
  };

  const rooms = roomsQuery.data ?? [];
  const buildings = buildingsQuery.data ?? [];

  const filtered = rooms.filter(
    (r) =>
      !search ||
      r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.hostel_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin", "warden"]}>
      <DashboardShell title="Hostel Rooms Management">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room number..."
                className="w-48 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Full Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <span className="text-sm text-muted-foreground">{filtered.length} room(s)</span>
            </div>

            <Button
              onClick={() => {
                setEditRoom(null);
                resetForm();
                setShowForm(!showForm);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Room
            </Button>
          </div>

          {/* Create / Edit Form */}
          {showForm && (
            <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-base">{editRoom ? "Edit Room Details" : "Create New Hostel Room"}</CardTitle>
                <CardDescription>Configure room number, building association, and capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Room Number *</label>
                    <input
                      required
                      value={form.room_number}
                      onChange={(e) => setForm((f) => ({ ...f, room_number: e.target.value }))}
                      placeholder="e.g. 101-A"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Hostel Building</label>
                    <select
                      value={form.building_id}
                      onChange={(e) => setForm((f) => ({ ...f, building_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Standalone Hostel --</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Floor</label>
                    <input
                      type="number"
                      min="0"
                      value={form.floor}
                      onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Bed Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.capacity}
                      onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Room Type</label>
                    <select
                      value={form.room_type}
                      onChange={(e) => setForm((f) => ({ ...f, room_type: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="single">Single Occupancy</option>
                      <option value="double">Double Occupancy</option>
                      <option value="triple">Triple Sharing</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                    <label className="text-xs font-medium text-muted-foreground">Amenities (comma-separated)</label>
                    <input
                      value={form.amenities}
                      onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))}
                      placeholder="Bed, Study Table, Wardrobe, AC, Attached Bath"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3 pt-2">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      {editRoom ? "Update Room" : "Create Room"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditRoom(null); resetForm(); }} className="rounded-lg">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Rooms Inventory Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-blue-600" /> Room Inventory ({filtered.length})
              </CardTitle>
              <CardDescription>Manage rooms, capacity limits, and current occupants</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {roomsQuery.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading rooms...</p>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <DoorOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No rooms found matching filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Room No.</th>
                        <th className="px-4 py-3 font-medium">Hostel / Building</th>
                        <th className="px-4 py-3 font-medium">Floor</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Occupancy</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((rm) => (
                        <tr key={rm.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold text-blue-600">{rm.room_number}</td>
                          <td className="px-4 py-3">{rm.hostel_name}</td>
                          <td className="px-4 py-3">Floor {rm.floor || 1}</td>
                          <td className="px-4 py-3 capitalize text-xs font-medium">{rm.room_type}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-semibold">{rm.occupied} / {rm.capacity}</span>
                              <span className="text-xs text-muted-foreground">beds</span>
                            </div>
                            {rm.occupants && rm.occupants.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {rm.occupants.map((occ) => (
                                  <span key={occ.user_id} className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:text-indigo-300">
                                    {occ.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[rm.status] ?? statusColors.available}`}>
                              {rm.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(rm)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm(`Delete room ${rm.room_number}?`)) deleteMutation.mutate(rm.id);
                                }}
                              >
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
