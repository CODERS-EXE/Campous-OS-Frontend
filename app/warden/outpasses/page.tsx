"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api, Outpass } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function WardenOutpassesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedOutpass, setSelectedOutpass] = useState<Outpass | null>(null);
  const [remarks, setRemarks] = useState("");

  const outpassesQuery = useQuery<Outpass[]>({
    queryKey: ["outpasses", statusFilter],
    queryFn: () =>
      api.get<Outpass[]>(
        `/api/v1/hostel/outpasses${statusFilter !== "all" ? `?status_filter=${statusFilter}` : ""}`
      ),
    enabled: !!user,
  });

  const updateOutpassMutation = useMutation({
    mutationFn: (data: { id: string; status: string; remarks?: string }) =>
      api.patch(`/api/v1/hostel/outpasses/${data.id}`, {
        status: data.status,
        remarks: data.remarks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outpasses"] });
      setSelectedOutpass(null);
      setRemarks("");
    },
  });

  const pendingCount = useMemo(
    () => outpassesQuery.data?.filter((o) => o.status === "pending").length || 0,
    [outpassesQuery.data]
  );

  const handleApprove = (outpass: Outpass) => {
    if (confirm(`Approve outpass for ${outpass.student_name}?`)) {
      updateOutpassMutation.mutate({
        id: outpass.id,
        status: "approved",
        remarks: remarks || undefined,
      });
    }
  };

  const handleReject = (outpass: Outpass) => {
    if (confirm(`Reject outpass for ${outpass.student_name}?`)) {
      updateOutpassMutation.mutate({
        id: outpass.id,
        status: "rejected",
        remarks: remarks || "Rejected by warden",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Outpass Management">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{outpassesQuery.data?.length || 0}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Outpass Requests</CardTitle>
              <CardDescription>
                {statusFilter === "all"
                  ? "All outpass requests"
                  : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} requests`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outpassesQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading outpass requests...</p>
              )}
              {!outpassesQuery.isLoading && (outpassesQuery.data?.length || 0) === 0 && (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No {statusFilter !== "all" ? statusFilter : ""} outpass requests found.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {outpassesQuery.data?.map((outpass) => (
                  <Card
                    key={outpass.id}
                    className={
                      outpass.status === "pending"
                        ? "border-orange-200 dark:border-orange-800"
                        : ""
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{outpass.student_name}</p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(outpass.status)}`}
                            >
                              {getStatusIcon(outpass.status)}
                              {outpass.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Roll: {outpass.student_roll_no}
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Reason:</span> {outpass.reason}
                            </div>
                            {outpass.destination && (
                              <div className="text-sm">
                                <span className="font-medium">Destination:</span>{" "}
                                {outpass.destination}
                              </div>
                            )}
                            {outpass.contact_number && (
                              <div className="text-sm">
                                <span className="font-medium">Contact:</span>{" "}
                                {outpass.contact_number}
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="font-medium">Duration:</span>{" "}
                              {formatDate(outpass.from_date)} to {formatDate(outpass.to_date)}
                            </div>
                            {outpass.remarks && (
                              <div className="text-sm">
                                <span className="font-medium">Remarks:</span> {outpass.remarks}
                              </div>
                            )}
                            {outpass.approved_by_name && (
                              <div className="text-sm text-muted-foreground">
                                {outpass.status === "approved" ? "Approved" : "Rejected"} by{" "}
                                {outpass.approved_by_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {outpass.status === "pending" && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <div>
                            <Label htmlFor={`remarks-${outpass.id}`}>Remarks (Optional)</Label>
                            <textarea
                              id={`remarks-${outpass.id}`}
                              value={selectedOutpass?.id === outpass.id ? remarks : ""}
                              onChange={(e) => {
                                setSelectedOutpass(outpass);
                                setRemarks(e.target.value);
                              }}
                              placeholder="Add remarks..."
                              className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(outpass)}
                              disabled={updateOutpassMutation.status === "pending"}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleReject(outpass)}
                              disabled={updateOutpassMutation.status === "pending"}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
