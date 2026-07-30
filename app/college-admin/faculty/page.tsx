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
import { api, Faculty, UpdateUserPayload } from "@/lib/api";

interface FacultyForm extends Omit<UpdateUserPayload, "subjects"> {
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  status: string;
  subjects: string;
}

const PAGE_SIZE = 8;

export default function FacultyPage() {
  const queryClient = useQueryClient();
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<FacultyForm>({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    status: "active",
    subjects: "",
  });

  const { data: faculty, isLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: () => api.get<Faculty[]>("/api/v1/users/faculty"),
  });

  const departments = useMemo(
    () => Array.from(new Set(faculty?.map((member) => member.department).filter(Boolean))),
    [faculty]
  );

  const filteredFaculty = useMemo(() => {
    if (!faculty) return [];
    const normalizedSearch = search.toLowerCase();
    return faculty.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.department.toLowerCase().includes(normalizedSearch) ||
        (member.designation ?? "").toLowerCase().includes(normalizedSearch) ||
        member.subjects.join(", ").toLowerCase().includes(normalizedSearch);

      const matchesDepartment = departmentFilter ? member.department === departmentFilter : true;
      const matchesStatus = statusFilter ? member.status === statusFilter : true;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [faculty, search, departmentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFaculty.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedFaculty = filteredFaculty.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        subjects: body.subjects.split(",").map((subject) => subject.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      setMessage("Faculty profile created successfully.");
      setError("");
      setSelectedFaculty(null);
      setForm({ name: "", email: "", password: "", department: "", designation: "", status: "active", subjects: "" });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { id: string; payload: UpdateUserPayload }) =>
      api.patch<Faculty>(`/api/v1/users/${body.id}`, body.payload),
    onSuccess: () => {
      setMessage("Faculty profile updated successfully.");
      setError("");
      setSelectedFaculty(null);
      setForm({ name: "", email: "", password: "", department: "", designation: "", status: "active", subjects: "" });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/api/v1/users/${id}`),
    onSuccess: () => {
      setMessage("Faculty removed successfully.");
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
      updateMutation.mutate({
        id: selectedFaculty.id,
        payload: {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          department: form.department,
          designation: form.designation,
          status: form.status,
          subjects: form.subjects.split(",").map((subject) => subject.trim()).filter(Boolean),
        },
      });
      return;
    }

    createMutation.mutate(form);
  };

  const handleEdit = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember);
    setMessage("");
    setError("");
    setForm({
      name: facultyMember.name,
      email: facultyMember.email,
      password: "",
      department: facultyMember.department,
      designation: facultyMember.designation ?? "",
      status: facultyMember.status ?? "active",
      subjects: facultyMember.subjects.join(", "),
    });
  };

  const handleDelete = (facultyMember: Faculty) => {
    if (window.confirm(`Delete faculty ${facultyMember.name}?`)) {
      deleteMutation.mutate(facultyMember.id);
    }
  };

  const handleCancel = () => {
    setSelectedFaculty(null);
    setError("");
    setMessage("");
    setForm({ name: "", email: "", password: "", department: "", designation: "", status: "active", subjects: "" });
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Faculty">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{selectedFaculty ? "Edit Faculty" : "Add Faculty"}</CardTitle>
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
                    required={!selectedFaculty}
                    placeholder={selectedFaculty ? "Leave blank to keep current" : "Minimum 8 characters"}
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
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects</Label>
                  <Input
                    id="subjects"
                    value={form.subjects}
                    onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                    placeholder="Comma-separated subjects"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && <p className="text-sm text-primary">{message}</p>}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Button type="submit" disabled={createMutation.status === "pending" || updateMutation.status === "pending"}>
                    {selectedFaculty ? (updateMutation.status === "pending" ? "Updating..." : "Update Faculty") : (createMutation.status === "pending" ? "Creating..." : "Add Faculty")}
                  </Button>
                  {selectedFaculty && (
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
              <CardTitle>Faculty Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create and manage faculty users for your college.</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Total faculty: <span className="font-semibold">{faculty?.length ?? 0}</span></p>
                <p>{selectedFaculty ? "Updating an existing record." : "Fill the form to create a new faculty user."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>All Faculty ({filteredFaculty.length})</CardTitle>
                <p className="text-sm text-muted-foreground">Filter and manage faculty assigned to your college.</p>
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
                    placeholder="Name, department, subject"
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
                  <Label htmlFor="filter-status">Status</Label>
                  <select
                    id="filter-status"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
            ) : filteredFaculty.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Department</th>
                      <th className="pb-3 pr-4">Designation</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Subjects</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFaculty.map((member) => (
                      <tr key={member.id} className="border-b">
                        <td className="py-3 pr-4">{member.name}</td>
                        <td className="py-3 pr-4">{member.email}</td>
                        <td className="py-3 pr-4">{member.department}</td>
                        <td className="py-3 pr-4">{member.designation ?? "-"}</td>
                        <td className="py-3 pr-4 capitalize">{member.status ?? "active"}</td>
                        <td className="py-3 pr-4">{member.subjects.join(", ")}</td>
                        <td className="py-3 pr-4 text-right">
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(member)}>
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(member)}>
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
              <p className="py-8 text-center text-muted-foreground">No faculty records found with the current filters.</p>
            )}
          </CardContent>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(PAGE_SIZE, filteredFaculty.length - (currentPage - 1) * PAGE_SIZE)} of {filteredFaculty.length} faculty
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
