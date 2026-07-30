"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Clock, X, DoorOpen, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, HostelRequestItem, HostelRoom } from "@/lib/api";

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  approved: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  allocated: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
  rejected: "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-300",
};

export default function HostelRequestsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedReq, setSelectedReq] = useState<HostelRequestItem | null>(null);
  const [allocatedRoomId, setAllocatedRoomId] = useState("");
  const [remarks, setRemarks] = useState("");

  const requestsQuery = useQuery<HostelRequestItem[]>({
    queryKey: ["hostel", "requests", statusFilter],
    queryFn: () => api.getHostelRequests(statusFilter || undefined),
  });

  const roomsQuery = useQuery<HostelRoom[]>({
    queryKey: ["hostel", "rooms", "available"],
    queryFn: () => api.getHostelRooms({ status_filter: "available" }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, room_id, rem }: { id: string; room_id?: string; rem?: string }) =>
      api.approveHostelRequest(id, { allocated_room_id: room_id || undefined, remarks: rem }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "requests"] });
      qc.invalidateQueries({ queryKey: ["hostel", "allocations"] });
      qc.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setSelectedReq(null);
      setAllocatedRoomId("");
      setRemarks("");
      toast.success("Hostel Request Approved & Allocated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rem }: { id: string; rem?: string }) =>
      api.rejectHostelRequest(id, { remarks: rem }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "requests"] });
      qc.invalidateQueries({ queryKey: ["hostel", "stats"] });
      setSelectedReq(null);
      setRemarks("");
      toast.success("Hostel Request Rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const requests = requestsQuery.data ?? [];
  const availableRooms = roomsQuery.data ?? [];

  const filtered = requests.filter(
    (r) =>
      !search ||
      r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.preferred_hostel?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin", "warden"]}>
      <DashboardShell title="Student Hostel Requests">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, roll no, hostel..."
                className="w-64 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="">All Requests</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="allocated">Allocated</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-sm text-muted-foreground">{filtered.length} request(s)</span>
            </div>
          </div>

          {/* Action Modal for Selected Request */}
          {selectedReq && (
            <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" /> Review Request for {selectedReq.student_name} ({selectedReq.roll_no})
                </CardTitle>
                <CardDescription>Preferred Hostel: {selectedReq.preferred_hostel} · Reason: {selectedReq.request_reason}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Assign Room (Optional / Immediate Allocation)</label>
                    <select
                      value={allocatedRoomId}
                      onChange={(e) => setAllocatedRoomId(e.target.value)}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      <option value="">-- Approve Without Immediate Room --</option>
                      {availableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.hostel_name} - Room {r.room_number} ({r.capacity - r.occupied} beds free)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Remarks / Approval Comment</label>
                    <input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Approved for Semester 1 accommodation"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate({ id: selectedReq.id, room_id: allocatedRoomId, rem: remarks })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5"
                  >
                    <CheckCheck className="h-4 w-4" /> Approve & Allocate
                  </Button>

                  <Button
                    variant="outline"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate({ id: selectedReq.id, rem: remarks })}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg gap-1.5"
                  >
                    <X className="h-4 w-4" /> Reject Request
                  </Button>

                  <Button variant="ghost" onClick={() => setSelectedReq(null)} className="rounded-lg">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requests List Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" /> Accommodation Requests
              </CardTitle>
              <CardDescription>Student applications for hostel accommodation</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {requestsQuery.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading requests...</p>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No hostel requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Preferred Hostel</th>
                        <th className="px-4 py-3 font-medium">Reason</th>
                        <th className="px-4 py-3 font-medium">Applied Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{req.student_name}</p>
                            <p className="text-xs text-muted-foreground">{req.roll_no} · {req.department}</p>
                          </td>
                          <td className="px-4 py-3 font-medium">{req.preferred_hostel}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{req.request_reason}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[req.status] ?? statusColors.pending}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {req.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs text-amber-600 hover:bg-amber-50 border-amber-300"
                                onClick={() => setSelectedReq(req)}
                              >
                                Review
                              </Button>
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
