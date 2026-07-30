"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, User, Calendar, Building2, BookOpen, Award } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function StudentProfilePage() {
  const { user, college } = useAuthStore();

  const studentQuery = useQuery<Student>({
    queryKey: ["student-profile"],
    queryFn: () => api.get<Student>("/api/v1/users/me/profile"),
    enabled: !!user,
  });

  const student = studentQuery.data;

  return (
    <AuthGuard allowedRoles={["student"]}>
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
                  <CardDescription className="capitalize">{user?.role.replace("_", " ")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              )}
              {student && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="font-medium">{student.roll_no}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{student.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year / Semester</p>
                      <p className="font-medium">Year {student.year} - Sem {student.semester}</p>
                    </div>
                  </div>
                  {student.course && (
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Course</p>
                        <p className="font-medium">{student.course}</p>
                      </div>
                    </div>
                  )}
                  {student.blood_group && (
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Group</p>
                        <p className="font-medium">{student.blood_group}</p>
                      </div>
                    </div>
                  )}
                  {student.emergency_contact && (
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-medium">{student.emergency_contact}</p>
                      </div>
                    </div>
                  )}
                  {student.created_at && (
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Enrolled On</p>
                        <p className="font-medium">{formatDate(student.created_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
