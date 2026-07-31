"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function CollegeAdminSettingsPage() {
  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="College Admin Settings">
        <SettingsView allowedRoles={["college_admin"]} roleTitle="College Admin Settings" />
      </DashboardShell>
    </AuthGuard>
  );
}
