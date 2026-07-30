"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { api, StudentApplication } from "@/lib/api";
import { User } from "lucide-react";

export default function ApplicationsPage() {
  const { data: response } = useQuery<{ applications: StudentApplication[] }>({
    queryKey: ["student-applications"],
    queryFn: () => api.get("/api/v1/placements/applications"),
  });

  return (
    <AuthGuard allowedRoles={["college_admin", "faculty"]}>
      <DashboardShell title="Student Applications">
        <div className="space-y-4">
          {response?.applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {app.student_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{app.student_roll_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{app.company?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{app.drive?.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                      {app.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
