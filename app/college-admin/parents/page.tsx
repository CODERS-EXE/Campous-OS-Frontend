"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Student, UpdateUserPayload, User } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Edit2, Trash2, HeartHandshake, User as UserIcon, Mail, Phone } from "lucide-react";
import { FormField, PasswordField, SubmitButton } from "@/components/shared/forms";

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

  const [form, setForm] = useState<ParentForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    student_ids: [],
  });

  const { data: parents = [], isLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: () => api.get<User[]>("/api/v1/users/parents"),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
  });

  const studentLookup = useMemo(
    () =>
      students.reduce<Record<string, Student>>((acc, student) => {
        acc[student.user_id] = student;
        return acc;
      }, {}),
    [students]
  );

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
      setMessage("Parent user removed successfully.");
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

  // Define Table Columns
  const columns: ColumnDef<User>[] = [
    {
      header: "Guardian Name",
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
      header: "Contact Phone",
      id: "phone",
      cell: (row) => <span className="font-mono text-xs">{String(row.profile?.phone ?? "—")}</span>,
    },
    {
      header: "Linked Student(s)",
      id: "students",
      cell: (row) => {
        const studentIds = Array.isArray(row.profile?.student_ids) ? (row.profile.student_ids as string[]) : [];
        if (studentIds.length === 0) return <span className="text-muted-foreground text-xs">No children linked</span>;
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-primary">{studentIds.length} Student(s)</span>
            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
              {studentIds.map((id) => studentLookup[id]?.name ?? "Student").join(", ")}
            </p>
          </div>
        );
      },
    },
    {
      header: "Status",
      id: "status",
      cell: () => <StatusBadge status="active" label="Verified Guardian" />,
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
            className="h-8 w-8 p-0 rounded-xl hover:bg-blue-500/10 hover:text-blue-500"
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

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Parents Management">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Form Card */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-blue-500" />
                  {selectedParent ? "Edit Guardian Record" : "Add Parent / Guardian"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    id="name"
                    label="Guardian Name"
                    value={form.name}
                    onChange={(val) => setForm({ ...form, name: val })}
                    required
                    placeholder="e.g. Vikram Sharma"
                    icon={UserIcon}
                  />

                  <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(val) => setForm({ ...form, email: val })}
                    required
                    placeholder="parent@gmail.com"
                    icon={Mail}
                  />

                  <PasswordField
                    id="password"
                    label="Password"
                    value={form.password}
                    onChange={(val) => setForm({ ...form, password: val })}
                    required={!selectedParent}
                    placeholder={selectedParent ? "Leave blank to keep current" : "Minimum 8 characters"}
                    showStrength={!selectedParent}
                  />

                  <FormField
                    id="phone"
                    label="Contact Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(val) => setForm({ ...form, phone: val })}
                    placeholder="+91 98765 43210"
                    icon={Phone}
                  />

                  <div>
                    <Label htmlFor="student_ids" className="text-xs font-semibold">Link Students (Hold Ctrl/Cmd)</Label>
                    <select
                      id="student_ids"
                      multiple
                      className="mt-1 h-36 w-full rounded-2xl border border-border/80 bg-background/80 backdrop-blur-sm px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-all duration-200"
                      value={form.student_ids}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          student_ids: Array.from(e.target.selectedOptions, (option) => option.value),
                        })
                      }
                    >
                      {students.map((student) => (
                        <option key={student.user_id} value={student.user_id}>
                          {student.name} ({student.roll_no})
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
                  {message && <p className="text-xs text-emerald-500 font-semibold">{message}</p>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {selectedParent && (
                      <Button variant="outline" type="button" onClick={handleCancel} className="rounded-2xl">
                        Cancel
                      </Button>
                    )}
                    <SubmitButton
                      type="submit"
                      isLoading={createMutation.status === "pending" || updateMutation.status === "pending"}
                      loadingText={selectedParent ? "Updating..." : "Creating..."}
                      successText={selectedParent ? "Updated!" : "Added!"}
                    >
                      {selectedParent ? "Update Guardian" : "Add Guardian"}
                    </SubmitButton>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Premium Data Table */}
            <div>
              <DataTable
                title={`Parents & Guardians (${parents.length})`}
                description="Sticky header table with live search, pagination & CSV export"
                data={parents}
                columns={columns}
                searchPlaceholder="Search parents by name, email, phone..."
                searchFields={["name", "email"]}
                exportFileName="parents_directory"
                isLoading={isLoading}
                emptyMessage="No parent accounts match your search query."
              />
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
