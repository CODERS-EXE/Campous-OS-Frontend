"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function FacultySettingsPage() {
  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Faculty Settings">
        <SettingsView allowedRoles={["faculty"]} roleTitle="Faculty Settings" />
      </DashboardShell>
    </AuthGuard>
  );
}
