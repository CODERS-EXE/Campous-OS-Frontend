"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FacultyNotesPage() {
  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Notes & Materials">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Notes upload with Cloudinary — Phase 2</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </AuthGuard>
  );
}
