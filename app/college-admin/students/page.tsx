"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Student, UpdateUserPayload } from "@/lib/api";

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

const PAGE_SIZE = 8;

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [page, setPage] = useState(1);
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

  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
  });

  const departments = useMemo(
    () => Array.from(new Set(students?.map((student) => student.department).filter(Boolean))),
    [students]
  );

  const courses = useMemo(
    () => Array.from(new Set(students?.map((student) => student.course ?? "").filter(Boolean))),
    [students]
  );

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const normalizedSearch = search.toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch) ||
        student.roll_no.toLowerCase().includes(normalizedSearch) ||
        student.department.toLowerCase().includes(normalizedSearch) ||
        (student.course ?? "").toLowerCase().includes(normalizedSearch);

      const matchesDepartment = departmentFilter ? student.department === departmentFilter : true;
      const matchesCourse = courseFilter ? student.course === courseFilter : true;
      const matchesYear = yearFilter ? String(student.year) === yearFilter : true;
      const matchesSemester = semesterFilter ? String(student.semester) === semesterFilter : true;

      return matchesSearch && matchesDepartment && matchesCourse && matchesYear && matchesSemester;
    });
  }, [students, search, departmentFilter, courseFilter, yearFilter, semesterFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const createMutation = useMutation({
    mutationFn: (body: StudentForm) =>
      api.post<Student>("/api/v1/users", {
        ...body,
        role: "student",
      }),
    onSuccess: () => {
      setMessage("Student created successfully.");
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
        id: selectedStudent.id,
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
      deleteMutation.mutate(student.id);
    }
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    setError("");
    setMessage("");
    setForm({ name: "", email: "", password: "", roll_no: "", department: "", course: "", year: 1, semester: 1 });
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Students">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{selectedStudent ? "Edit Student" : "Register Student"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!selectedStudent}
                    placeholder={selectedStudent ? "Leave blank to keep current" : "Minimum 8 characters"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roll_no">Roll Number</Label>
                  <Input
                    id="roll_no"
                    value={form.roll_no}
                    onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      min={1}
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      min={1}
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && <p className="text-sm text-primary">{message}</p>}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Button type="submit" disabled={createMutation.status === "pending" || updateMutation.status === "pending"}>
                    {selectedStudent ? (updateMutation.status === "pending" ? "Updating..." : "Update Student") : (createMutation.status === "pending" ? "Creating..." : "Create Student")}
                  </Button>
                  {selectedStudent && (
                    <Button variant="outline" type="button" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage student records that belong to your college.</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Total students: <span className="font-semibold">{students?.length ?? 0}</span></p>
                <p>{selectedStudent ? "Editing an existing student." : "Create a new student record."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                <p className="text-sm text-muted-foreground">Search, filter, and manage students from your college.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Name, roll, email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-department">Department</Label>
                  <select
                    id="filter-department"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-course">Course</Label>
                  <select
                    id="filter-course"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    value={courseFilter}
                    onChange={(e) => {
                      setCourseFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All courses</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4">Roll No</th>
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Department</th>
                      <th className="pb-3 pr-4">Course</th>
                      <th className="pb-3 pr-4">Year</th>
                      <th className="pb-3 pr-4">Semester</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((s) => (
                      <tr key={s.id} className="border-b">
                        <td className="py-3 pr-4 font-mono">{s.roll_no}</td>
                        <td className="py-3 pr-4">{s.name}</td>
                        <td className="py-3 pr-4">{s.department}</td>
                        <td className="py-3 pr-4">{s.course ?? "-"}</td>
                        <td className="py-3 pr-4">{s.year}</td>
                        <td className="py-3 pr-4">{s.semester}</td>
                        <td className="py-3 pr-4 text-right">
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(s)}>
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(s)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No students found with the current filters.</p>
            )}
          </CardContent>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(PAGE_SIZE, filteredStudents.length - (currentPage - 1) * PAGE_SIZE)} of {filteredStudents.length} students
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                Previous
              </Button>
              <Button type="button" variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </DashboardShell>
    </AuthGuard>
  );
}
