"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, PlacementDrive } from "@/lib/api";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentPlacementsPage() {
  const { data: response } = useQuery<{ drives: PlacementDrive[] }>({
    queryKey: ["open-drives"],
    queryFn: () => api.get("/api/v1/placements/drives?status=open"),
  });

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Placement Drives">
        <div className="space-y-6">
          <p className="text-muted-foreground">Browse and apply to open placement drives</p>

          <div className="space-y-4">
            {response?.drives.map((drive) => (
              <Card key={drive.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <p className="text-lg">{drive.company?.name || 'Company'}</p>
                      <p className="text-sm font-normal text-muted-foreground">{drive.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{drive.package.ctc}</p>
                      <p className="text-xs text-muted-foreground">LPA</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {drive.locations[0]?.city || 'Multiple locations'}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Deadline: {formatDate(drive.deadline)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        {drive.role_type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs space-y-1">
                        <p>Min CGPA: {drive.eligibility.min_cgpa}</p>
                        <p>Max Backlogs: {drive.eligibility.max_backlogs}</p>
                      </div>
                      <Button disabled={drive.has_applied}>
                        {drive.has_applied ? 'Applied' : 'Apply Now'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
