"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Mail, Phone, User } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function ParentChildrenPage() {
  const { user } = useAuthStore();

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["my-children"],
    queryFn: () => api.get<Student[]>("/api/v1/users/my-children"),
    enabled: !!user,
  });

  const myChildren = studentsQuery.data ?? [];

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="My Children">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Children Overview</CardTitle>
              <CardDescription>
                {myChildren.length === 0
                  ? "No children linked to your account"
                  : `${myChildren.length} child${myChildren.length > 1 ? "ren" : ""} enrolled`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading children...</p>
              )}
              {!studentsQuery.isLoading && myChildren.length === 0 && (
                <div className="py-8 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No children are currently linked to your account.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please contact your college administrator to link your children.
                  </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {myChildren.map((child) => (
                  <Card key={child.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tenant/10">
                          <GraduationCap className="h-8 w-8 text-tenant" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{child.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">Roll No: {child.roll_no}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-xl border p-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm truncate">{child.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border p-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Department</p>
                            <p className="text-sm font-medium">{child.department}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border p-3">
                            <p className="text-xs text-muted-foreground">Year</p>
                            <p className="text-sm font-medium">Year {child.year}</p>
                          </div>
                          <div className="rounded-xl border p-3">
                            <p className="text-xs text-muted-foreground">Semester</p>
                            <p className="text-sm font-medium">Sem {child.semester}</p>
                          </div>
                        </div>
                        {child.blood_group && (
                          <div className="flex items-center gap-3 rounded-xl border p-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Blood Group</p>
                              <p className="text-sm font-medium">{child.blood_group}</p>
                            </div>
                          </div>
                        )}
                        {child.emergency_contact && (
                          <div className="flex items-center gap-3 rounded-xl border p-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Emergency Contact</p>
                              <p className="text-sm font-medium">{child.emergency_contact}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <a href={`/parent/attendance?child=${child.user_id}`}>View Attendance</a>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <a href={`/parent/results?child=${child.user_id}`}>View Results</a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
