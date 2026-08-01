"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, PlacementDrive } from "@/lib/api";
import { Briefcase, MapPin, Calendar, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function StudentPlacementsPage() {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery<{ drives: PlacementDrive[] }>({
    queryKey: ["open-drives"],
    queryFn: () => api.get("/api/v1/placements/drives?status=open"),
  });

  const applyMutation = useMutation({
    mutationFn: (driveId: string) =>
      api.post<{ id: string }>("/api/v1/placements/applications", { drive_id: driveId }),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["open-drives"] });
      queryClient.invalidateQueries({ queryKey: ["my-placement-applications"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to submit application"),
  });

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Placement Drives">
        <div className="space-y-6">
          <p className="text-muted-foreground">Browse and apply to active placement drives on campus</p>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : response?.drives && response.drives.length > 0 ? (
            <div className="space-y-4">
              {response.drives.map((drive) => (
                <Card key={drive.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold">{drive.company?.name || "Company"}</p>
                        <p className="text-sm font-medium text-muted-foreground">{drive.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{drive.package?.ctc ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase font-bold">LPA CTC</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          {drive.locations?.[0]?.city || "Multiple locations"}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          Deadline: {formatDate(drive.deadline)}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                          {drive.role_type?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
                        <div className="text-xs space-y-0.5 text-muted-foreground">
                          <p>Min CGPA: <span className="font-semibold text-foreground">{drive.eligibility?.min_cgpa ?? 0}</span></p>
                          <p>Max Backlogs Allowed: <span className="font-semibold text-foreground">{drive.eligibility?.max_backlogs ?? 0}</span></p>
                        </div>
                        <Button
                          disabled={drive.has_applied || applyMutation.isPending}
                          onClick={() => applyMutation.mutate(drive.id)}
                          className={drive.has_applied ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : ""}
                        >
                          {drive.has_applied ? (
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4" /> Applied
                            </span>
                          ) : (
                            "Apply Now"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              No open placement drives currently active. Please check back later.
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
