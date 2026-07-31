"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { User, Mail, Award, BookOpen, Building2, Phone, Heart } from "lucide-react";

export default function FacultyStudentsPage() {
  const { user } = useAuthStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
    enabled: !!user,
  });

  const departments = useMemo(
    () => Array.from(new Set(students.map((student) => student.department).filter(Boolean))),
    [students]
  );

  // Define Table Columns
  const columns: ColumnDef<Student>[] = [
    {
      header: "Roll Number",
      accessorKey: "roll_no",
      sortable: true,
      cell: (row) => <span className="font-mono font-bold text-foreground">{row.roll_no}</span>,
    },
    {
      header: "Student Name",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Department",
      accessorKey: "department",
      sortable: true,
    },
    {
      header: "Course",
      accessorKey: "course",
      sortable: true,
      cell: (row) => row.course || "—",
    },
    {
      header: "Year / Sem",
      accessorKey: "year",
      sortable: true,
      cell: (row) => (
        <span className="font-medium">
          Yr {row.year} • Sem {row.semester}
        </span>
      ),
    },
    {
      header: "Status",
      id: "status",
      cell: () => <StatusBadge status="active" label="Enrolled" />,
    },
  ];

  // Filter Options
  const tableFilters: FilterOption<Student>[] = [
    {
      id: "department",
      label: "Departments",
      options: departments.map((d) => ({ label: d, value: d })),
    },
  ];

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Students Roster">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Main Data Table */}
          <div>
            <DataTable
              title={`Assigned Students (${students.length})`}
              description="Click any student row to inspect their profile details"
              data={students}
              columns={columns}
              filters={tableFilters}
              searchPlaceholder="Search student name, roll number, department..."
              searchFields={["name", "roll_no", "email", "department", "course"]}
              exportFileName="faculty_students_roster"
              isLoading={isLoading}
              onRowClick={(row) => setSelectedStudent(row)}
              emptyMessage="No assigned students found matching search."
            />
          </div>

          {/* Selected Student Detail Card */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl h-fit sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-500" /> Student Profile Detail
              </CardTitle>
              <CardDescription>Click a row from the roster to inspect</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                    <h3 className="text-lg font-extrabold text-foreground">{selectedStudent.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status="active" label={`Year ${selectedStudent.year} • Sem ${selectedStudent.semester}`} />
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2 text-xs">
                    <div className="p-3 rounded-2xl border border-border/60 bg-background/50">
                      <p className="text-muted-foreground font-semibold">Roll Number</p>
                      <p className="font-mono font-bold text-foreground mt-0.5">{selectedStudent.roll_no}</p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border/60 bg-background/50">
                      <p className="text-muted-foreground font-semibold">Department</p>
                      <p className="font-bold text-foreground mt-0.5 truncate">{selectedStudent.department}</p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border/60 bg-background/50">
                      <p className="text-muted-foreground font-semibold">Course Program</p>
                      <p className="font-bold text-foreground mt-0.5 truncate">{selectedStudent.course || "General"}</p>
                    </div>
                    <div className="p-3 rounded-2xl border border-border/60 bg-background/50">
                      <p className="text-muted-foreground font-semibold">Blood Group</p>
                      <p className="font-bold text-foreground mt-0.5">{selectedStudent.blood_group || "O+"}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl border border-border/60 bg-background/50 text-xs">
                    <p className="text-muted-foreground font-semibold">Emergency Contact</p>
                    <p className="font-semibold text-foreground mt-0.5">{selectedStudent.emergency_contact || "+91 98765 43210"}</p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                  <User className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>Select any student row from the table on the left to inspect their academic profile.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
