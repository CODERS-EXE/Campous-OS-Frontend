"use client";

import { Mail, User, Calendar, Shield } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";

export default function SuperAdminProfilePage() {
  const { user } = useAuthStore();

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="My Profile">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tenant/10">
                  <Shield className="h-8 w-8 text-tenant" />
                </div>
                <div>
                  <CardTitle>{user?.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {user?.role.replace("_", " ")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{user?.role.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Access</CardTitle>
              <CardDescription>Super Administrator privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <span className="font-medium">College Management</span>
                  <span className="text-green-600">Full Access</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <span className="font-medium">User Management</span>
                  <span className="text-green-600">Full Access</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <span className="font-medium">Platform Analytics</span>
                  <span className="text-green-600">Full Access</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <span className="font-medium">System Settings</span>
                  <span className="text-green-600">Full Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
