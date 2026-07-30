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
import { api, Student, UpdateUserPayload, User } from "@/lib/api";

interface ParentForm extends UpdateUserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  student_ids: string[];
}

export default function ParentsPage() {
  const queryClient = useQueryClient();
  const [selectedParent, setSelectedParent] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ParentForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    student_ids: [],
  });

  const { data: parents, isLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: () => api.get<User[]>("/api/v1/users/parents"),
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
  });

  const filteredParents = useMemo(() => {
    if (!parents) return [];
    const normalizedSearch = search.toLowerCase();
    return parents.filter((parent) => {
      const parentPhone = String(parent.profile?.phone ?? "");
      const matchesSearch =
        parent.name.toLowerCase().includes(normalizedSearch) ||
        parent.email.toLowerCase().includes(normalizedSearch) ||
        parentPhone.toLowerCase().includes(normalizedSearch);
      const matchesPhone = phoneFilter ? parentPhone.includes(phoneFilter) : true;
      return matchesSearch && matchesPhone;
    });
  }, [parents, search, phoneFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / 8));
  const currentPage = Math.min(page, totalPages);
  const paginatedParents = filteredParents.slice((currentPage - 1) * 8, currentPage * 8);

  const createMutation = useMutation({
    mutationFn: (body: ParentForm) =>
      api.post<User>("/api/v1/users", {
        ...body,
        role: "parent",
      }),
    onSuccess: () => {
      setMessage("Parent user created successfully.");
      setError("");
      setSelectedParent(null);
      setForm({ name: "", email: "", password: "", phone: "", student_ids: [] });
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { id: string; payload: UpdateUserPayload }) =>
      api.patch<User>(`/api/v1/users/${body.id}`, body.payload),
    onSuccess: () => {
      setMessage("Parent user updated successfully.");
      setError("");
      setSelectedParent(null);
      setForm({ name: "", email: "", password: "", phone: "", student_ids: [] });
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/api/v1/users/${id}`),
    onSuccess: () => {
      setMessage("Parent user deleted successfully.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (selectedParent) {
      updateMutation.mutate({
        id: selectedParent.id,
        payload: {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          phone: form.phone,
          student_ids: form.student_ids,
        },
      });
      return;
    }

    createMutation.mutate(form);
  };

  const handleEdit = (parent: User) => {
    const studentIds = Array.isArray(parent.profile?.student_ids)
      ? (parent.profile.student_ids as string[])
      : [];

    setSelectedParent(parent);
    setMessage("");
    setError("");
    setForm({
      name: parent.name,
      email: parent.email,
      password: "",
      phone: String(parent.profile?.phone ?? ""),
      student_ids: studentIds,
    });
  };

  const handleDelete = (parent: User) => {
    if (window.confirm(`Delete parent ${parent.name}?`)) {
      deleteMutation.mutate(parent.id);
    }
  };

  const handleCancel = () => {
    setSelectedParent(null);
    setError("");
    setMessage("");
    setForm({ name: "", email: "", password: "", phone: "", student_ids: [] });
  };

  const studentLookup = useMemo(
    () =>
      (students ?? []).reduce<Record<string, Student>>((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {}),
    [students]
  );

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Parents">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{selectedParent ? "Edit Parent" : "Add Parent"}</CardTitle>
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
                    required={!selectedParent}
                    placeholder={selectedParent ? "Leave blank to keep current" : "Minimum 8 characters"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_ids">Linked Students</Label>
                  <select
                    id="student_ids"
                    multiple
                    className="h-40 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    value={form.student_ids}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        student_ids: Array.from(e.target.selectedOptions, (option) => option.value),
                      })
                    }
                  >
                    {(students ?? []).map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} — {student.roll_no}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && <p className="text-sm text-primary">{message}</p>}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Button type="submit" disabled={createMutation.status === "pending" || updateMutation.status === "pending"}>
                    {selectedParent ? (updateMutation.status === "pending" ? "Updating..." : "Update Parent") : (createMutation.status === "pending" ? "Creating..." : "Add Parent")}
                  </Button>
                  {selectedParent && (
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
              <CardTitle>Parent Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage parent users for your college.</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Total parents: <span className="font-semibold">{parents?.length ?? 0}</span></p>
                <p>{selectedParent ? "Editing an existing parent." : "Create a new parent profile."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>All Parents ({filteredParents.length})</CardTitle>
                <p className="text-sm text-muted-foreground">Search, filter, and manage parent contacts tied to students.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Name, email, phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-filter">Phone</Label>
                  <Input
                    id="phone-filter"
                    value={phoneFilter}
                    onChange={(e) => {
                      setPhoneFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Contact number"
                  />
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
            ) : filteredParents.length > 0 ? (
              <div className="space-y-3">
                {paginatedParents.map((parent) => (
                  <div key={parent.id} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{parent.name}</p>
                      <p className="text-sm text-muted-foreground">{parent.email}</p>
                      <p className="text-sm text-muted-foreground">Phone: {String(parent.profile?.phone ?? "-")}</p>
                      <p className="text-sm text-muted-foreground">
                        Linked students: {Array.isArray(parent.profile?.student_ids) ? parent.profile.student_ids.length : 0}
                      </p>
                      {Array.isArray(parent.profile?.student_ids) && parent.profile.student_ids.length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {parent.profile.student_ids
                            .map((id) => studentLookup[id]?.name ?? "Unknown")
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(parent)}>
                        Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(parent)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No parent users registered yet.</p>
            )}
          </CardContent>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(8, filteredParents.length - (currentPage - 1) * 8)} of {filteredParents.length} parents
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
