"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, MapPin, Plus, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, BusVehicle, BusRoute, StudentBusAssignment, Student } from "@/lib/api";

export default function TransportAssignmentsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: "", bus_id: "", route_id: "", stop_name: "" });
  const [search, setSearch] = useState("");

  const assignmentsQuery = useQuery<StudentBusAssignment[]>({ queryKey: ["transport", "assignments"], queryFn: () => api.getAssignments() });
  const busesQuery = useQuery<BusVehicle[]>({ queryKey: ["transport", "buses"], queryFn: () => api.getBuses() });
  const routesQuery = useQuery<BusRoute[]>({ queryKey: ["transport", "routes"], queryFn: () => api.getRoutes() });
  const studentsQuery = useQuery<Student[]>({ queryKey: ["students", "all"], queryFn: () => api.get<Student[]>("/api/v1/users/students") });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.createAssignment(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "assignments"] }); setShowForm(false); setForm({ student_id: "", bus_id: "", route_id: "", stop_name: "" }); toast.success("Student assigned to bus"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAssignment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transport", "assignments"] }); toast.success("Assignment removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignments = assignmentsQuery.data ?? [];
  const buses = busesQuery.data ?? [];
  const routes = routesQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const selectedRoute = routes.find(r => r.id === form.route_id);

  const filtered = assignments.filter(a =>
    !search || a.student_name?.toLowerCase().includes(search.toLowerCase()) || a.bus_number?.toLowerCase().includes(search.toLowerCase()) || a.route_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Student Bus Assignments">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, bus or route..."
                className="w-64 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <span className="text-sm text-muted-foreground">{filtered.length} assignments</span>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" /> Assign Student
            </Button>
          </div>

          {showForm && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardHeader><CardTitle className="text-base">Assign Student to Bus</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Student *</label>
                    <select required value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="">-- Select Student --</option>
                      {students.map(s => <option key={s.user_id} value={s.user_id}>{s.name} ({s.roll_no})</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Bus *</label>
                    <select required value={form.bus_id} onChange={e => setForm(f => ({ ...f, bus_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="">-- Select Bus --</option>
                      {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number} ({b.driver_name})</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Route *</label>
                    <select required value={form.route_id} onChange={e => setForm(f => ({ ...f, route_id: e.target.value, stop_name: "" }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="">-- Select Route --</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.route_name}</option>)}
                    </select>
                  </div>
                  {selectedRoute && selectedRoute.stops.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Boarding Stop</label>
                      <select value={form.stop_name} onChange={e => setForm(f => ({ ...f, stop_name: e.target.value }))}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <option value="">-- Select Stop --</option>
                        {selectedRoute.stops.map((s, idx) => <option key={idx} value={s.name}>{s.name} {s.estimated_time ? `(${s.estimated_time})` : ""}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
                    <Button type="submit" disabled={createMutation.isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
                      Assign to Bus
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-amber-600" /> Bus Assignments</CardTitle>
              <CardDescription>Students assigned to transport routes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {assignmentsQuery.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading assignments...</p>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No assignments found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Bus</th>
                        <th className="px-4 py-3 font-medium">Route</th>
                        <th className="px-4 py-3 font-medium">Boarding Stop</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{a.student_name}</p>
                            <p className="text-xs text-muted-foreground">{a.roll_no}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Bus className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{a.bus_number}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-violet-500" />
                              <span>{a.route_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{a.stop_name || "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:bg-destructive/10"
                              onClick={() => { if (confirm("Remove this assignment?")) deleteMutation.mutate(a.id); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
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
