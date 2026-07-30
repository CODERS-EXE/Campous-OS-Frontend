"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AiWorkspace } from "@/components/shared/AiWorkspace";

export default function WardenAiPage() {
  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="AI Assistant Workspace">
        <AiWorkspace />
      </DashboardShell>
    </AuthGuard>
  );
}
