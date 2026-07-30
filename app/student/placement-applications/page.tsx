"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { api, StudentApplication } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function MyApplicationsPage() {
  const { data: response } = useQuery<{ applications: StudentApplication[] }>({
    queryKey: ["my-applications"],
    queryFn: () => api.get("/api/v1/placements/applications"),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-100 text-blue-700",
      shortlisted: "bg-green-100 text-green-700",
      selected: "bg-green-600 text-white",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="My Applications">
        <div className="space-y-4">
          {response?.applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{app.company?.name || 'Company'}</h3>
                    <p className="text-sm text-muted-foreground">{app.drive?.role}</p>
                    <p className="text-xs text-muted-foreground">
                      Applied on {formatDate(app.applied_at)}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold">₹{app.drive?.package.ctc} LPA</p>
                    <span className={`px-3 py-1 text-xs rounded ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!response?.applications || response.applications.length === 0) && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No applications yet. Browse placement drives to apply.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
