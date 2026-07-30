"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, User, Calendar, Building2, Users, GraduationCap } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function ParentProfilePage() {
  const { user, college } = useAuthStore();

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students", "all"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
    enabled: !!user,
  });

  const myChildren = useMemo(() => {
    if (!user?.profile?.student_ids || !studentsQuery.data) return [];
    const childIds = user.profile.student_ids as string[];
    return studentsQuery.data.filter((student) => childIds.includes(student.user_id));
  }, [user, studentsQuery.data]);

  return (
    <AuthGuard allowedRoles={["parent"]}>
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
                {typeof user?.profile?.phone === 'string' ? (
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.profile.phone}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Children Linked</p>
                    <p className="font-medium">{myChildren.length}</p>
                  </div>
                </div>
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

          {myChildren.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" /> My Children
                </CardTitle>
                <CardDescription>
                  {myChildren.length} child{myChildren.length > 1 ? "ren" : ""} linked to your
                  account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myChildren.map((child) => (
                    <div key={child.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Roll No: {child.roll_no} • {child.department}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Year {child.year} • Semester {child.semester}
                          </p>
                        </div>
                        <GraduationCap className="h-8 w-8 text-tenant" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {myChildren.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No children linked to your account yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please contact your college administrator to link your children.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
