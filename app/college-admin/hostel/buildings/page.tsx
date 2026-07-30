"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Edit2, Layers, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, HostelBuilding } from "@/lib/api";

const statusColors: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  under_maintenance: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  inactive: "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
};

export default function HostelBuildingsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editBuilding, setEditBuilding] = useState<HostelBuilding | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    total_floors: "4",
    total_rooms: "40",
    gender: "unisex",
    status: "active",
    description: "",
  });

  const buildingsQuery = useQuery<HostelBuilding[]>({
    queryKey: ["hostel", "buildings"],
    queryFn: () => api.getHostelBuildings(),
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.createHostelBuilding(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "buildings"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setShowForm(false);
      resetForm();
      toast.success("Hostel Building created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.updateHostelBuilding(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "buildings"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setEditBuilding(null);
      setShowForm(false);
      resetForm();
      toast.success("Hostel Building updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteHostelBuilding(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "buildings"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      toast.success("Building deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({
      name: "",
      total_floors: "4",
      total_rooms: "40",
      gender: "unisex",
      status: "active",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      total_floors: parseInt(form.total_floors),
      total_rooms: parseInt(form.total_rooms),
    };

    if (editBuilding) {
      updateMutation.mutate({ id: editBuilding.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (bld: HostelBuilding) => {
    setEditBuilding(bld);
    setForm({
      name: bld.name,
      total_floors: String(bld.total_floors),
      total_rooms: String(bld.total_rooms),
      gender: bld.gender || "unisex",
      status: bld.status,
      description: bld.description || "",
    });
    setShowForm(true);
  };

  const buildings = buildingsQuery.data ?? [];
  const filtered = buildings.filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin", "warden"]}>
      <DashboardShell title="Hostel Buildings">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search building name..."
                className="w-64 rounded-xl border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <span className="text-sm text-muted-foreground">{filtered.length} building(s)</span>
            </div>
            <Button
              onClick={() => {
                setEditBuilding(null);
                resetForm();
                setShowForm(!showForm);
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              <Plus className="h-4 w-4" /> Add Building
            </Button>
          </div>

          {/* Form Modal/Card */}
          {showForm && (
            <Card className="border-indigo-200 bg-indigo-50/40 dark:border-indigo-800 dark:bg-indigo-950/20">
              <CardHeader>
                <CardTitle className="text-base">{editBuilding ? "Edit Hostel Building" : "Add New Hostel Building"}</CardTitle>
                <CardDescription>Configure building name, floor capacity, and status</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Building Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Ramanujan Hostel Block A"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Total Floors</label>
                    <input
                      type="number"
                      min="1"
                      value={form.total_floors}
                      onChange={(e) => setForm((f) => ({ ...f, total_floors: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Expected Total Rooms</label>
                    <input
                      type="number"
                      min="1"
                      value={form.total_rooms}
                      onChange={(e) => setForm((f) => ({ ...f, total_rooms: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Gender Category</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="male">Boys Hostel</option>
                      <option value="female">Girls Hostel</option>
                      <option value="unisex">Co-ed / Unisex</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="active">Active</option>
                      <option value="under_maintenance">Under Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                    <label className="text-xs font-medium text-muted-foreground">Description / Notes</label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="e.g. Main North Campus block with mess and study hall"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3 pt-2">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                      {editBuilding ? "Update Building" : "Create Building"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditBuilding(null); resetForm(); }} className="rounded-lg">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Building Cards */}
          {buildingsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading hostel buildings...</p>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No hostel buildings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((bld) => (
                <Card key={bld.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{bld.name}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">{bld.gender || "Unisex"} Hostel</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[bld.status] ?? statusColors.active}`}>
                        {bld.status.replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bld.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{bld.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <span className="text-muted-foreground block">Floors</span>
                        <span className="font-semibold text-sm">{bld.total_floors}</span>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2 text-center">
                        <span className="text-muted-foreground block">Rooms</span>
                        <span className="font-semibold text-sm">{bld.total_rooms}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      <span>Beds Occupied: <strong className="text-foreground">{bld.occupied ?? 0} / {bld.capacity ?? 0}</strong></span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-indigo-600" onClick={() => openEdit(bld)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete building ${bld.name}?`)) deleteMutation.mutate(bld.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
