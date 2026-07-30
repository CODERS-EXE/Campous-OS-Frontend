"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, LogOut, Plus, RefreshCw, UserCheck, Users } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, HostelRoom, HostelRoomAllocation, Student } from "@/lib/api";

const statusColors: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  vacated: "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
  changed: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
};

export default function HostelAllocationsPage() {
  const qc = useQueryClient();
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [changeStudent, setChangeStudent] = useState<HostelRoomAllocation | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const [allocForm, setAllocForm] = useState({
    student_id: "",
    room_id: "",
    remarks: "",
  });

  const [changeForm, setChangeForm] = useState({
    new_room_id: "",
    remarks: "",
  });

  const allocationsQuery = useQuery<HostelRoomAllocation[]>({
    queryKey: ["hostel", "allocations", statusFilter],
    queryFn: () => api.getHostelAllocations(statusFilter || undefined),
  });

  const roomsQuery = useQuery<HostelRoom[]>({
    queryKey: ["hostel", "rooms", "available"],
    queryFn: () => api.getHostelRooms({ status_filter: "available" }),
  });

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students", "all"],
    queryFn: () => api.getStudents(),
  });

  const allocateMutation = useMutation({
    mutationFn: (data: { student_id: string; room_id: string; remarks?: string }) => api.allocateHostelRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "allocations"] });
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setShowAllocateModal(false);
      setAllocForm({ student_id: "", room_id: "", remarks: "" });
      toast.success("Student allocated to room");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeMutation = useMutation({
    mutationFn: (data: { student_id: string; new_room_id: string; remarks?: string }) => api.changeHostelRoom(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "allocations"] });
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setChangeStudent(null);
      setChangeForm({ new_room_id: "", remarks: "" });
      toast.success("Student room changed successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const vacateMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => api.vacateHostelRoom(id, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "allocations"] });
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      toast.success("Student vacated from room");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    allocateMutation.mutate(allocForm);
  };

  const handleChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeStudent) return;
    changeMutation.mutate({
      student_id: changeStudent.student_id,
      new_room_id: changeForm.new_room_id,
      remarks: changeForm.remarks || "Room changed by warden/admin",
    });
  };

  const allocations = allocationsQuery.data ?? [];
  const availableRooms = roomsQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const filtered = allocations.filter(
    (a) =>
      !search ||
      a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
      a.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.hostel_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin", "warden"]}>
      <DashboardShell title="Hostel Room Allocations">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, roll no, room..."
                className="w-64 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">All History</option>
                <option value="active">Active Allocations</option>
                <option value="vacated">Vacated</option>
                <option value="changed">Room Changed</option>
              </select>
              <span className="text-sm text-muted-foreground">{filtered.length} record(s)</span>
            </div>

            <Button
              onClick={() => setShowAllocateModal(!showAllocateModal)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              <Plus className="h-4 w-4" /> Allocate Room
            </Button>
          </div>

          {/* Allocate Room Form */}
          {showAllocateModal && (
            <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" /> Allocate Student to Room
                </CardTitle>
                <CardDescription>Select an unallocated student and an available hostel room</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAllocateSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Select Student *</label>
                    <select
                      required
                      value={allocForm.student_id}
                      onChange={(e) => setAllocForm((f) => ({ ...f, student_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">-- Select Student --</option>
                      {students.map((s) => (
                        <option key={s.user_id} value={s.user_id}>
                          {s.name} ({s.roll_no}) - {s.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Select Available Room *</label>
                    <select
                      required
                      value={allocForm.room_id}
                      onChange={(e) => setAllocForm((f) => ({ ...f, room_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">-- Select Room --</option>
                      {availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.hostel_name} - Room {r.room_number} ({r.capacity - r.occupied} beds free)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Remarks / Allocation Notes</label>
                    <input
                      value={allocForm.remarks}
                      onChange={(e) => setAllocForm((f) => ({ ...f, remarks: e.target.value }))}
                      placeholder="e.g. Regular semester allocation"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3 pt-2">
                    <Button type="submit" disabled={allocateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                      Confirm Allocation
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAllocateModal(false)} className="rounded-lg">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Change Room Modal */}
          {changeStudent && (
            <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-600" /> Change Room for {changeStudent.student_name}
                </CardTitle>
                <CardDescription>Current Room: {changeStudent.hostel_name} - Room {changeStudent.room_number}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeSubmit} className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Select New Available Room *</label>
                    <select
                      required
                      value={changeForm.new_room_id}
                      onChange={(e) => setChangeForm((f) => ({ ...f, new_room_id: e.target.value }))}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Select New Room --</option>
                      {availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.hostel_name} - Room {r.room_number} ({r.capacity - r.occupied} beds free)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Reason for Change</label>
                    <input
                      value={changeForm.remarks}
                      onChange={(e) => setChangeForm((f) => ({ ...f, remarks: e.target.value }))}
                      placeholder="e.g. Student requested room transfer"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                    <Button type="submit" disabled={changeMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      Transfer Student
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setChangeStudent(null)} className="rounded-lg">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Allocation Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Student Room Allocations
              </CardTitle>
              <CardDescription>Active and historical room occupancy records</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {allocationsQuery.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading allocations...</p>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No allocation records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Hostel & Room</th>
                        <th className="px-4 py-3 font-medium">Allocated Date</th>
                        <th className="px-4 py-3 font-medium">Allocated By</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{a.student_name}</p>
                            <p className="text-xs text-muted-foreground">{a.roll_no} · {a.department}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <DoorOpen className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium">{a.hostel_name} - Room {a.room_number}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(a.allocated_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{a.allocated_by_name || "Warden"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[a.status] ?? statusColors.active}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.status === "active" && (
                              <div className="flex items-center justify-end gap-1">
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 border-blue-200" onClick={() => setChangeStudent(a)}>
                                  <RefreshCw className="h-3 w-3 mr-1" /> Change
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    if (confirm(`Vacate ${a.student_name} from Room ${a.room_number}?`)) {
                                      vacateMutation.mutate({ id: a.id, remarks: "Vacated by warden" });
                                    }
                                  }}
                                >
                                  <LogOut className="h-3 w-3 mr-1" /> Vacate
                                </Button>
                              </div>
                            )}
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
