"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Clock, DoorOpen, Home, Send, User, Users, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, HostelRequestItem, MyRoomResponse } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { FormSelect, FormTextarea, SubmitButton } from "@/components/shared/forms";
import { FileText } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  approved: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  allocated: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
  rejected: "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-300",
};

export default function StudentHostelPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [preferredHostel, setPreferredHostel] = useState("Boys Block A");
  const [requestReason, setRequestReason] = useState("");

  const myRoomQuery = useQuery<MyRoomResponse>({
    queryKey: ["hostel", "my-room"],
    queryFn: () => api.getMyHostelRoom(),
    enabled: !!user,
  });

  const requestsQuery = useQuery<HostelRequestItem[]>({
    queryKey: ["hostel", "my-requests"],
    queryFn: () => api.getHostelRequests(),
    enabled: !!user,
  });

  const requestMutation = useMutation({
    mutationFn: (data: { preferred_hostel: string; request_reason: string }) => api.createHostelRequest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hostel", "my-room"] });
      qc.invalidateQueries({ queryKey: ["hostel", "my-requests"] });
      setRequestReason("");
      toast.success("Hostel accommodation request submitted successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      toast.error("Please provide a reason for accommodation request");
      return;
    }
    requestMutation.mutate({ preferred_hostel: preferredHostel, request_reason: requestReason });
  };

  const myRoomData = myRoomQuery.data;
  const myRequests = requestsQuery.data ?? [];

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Hostel Accommodation">
        <div className="space-y-6">
          {myRoomQuery.isLoading && (
            <Card>
              <CardContent className="py-10 text-center">
                <Home className="mx-auto h-10 w-10 text-muted-foreground/40 animate-pulse" />
                <p className="mt-3 text-sm text-muted-foreground">Loading room status...</p>
              </CardContent>
            </Card>
          )}

          {myRoomData?.allocated && myRoomData.room && (
            <>
              {/* Allocated Room Card */}
              <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-background to-background dark:border-indigo-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                          <DoorOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Room {myRoomData.room.room_number}</CardTitle>
                          <CardDescription>{myRoomData.building?.name || myRoomData.room.hostel_name}</CardDescription>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active Resident
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="rounded-xl border bg-background p-3">
                        <span className="text-xs text-muted-foreground block">Hostel Block</span>
                        <span className="font-semibold">{myRoomData.room.hostel_name}</span>
                      </div>
                      <div className="rounded-xl border bg-background p-3">
                        <span className="text-xs text-muted-foreground block">Floor</span>
                        <span className="font-semibold">Floor {myRoomData.room.floor || 1}</span>
                      </div>
                      <div className="rounded-xl border bg-background p-3">
                        <span className="text-xs text-muted-foreground block">Room Type</span>
                        <span className="font-semibold capitalize">{myRoomData.room.room_type}</span>
                      </div>
                      <div className="rounded-xl border bg-background p-3">
                        <span className="text-xs text-muted-foreground block">Occupancy</span>
                        <span className="font-semibold">{myRoomData.room.occupied} / {myRoomData.room.capacity} beds</span>
                      </div>
                    </div>

                    {myRoomData.room.amenities && myRoomData.room.amenities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Room Amenities & Inventory</p>
                        <div className="flex flex-wrap gap-1.5">
                          {myRoomData.room.amenities.map((item, idx) => (
                            <span key={idx} className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Roommates Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-5 w-5 text-indigo-600" /> Roommate(s)
                    </CardTitle>
                    <CardDescription>Peers sharing your room</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!myRoomData.roommates || myRoomData.roommates.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        <User className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                        No other roommates assigned yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myRoomData.roommates.map((mate, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600 font-bold text-sm">
                              {mate.name.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-medium text-sm truncate">{mate.name}</p>
                              <p className="text-xs text-muted-foreground">{mate.roll_no} · {mate.department}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Not Allocated State: Submit Request Form */}
          {myRoomData && !myRoomData.allocated && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-amber-600" /> Apply for Hostel Room
                  </CardTitle>
                  <CardDescription>Submit an accommodation request for hostel allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <FormSelect
                      id="pref_hostel"
                      label="Preferred Hostel Block / Type"
                      value={preferredHostel}
                      onChange={(val) => setPreferredHostel(val)}
                      required
                      options={[
                        { value: "Boys Block A", label: "Boys Block A (North Campus)" },
                        { value: "Boys Block B", label: "Boys Block B (South Campus)" },
                        { value: "Girls Block A", label: "Girls Block A (Main Campus)" },
                        { value: "Girls Block B", label: "Girls Block B (Executive)" },
                        { value: "Single Room", label: "Single Room Preference" },
                      ]}
                      icon={Building2}
                    />

                    <FormTextarea
                      id="req_reason"
                      label="Reason for Request"
                      value={requestReason}
                      onChange={(val) => setRequestReason(val)}
                      required
                      rows={3}
                      placeholder="e.g. Outstation student requiring full-term semester accommodation..."
                      icon={FileText}
                    />

                    <SubmitButton
                      type="submit"
                      variant="warning"
                      isLoading={requestMutation.isPending}
                      loadingText="Submitting..."
                      successText="Submitted!"
                      fullWidth
                    >
                      <Send className="h-4 w-4" /> Submit Accommodation Request
                    </SubmitButton>
                  </form>
                </CardContent>
              </Card>

              {/* Information Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hostel Allocation Guidelines</CardTitle>
                  <CardDescription>Key rules and procedure for hostel accommodation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Allocations are processed by Warden & Administration based on availability and request priority.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Once allocated, your assigned room number and roommates will appear on this dashboard immediately.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>For outpass permits or temporary leave requests, visit the Warden Outpass portal.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Student Request History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" /> Accommodation Request History
              </CardTitle>
              <CardDescription>Your past and pending hostel requests</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {requestsQuery.isLoading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading history...</p>
              ) : myRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No hostel request history</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Preferred Hostel</th>
                        <th className="px-4 py-3 font-medium">Reason</th>
                        <th className="px-4 py-3 font-medium">Submitted On</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {myRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{req.preferred_hostel}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{req.request_reason}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[req.status] ?? statusColors.pending}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{req.remarks || "—"}</td>
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
