"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, PlacementDrive } from "@/lib/api";
import { Plus, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PlacementDrivesPage() {
  const { data: response } = useQuery<{ drives: PlacementDrive[] }>({
    queryKey: ["placement-drives"],
    queryFn: () => api.get("/api/v1/placements/drives"),
  });

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Placement Drives">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage placement recruitment drives</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Drive
            </Button>
          </div>

          <div className="space-y-4">
            {response?.drives.map((drive) => (
              <Card key={drive.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{drive.title}</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{drive.package.ctc} LPA
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Company</p>
                      <p className="font-medium">{drive.company?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium">{drive.role}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(drive.deadline)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applications</p>
                      <p className="font-medium">{drive.total_applications}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <span className={`px-2 py-1 text-xs rounded ${drive.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {drive.status}
                      </span>
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
