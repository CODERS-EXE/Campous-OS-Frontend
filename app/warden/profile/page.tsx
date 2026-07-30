"use client";

import { Mail, Phone, User, Calendar, Building2, Home } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";

export default function WardenProfilePage() {
  const { user, college } = useAuthStore();

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="My Profile">
        <div className="space-y-6">
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
                {typeof user?.profile?.phone === "string" ? (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.profile.phone}</p>
                    </div>
                  </div>
                ) : null}
                {typeof user?.profile?.designation === "string" ? (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Designation</p>
                      <p className="font-medium">{user.profile.designation}</p>
                    </div>
                  </div>
                ) : null}
                {typeof user?.profile?.hostel === "string" ? (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hostel</p>
                      <p className="font-medium">{user.profile.hostel}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>College Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">College Name</p>
                    <p className="font-medium">{college?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subdomain</p>
                    <p className="font-medium">{college?.subdomain}.campusos.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
