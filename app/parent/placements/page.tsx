"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, StudentApplication, PlacementOffer } from "@/lib/api";
import { TrendingUp, Briefcase } from "lucide-react";

export default function ParentPlacementsPage() {
  const { data: applications } = useQuery<{ applications: StudentApplication[] }>({
    queryKey: ["child-applications"],
    queryFn: () => api.get("/api/v1/placements/applications"),
  });

  const { data: offers } = useQuery<{ offers: PlacementOffer[] }>({
    queryKey: ["child-offers"],
    queryFn: () => api.get("/api/v1/placements/offers"),
  });

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Child's Placements">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications?.applications.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{offers?.offers.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Offer</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{Math.max(...(offers?.offers.map(o => o.package_ctc) || [0]))} LPA
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications?.applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{app.company?.name}</p>
                      <p className="text-sm text-muted-foreground">{app.drive?.role}</p>
                    </div>
                    <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {app.status}
                    </span>
                  </div>
                ))}
                {(!applications?.applications || applications.applications.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">No placement activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
