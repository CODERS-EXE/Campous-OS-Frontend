"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function ParentSettingsPage() {
  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Parent Settings">
        <SettingsView allowedRoles={["parent"]} roleTitle="Parent Settings" />
      </DashboardShell>
    </AuthGuard>
  );
}
