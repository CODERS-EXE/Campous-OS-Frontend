"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Student, UpdateUserPayload } from "@/lib/api";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Edit2, Trash2, UserPlus, User, Mail, Hash, Building, GraduationCap, Calendar } from "lucide-react";
import { FormField, PasswordField, SubmitButton } from "@/components/shared/forms";

interface StudentForm extends UpdateUserPayload {
  name: string;
  email: string;
  password: string;
  roll_no: string;
  department: string;
  course: string;
  year: number;
  semester: number;
}

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<StudentForm>({
    name: "",
    email: "",
    password: "",
    roll_no: "",
    department: "",
    course: "",
    year: 1,
    semester: 1,
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
  });

  const departments = useMemo(
    () => Array.from(new Set(students.map((student) => student.department).filter(Boolean))),
    [students]
  );

  const createMutation = useMutation({
    mutationFn: (body: StudentForm) =>
      api.post<Student>("/api/v1/users", {
        ...body,
        role: "student",
      }),
    onSuccess: () => {
      setMessage("Student registered successfully.");
      setError("");
      setForm({ name: "", email: "", password: "", roll_no: "", department: "", course: "", year: 1, semester: 1 });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { id: string; payload: UpdateUserPayload }) =>
      api.patch<Student>(`/api/v1/users/${body.id}`, body.payload),
    onSuccess: () => {
      setMessage("Student updated successfully.");
      setError("");
      setSelectedStudent(null);
      setForm({ name: "", email: "", password: "", roll_no: "", department: "", course: "", year: 1, semester: 1 });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/api/v1/users/${id}`),
    onSuccess: () => {
      setMessage("Student removed successfully.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (selectedStudent) {
      updateMutation.mutate({
        id: selectedStudent.user_id,
        payload: {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          roll_no: form.roll_no,
          department: form.department,
          course: form.course,
          year: form.year,
          semester: form.semester,
        },
      });
      return;
    }

    createMutation.mutate(form);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setMessage("");
    setError("");
    setForm({
      name: student.name,
      email: student.email,
      password: "",
      roll_no: student.roll_no,
      department: student.department,
      course: student.course ?? "",
      year: student.year,
      semester: student.semester,
    });
  };

  const handleDelete = (student: Student) => {
    if (window.confirm(`Delete student ${student.name}?`)) {
      deleteMutation.mutate(student.user_id);
    }
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    setError("");
    setMessage("");
    setForm({ name: "", email: "", password: "", roll_no: "", department: "", course: "", year: 1, semester: 1 });
  };

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
    {
      header: "Actions",
      id: "actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="h-8 w-8 p-0 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // Define Table Filter Options
  const tableFilters: FilterOption<Student>[] = [
    {
      id: "department",
      label: "Departments",
      options: departments.map((d) => ({ label: d, value: d })),
    },
  ];

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Student Management">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Form Card */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-500" />
                  {selectedStudent ? "Edit Student" : "Register New Student"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    id="name"
                    label="Student Name"
                    value={form.name}
                    onChange={(val) => setForm({ ...form, name: val })}
                    required
                    placeholder="e.g. Rahul Sharma"
                    icon={User}
                  />

                  <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(val) => setForm({ ...form, email: val })}
                    required
                    placeholder="student@college.edu"
                    icon={Mail}
                  />

                  <PasswordField
                    id="password"
                    label="Password"
                    value={form.password}
                    onChange={(val) => setForm({ ...form, password: val })}
                    required={!selectedStudent}
                    placeholder={selectedStudent ? "Leave blank to keep current" : "Minimum 8 characters"}
                    showStrength={!selectedStudent}
                  />

                  <FormField
                    id="roll_no"
                    label="Roll Number"
                    value={form.roll_no}
                    onChange={(val) => setForm({ ...form, roll_no: val })}
                    required
                    placeholder="CS-2024-001"
                    icon={Hash}
                  />

                  <FormField
                    id="department"
                    label="Department"
                    value={form.department}
                    onChange={(val) => setForm({ ...form, department: val })}
                    required
                    placeholder="Computer Science"
                    icon={Building}
                  />

                  <FormField
                    id="course"
                    label="Course Program"
                    value={form.course}
                    onChange={(val) => setForm({ ...form, course: val })}
                    required
                    placeholder="B.Tech CS"
                    icon={GraduationCap}
                  />

                  <div className="grid gap-3 grid-cols-2">
                    <FormField
                      id="year"
                      label="Year"
                      type="number"
                      min={1}
                      value={form.year}
                      onChange={(val) => setForm({ ...form, year: Number(val) })}
                      required
                      icon={Calendar}
                    />

                    <FormField
                      id="semester"
                      label="Semester"
                      type="number"
                      min={1}
                      value={form.semester}
                      onChange={(val) => setForm({ ...form, semester: Number(val) })}
                      required
                      icon={Calendar}
                    />
                  </div>

                  {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
                  {message && <p className="text-xs text-emerald-500 font-semibold">{message}</p>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {selectedStudent && (
                      <Button variant="outline" type="button" onClick={handleCancel} className="rounded-2xl">
                        Cancel
                      </Button>
                    )}
                    <SubmitButton
                      type="submit"
                      isLoading={createMutation.status === "pending" || updateMutation.status === "pending"}
                      loadingText={selectedStudent ? "Updating..." : "Registering..."}
                      successText={selectedStudent ? "Updated!" : "Registered!"}
                    >
                      {selectedStudent ? "Update Student" : "Register Student"}
                    </SubmitButton>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Premium Data Table */}
            <div>
              <DataTable
                title={`Enrolled Students (${students.length})`}
                description="Sticky header table with live search, filters, pagination & CSV export"
                data={students}
                columns={columns}
                filters={tableFilters}
                searchPlaceholder="Search by name, roll no, department..."
                searchFields={["name", "roll_no", "email", "department", "course"]}
                exportFileName="students_directory"
                isLoading={isLoading}
                emptyMessage="No student records match your search query."
              />
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
