"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function StudentSettingsPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Student Settings">
        <SettingsView allowedRoles={["student"]} roleTitle="Student Settings" />
      </DashboardShell>
    </AuthGuard>
  );
}
