"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Faculty, Student, UpdateUserPayload } from "@/lib/api";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Edit2, Trash2, UserPlus, BookOpen, User, Mail, Building, Briefcase, CheckCircle } from "lucide-react";
import { FormField, FormSelect, PasswordField, SubmitButton } from "@/components/shared/forms";

interface FacultyForm extends Omit<UpdateUserPayload, "subjects"> {
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  status: string;
  year: string;
  semester: string;
  subjects: string;
}

export default function FacultyPage() {
  const queryClient = useQueryClient();
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);

  const [form, setForm] = useState<FacultyForm>({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    status: "active",
    year: "",
    semester: "",
    subjects: "",
  });

  const { data: faculty = [], isLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: () => api.get<Faculty[]>("/api/v1/users/faculty"),
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["all-students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
  });

  const departments = useMemo(
    () => Array.from(new Set(faculty.map((member) => member.department).filter(Boolean))),
    [faculty]
  );

  const createMutation = useMutation({
    mutationFn: (body: FacultyForm) =>
      api.post<Faculty>("/api/v1/users", {
        name: body.name,
        email: body.email,
        password: body.password,
        role: "faculty",
        department: body.department,
        designation: body.designation,
        status: body.status,
        year: body.year ? parseInt(body.year) : undefined,
        semester: body.semester ? parseInt(body.semester) : undefined,
        subjects: body.subjects.split(",").map((subject) => subject.trim()).filter(Boolean),
        student_ids: assignedStudentIds,
      }),
    onSuccess: () => {
      setMessage("Faculty profile created successfully.");
      setError("");
      setSelectedFaculty(null);
      setAssignedStudentIds([]);
      setForm({ name: "", email: "", password: "", department: "", designation: "", status: "active", year: "", semester: "", subjects: "" });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { id: string; payload: UpdateUserPayload }) =>
      api.patch<Faculty>(`/api/v1/users/${body.id}`, body.payload),
    onSuccess: async (updatedFaculty: Faculty) => {
      console.log("✅ Update response received:", updatedFaculty);
      console.log("📊 Student IDs in response:", updatedFaculty.student_ids);
      console.log("📏 Count:", updatedFaculty.student_ids?.length ?? 0);
      
      setMessage("Faculty profile updated successfully.");
      setError("");
      setSelectedFaculty(null);
      setAssignedStudentIds([]);
      setForm({ name: "", email: "", password: "", department: "", designation: "", status: "active", year: "", semester: "", subjects: "" });
      
      // Optimistic update: immediately update cache with new data
      queryClient.setQueryData<Faculty[]>(["faculty"], (old) => {
        if (!old) return [updatedFaculty];
        return old.map((f) => (f.user_id === updatedFaculty.user_id ? updatedFaculty : f));
      });
      
      // Then refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/api/v1/users/${id}`),
    onSuccess: () => {
      setMessage("Faculty member removed successfully.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (selectedFaculty) {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        department: form.department,
        designation: form.designation,
        status: form.status,
        year: form.year ? parseInt(form.year) : undefined,
        semester: form.semester ? parseInt(form.semester) : undefined,
        subjects: form.subjects.split(",").map((subject) => subject.trim()).filter(Boolean),
        student_ids: assignedStudentIds,
      };
      
      console.log("📤 Sending update payload:", payload);
      console.log("📊 Assigned student IDs count:", assignedStudentIds.length);
      
      updateMutation.mutate({
        id: selectedFaculty.user_id,
        payload,
      });
      return;
    }

    createMutation.mutate(form);
  };

  const handleEdit = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember);
    setMessage("");
    setError("");
    setAssignedStudentIds(facultyMember.student_ids ?? []);
    setForm({
      name: facultyMember.name,
      email: facultyMember.email,
      password: "",
      department: facultyMember.department,
      designation: facultyMember.designation ?? "",
      status: facultyMember.status ?? "active",
      year: facultyMember.year?.toString() ?? "",
      semester: facultyMember.semester?.toString() ?? "",
      subjects: facultyMember.subjects.join(", "),
    });
  };

  const handleDelete = (facultyMember: Faculty) => {
    if (window.confirm(`Delete faculty ${facultyMember.name}?`)) {
      deleteMutation.mutate(facultyMember.user_id);
    }
  };

  const handleCancel = () => {
    setSelectedFaculty(null);
    setError("");
    setMessage("");
    setAssignedStudentIds([]);
    setForm({ name: "", email: "", password: "", department: "", designation: "", status: "active", year: "", semester: "", subjects: "" });
  };

  // Define Table Columns
  const columns: ColumnDef<Faculty>[] = [
    {
      header: "Faculty Name",
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
      header: "Designation",
      accessorKey: "designation",
      sortable: true,
      cell: (row) => row.designation || "Professor",
    },
    {
      header: "Assigned Subjects",
      id: "subjects",
      cell: (row) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {row.subjects?.length > 0 ? row.subjects.join(", ") : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status || "active"} />,
    },
    {
      header: "Assigned Students",
      id: "assigned_students",
      cell: (row) => <span className="text-xs font-semibold text-muted-foreground">{row.student_ids?.length ?? 0}</span>,
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
            className="h-8 w-8 p-0 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
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
  const tableFilters: FilterOption<Faculty>[] = [
    {
      id: "department",
      label: "Departments",
      options: departments.map((d) => ({ label: d, value: d })),
    },
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Faculty Management">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Form Card */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-500" />
                  {selectedFaculty ? "Edit Faculty Member" : "Add Faculty Member"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    id="name"
                    label="Faculty Name"
                    value={form.name}
                    onChange={(val) => setForm({ ...form, name: val })}
                    required
                    placeholder="e.g. Dr. Ananya Sen"
                    icon={User}
                  />

                  <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(val) => setForm({ ...form, email: val })}
                    required
                    placeholder="faculty@college.edu"
                    icon={Mail}
                  />

                  <PasswordField
                    id="password"
                    label="Password"
                    value={form.password}
                    onChange={(val) => setForm({ ...form, password: val })}
                    required={!selectedFaculty}
                    placeholder={selectedFaculty ? "Leave blank to keep current" : "Minimum 8 characters"}
                    showStrength={!selectedFaculty}
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

                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      id="year"
                      label="Year"
                      value={form.year}
                      onChange={(val) => setForm({ ...form, year: val })}
                      options={[
                        { value: "", label: "Select Year" },
                        { value: "1", label: "First Year" },
                        { value: "2", label: "Second Year" },
                        { value: "3", label: "Third Year" },
                        { value: "4", label: "Fourth Year" },
                      ]}
                    />

                    <FormSelect
                      id="semester"
                      label="Semester"
                      value={form.semester}
                      onChange={(val) => setForm({ ...form, semester: val })}
                      options={[
                        { value: "", label: "Select Semester" },
                        { value: "1", label: "Semester 1" },
                        { value: "2", label: "Semester 2" },
                        { value: "3", label: "Semester 3" },
                        { value: "4", label: "Semester 4" },
                        { value: "5", label: "Semester 5" },
                        { value: "6", label: "Semester 6" },
                        { value: "7", label: "Semester 7" },
                        { value: "8", label: "Semester 8" },
                      ]}
                    />
                  </div>

                  <FormField
                    id="designation"
                    label="Designation"
                    value={form.designation}
                    onChange={(val) => setForm({ ...form, designation: val })}
                    required
                    placeholder="Associate Professor"
                    icon={Briefcase}
                  />

                  <FormSelect
                    id="status"
                    label="Status"
                    value={form.status}
                    onChange={(val) => setForm({ ...form, status: val })}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    icon={CheckCircle}
                  />

                  <FormField
                    id="subjects"
                    label="Assigned Subjects"
                    value={form.subjects}
                    onChange={(val) => setForm({ ...form, subjects: val })}
                    placeholder="Data Structures, Algorithms"
                    icon={BookOpen}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="student_ids">Assign Students</Label>
                    <select
                      id="student_ids"
                      multiple
                      value={assignedStudentIds}
                      onChange={(event) =>
                        setAssignedStudentIds(Array.from(event.target.selectedOptions, (option) => option.value))
                      }
                      className="mt-2 min-h-[160px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {students.map((student) => (
                        <option key={student.user_id} value={student.user_id}>
                          {student.name} — {student.roll_no} — {student.department}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Hold Ctrl/Cmd to select multiple students. Assigning students explicitly will keep the faculty mapping in sync.
                    </p>
                  </div>

                  {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
                  {message && <p className="text-xs text-emerald-500 font-semibold">{message}</p>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {selectedFaculty && (
                      <Button variant="outline" type="button" onClick={handleCancel} className="rounded-2xl">
                        Cancel
                      </Button>
                    )}
                    <SubmitButton
                      type="submit"
                      variant="success"
                      isLoading={createMutation.status === "pending" || updateMutation.status === "pending"}
                      loadingText={selectedFaculty ? "Updating..." : "Creating..."}
                      successText={selectedFaculty ? "Updated!" : "Added!"}
                    >
                      {selectedFaculty ? "Update Faculty" : "Add Faculty"}
                    </SubmitButton>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Premium Data Table */}
            <div>
              <DataTable
                title={`Academic Faculty (${faculty.length})`}
                description="Sticky header table with live search, filters, pagination & CSV export"
                data={faculty}
                columns={columns}
                filters={tableFilters}
                searchPlaceholder="Search faculty by name, department, subjects..."
                searchFields={["name", "email", "department", "designation", "subjects"]}
                exportFileName="faculty_directory"
                isLoading={isLoading}
                emptyMessage="No faculty records match your search query."
              />
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
