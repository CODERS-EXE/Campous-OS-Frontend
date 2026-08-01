"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api, StudentApplication } from "@/lib/api";
import { User, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: response, isLoading } = useQuery<{ applications: StudentApplication[] }>({
    queryKey: ["student-applications"],
    queryFn: () => api.get("/api/v1/placements/applications"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { appId: string; status: string }) =>
      api.patch(`/api/v1/placements/applications/${data.appId}/status`, { status: data.status }),
    onSuccess: () => {
      toast.success("Application status updated");
      queryClient.invalidateQueries({ queryKey: ["student-applications"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update status"),
  });

  const applications = (response?.applications || []).filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.student_name.toLowerCase().includes(q) ||
        app.student_roll_no.toLowerCase().includes(q) ||
        (app.company?.name || "").toLowerCase().includes(q) ||
        (app.drive?.role || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AuthGuard allowedRoles={["college_admin", "faculty"]}>
      <DashboardShell title="Student Applications">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student, roll no, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Student</p>
                        <p className="font-bold flex items-center gap-1.5 text-sm">
                          <User className="h-4 w-4 text-indigo-500" />
                          {app.student_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{app.student_roll_no} • {app.student_department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Company</p>
                        <p className="font-semibold text-sm">{app.company?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Role</p>
                        <p className="font-semibold text-sm">{app.drive?.role || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Current Status</p>
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                            app.status === "selected"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : app.status === "shortlisted"
                              ? "bg-indigo-500/10 text-indigo-600"
                              : app.status === "rejected"
                              ? "bg-rose-500/10 text-rose-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status !== "shortlisted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => updateStatusMutation.mutate({ appId: app.id, status: "shortlisted" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Shortlist
                          </Button>
                        )}
                        {app.status !== "selected" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => updateStatusMutation.mutate({ appId: app.id, status: "selected" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Select
                          </Button>
                        )}
                        {app.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-rose-500 hover:bg-rose-500/10"
                            onClick={() => updateStatusMutation.mutate({ appId: app.id, status: "rejected" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              No placement applications match your search criteria.
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
