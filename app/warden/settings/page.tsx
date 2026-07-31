"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsView } from "@/components/settings/SettingsView";

export default function WardenSettingsPage() {
  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Warden Settings">
        <SettingsView allowedRoles={["warden"]} roleTitle="Warden Settings" />
      </DashboardShell>
    </AuthGuard>
  );
}
