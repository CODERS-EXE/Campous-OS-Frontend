"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AiWorkspace } from "@/components/shared/AiWorkspace";

export default function CollegeAdminAiPage() {
  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="AI Assistant Workspace">
        <AiWorkspace />
      </DashboardShell>
    </AuthGuard>
  );
}
