"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function FacultyStudentsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
    enabled: !!user,
  });

  const filteredStudents = useMemo(
    () =>
      studentsQuery.data?.filter((student) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          student.name.toLowerCase().includes(term) ||
          student.roll_no.toLowerCase().includes(term) ||
          student.department.toLowerCase().includes(term) ||
          (student.course ?? "").toLowerCase().includes(term)
        );
      }) ?? [],
    [search, studentsQuery.data]
  );

  const selectedStudent = filteredStudents.find((student) => student.user_id === selectedStudentId) ?? null;

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Students">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Students</CardTitle>
              <CardDescription>Search and review learners assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search">Search</Label>
                <div className="relative mt-2">
                  <Input
                    id="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, roll number or department"
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                {studentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading students...</p>}
                {!studentsQuery.isLoading && filteredStudents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No assigned students found.</p>
                )}
                {filteredStudents.map((student) => (
                  <button
                    key={student.user_id}
                    type="button"
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedStudentId === student.user_id ? "border-tenant bg-tenant/5" : "border-border bg-background hover:border-tenant"}`}
                    onClick={() => setSelectedStudentId(student.user_id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.roll_no}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{student.department}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{student.course || "No course"}</span>
                      <span>Year {student.year}</span>
                      <span>Semester {student.semester}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
              <CardDescription>Review details for the selected student</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedStudent && <p className="text-sm text-muted-foreground">Select a student to view their profile.</p>}
              {selectedStudent ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xl font-semibold">{selectedStudent.name}</p>
                    <p className="text-muted-foreground">{selectedStudent.email}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="mt-1 font-medium">{selectedStudent.roll_no}</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="mt-1 font-medium">{selectedStudent.department}</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="mt-1 font-medium">{selectedStudent.course || "Not specified"}</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Year / Semester</p>
                      <p className="mt-1 font-medium">Year {selectedStudent.year} • Sem {selectedStudent.semester}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="mt-1 font-medium">{selectedStudent.emergency_contact || "Not available"}</p>
                    </div>
                    <div className="rounded-xl border p-4">
                      <p className="text-sm text-muted-foreground">Blood Group</p>
                      <p className="mt-1 font-medium">{selectedStudent.blood_group || "Not available"}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
