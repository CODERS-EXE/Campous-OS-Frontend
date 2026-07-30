"use client";

import { Building2, GraduationCap, Mail, Shield, User } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";

export default function CollegeAdminProfilePage() {
  const { user, college } = useAuthStore();

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="My Profile">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tenant/10">
                  <User className="h-8 w-8 text-tenant" />
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
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-medium text-green-600">
                      {user?.is_verified ? "Verified" : "Pending Verification"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm font-medium">{user?.id?.slice(0, 16)}…</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> College Information
              </CardTitle>
              <CardDescription>Your institution details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">College Name</p>
                    <p className="font-medium">{college?.name || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subdomain</p>
                    <p className="font-medium">{college?.subdomain}.campusos.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium capitalize">{college?.plan || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">College Status</p>
                    <p className="font-medium capitalize text-green-600">{college?.status || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Privileges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Admin Privileges
              </CardTitle>
              <CardDescription>Your access level and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Manage Students",
                  "Manage Faculty",
                  "Manage Parents",
                  "Manage Wardens",
                  "View Analytics",
                  "AI Assistant Access",
                ].map((privilege) => (
                  <div
                    key={privilege}
                    className="flex items-center gap-2 rounded-xl border bg-green-50 p-3 dark:bg-green-950/20"
                  >
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      {privilege}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
