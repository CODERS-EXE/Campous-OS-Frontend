"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, UpdateUserPayload, User } from "@/lib/api";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Edit2, Trash2, UserPlus, ShieldCheck, User as UserIcon, Mail, Building, CheckCircle } from "lucide-react";
import { FormField, FormSelect, PasswordField, SubmitButton } from "@/components/shared/forms";

interface WardenForm extends UpdateUserPayload {
  name: string;
  email: string;
  password: string;
  hostel: string;
  status: string;
}

export default function WardensPage() {
  const queryClient = useQueryClient();
  const [selectedWarden, setSelectedWarden] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<WardenForm>({
    name: "",
    email: "",
    password: "",
    hostel: "",
    status: "active",
  });

  const { data: wardens = [], isLoading } = useQuery({
    queryKey: ["wardens"],
    queryFn: () => api.get<User[]>("/api/v1/users/wardens"),
  });

  const hostels = useMemo(
    () => Array.from(new Set(wardens.map((warden) => String(warden.profile?.hostel ?? "")).filter(Boolean))),
    [wardens]
  );

  const createMutation = useMutation({
    mutationFn: (body: WardenForm) =>
      api.post<User>("/api/v1/users", {
        ...body,
        role: "warden",
      }),
    onSuccess: () => {
      setMessage("Warden registered successfully.");
      setError("");
      setSelectedWarden(null);
      setForm({ name: "", email: "", password: "", hostel: "", status: "active" });
      queryClient.invalidateQueries({ queryKey: ["wardens"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { id: string; payload: UpdateUserPayload }) =>
      api.patch<User>(`/api/v1/users/${body.id}`, body.payload),
    onSuccess: () => {
      setMessage("Warden updated successfully.");
      setError("");
      setSelectedWarden(null);
      setForm({ name: "", email: "", password: "", hostel: "", status: "active" });
      queryClient.invalidateQueries({ queryKey: ["wardens"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/api/v1/users/${id}`),
    onSuccess: () => {
      setMessage("Warden removed successfully.");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["wardens"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (selectedWarden) {
      updateMutation.mutate({
        id: selectedWarden.id,
        payload: {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          hostel: form.hostel,
          status: form.status,
        },
      });
      return;
    }

    createMutation.mutate(form);
  };

  const handleEdit = (warden: User) => {
    setSelectedWarden(warden);
    setMessage("");
    setError("");
    setForm({
      name: warden.name,
      email: warden.email,
      password: "",
      hostel: String(warden.profile?.hostel ?? ""),
      status: String(warden.profile?.status ?? "active"),
    });
  };

  const handleDelete = (warden: User) => {
    if (window.confirm(`Delete warden ${warden.name}?`)) {
      deleteMutation.mutate(warden.id);
    }
  };

  const handleCancel = () => {
    setSelectedWarden(null);
    setError("");
    setMessage("");
    setForm({ name: "", email: "", password: "", hostel: "", status: "active" });
  };

  // Define Table Columns
  const columns: ColumnDef<User>[] = [
    {
      header: "Warden Name",
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
      header: "Assigned Hostel",
      id: "hostel",
      sortable: true,
      cell: (row) => <span className="font-semibold">{String(row.profile?.hostel ?? "Unassigned")}</span>,
    },
    {
      header: "Status",
      id: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={String(row.profile?.status ?? "active")} />,
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
            className="h-8 w-8 p-0 rounded-xl hover:bg-amber-500/10 hover:text-amber-500"
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
  const tableFilters: FilterOption<User>[] = [
    {
      id: "hostel",
      label: "Hostels",
      options: hostels.map((h) => ({ label: h, value: h })),
      filterFn: (row, val) => String(row.profile?.hostel ?? "") === val,
    },
  ];

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Hostel Wardens">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Form Card */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-500" />
                  {selectedWarden ? "Edit Warden" : "Add New Warden"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    id="name"
                    label="Warden Name"
                    value={form.name}
                    onChange={(val) => setForm({ ...form, name: val })}
                    required
                    placeholder="e.g. Suresh Kumar"
                    icon={UserIcon}
                  />

                  <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(val) => setForm({ ...form, email: val })}
                    required
                    placeholder="warden@college.edu"
                    icon={Mail}
                  />

                  <PasswordField
                    id="password"
                    label="Password"
                    value={form.password}
                    onChange={(val) => setForm({ ...form, password: val })}
                    required={!selectedWarden}
                    placeholder={selectedWarden ? "Leave blank to keep current" : "Minimum 8 characters"}
                    showStrength={!selectedWarden}
                  />

                  <FormField
                    id="hostel"
                    label="Assigned Hostel Block"
                    value={form.hostel}
                    onChange={(val) => setForm({ ...form, hostel: val })}
                    required
                    placeholder="Boys Hostel Block A"
                    icon={Building}
                  />

                  <FormSelect
                    id="status"
                    label="Status"
                    value={form.status}
                    onChange={(val) => setForm({ ...form, status: val })}
                    options={[
                      { value: "active", label: "Active Duty" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    icon={CheckCircle}
                  />

                  {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
                  {message && <p className="text-xs text-emerald-500 font-semibold">{message}</p>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {selectedWarden && (
                      <Button variant="outline" type="button" onClick={handleCancel} className="rounded-2xl">
                        Cancel
                      </Button>
                    )}
                    <SubmitButton
                      type="submit"
                      variant="warning"
                      isLoading={createMutation.status === "pending" || updateMutation.status === "pending"}
                      loadingText={selectedWarden ? "Updating..." : "Creating..."}
                      successText={selectedWarden ? "Updated!" : "Added!"}
                    >
                      {selectedWarden ? "Update Warden" : "Add Warden"}
                    </SubmitButton>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Premium Data Table */}
            <div>
              <DataTable
                title={`Hostel Wardens (${wardens.length})`}
                description="Sticky header table with live search, filters, pagination & CSV export"
                data={wardens}
                columns={columns}
                filters={tableFilters}
                searchPlaceholder="Search wardens by name, email, hostel..."
                searchFields={["name", "email"]}
                exportFileName="wardens_directory"
                isLoading={isLoading}
                emptyMessage="No warden users match your search query."
              />
            </div>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
