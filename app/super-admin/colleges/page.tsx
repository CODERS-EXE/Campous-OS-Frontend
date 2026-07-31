"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Edit, Plus, Trash2, XCircle, Building, Globe, User, Mail, Layers } from "lucide-react";
import { FormField, FormSelect, PasswordField, SubmitButton } from "@/components/shared/forms";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, College } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function CollegesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [form, setForm] = useState({
    name: "",
    subdomain: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    theme_color: "#2563eb",
    plan: "free",
  });
  const [error, setError] = useState("");

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => api.get<College[]>("/api/v1/colleges"),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post<College>("/api/v1/colleges", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setShowForm(false);
      setForm({ name: "", subdomain: "", admin_name: "", admin_email: "", admin_password: "", theme_color: "#2563eb", plan: "free" });
      setError("");
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<College> }) =>
      api.patch<College>(`/api/v1/colleges/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setEditingCollege(null);
      setError("");
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleStatusToggle = (college: College) => {
    const newStatus = college.status === "active" ? "suspended" : "active";
    if (confirm(`${newStatus === "active" ? "Activate" : "Suspend"} ${college.name}?`)) {
      updateMutation.mutate({ id: college.id, updates: { status: newStatus } });
    }
  };

  const handleUpdateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;
    updateMutation.mutate({
      id: editingCollege.id,
      updates: { name: editingCollege.name, theme_color: editingCollege.theme_color, plan: editingCollege.plan },
    });
  };

  const planBadgeColor: Record<string, string> = {
    free: "bg-muted text-muted-foreground border-border/60",
    basic: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    premium: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
    enterprise: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };

  const columns: ColumnDef<College>[] = [
    {
      header: "College",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-xl shrink-0 shadow-sm"
            style={{ backgroundColor: row.theme_color }}
          />
          <div>
            <p className="font-bold text-foreground">{row.name}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {row.subdomain}.campusos.com
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Subdomain",
      accessorKey: "subdomain",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs font-bold">{row.subdomain}</span>,
    },
    {
      header: "Plan",
      accessorKey: "plan",
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${planBadgeColor[row.plan] || planBadgeColor.free}`}>
          {row.plan}
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_at",
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.created_at || "")}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => <StatusBadge status={row.status === "active" ? "active" : "rejected"} label={row.status === "active" ? "Active" : "Suspended"} />,
    },
    {
      header: "Actions",
      id: "actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingCollege(row);
              setShowForm(false);
            }}
            className="h-8 w-8 p-0 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusToggle(row);
            }}
            className={`h-8 w-8 p-0 rounded-xl ${row.status === "active" ? "text-rose-500 hover:bg-rose-500/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
          >
            {row.status === "active" ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ];

  const tableFilters: FilterOption<College>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
      ],
    },
    {
      id: "plan",
      label: "Plans",
      options: [
        { label: "Free", value: "free" },
        { label: "Basic", value: "basic" },
        { label: "Premium", value: "premium" },
        { label: "Enterprise", value: "enterprise" },
      ],
    },
  ];

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="College Management">
        <div className="space-y-6">
          {/* Onboard Form */}
          {showForm && (
            <Card className="border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/20 backdrop-blur-xl rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="h-4 w-4 text-indigo-500" /> Onboard New College
                </CardTitle>
                <CardDescription>Create a new college tenant and administrator account</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => { e.preventDefault(); setError(""); createMutation.mutate(form); }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <FormField
                    id="name"
                    label="College Name"
                    value={form.name}
                    onChange={(val) => setForm({ ...form, name: val })}
                    required
                    icon={Building}
                  />

                  <div>
                    <FormField
                      id="subdomain"
                      label="Subdomain"
                      value={form.subdomain}
                      onChange={(val) => setForm({ ...form, subdomain: val.toLowerCase() })}
                      placeholder="abc-college"
                      required
                      icon={Globe}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1 px-1 font-mono">{form.subdomain || "subdomain"}.campusos.com</p>
                  </div>

                  <FormField
                    id="admin_name"
                    label="Admin Name"
                    value={form.admin_name}
                    onChange={(val) => setForm({ ...form, admin_name: val })}
                    required
                    icon={User}
                  />

                  <FormField
                    id="admin_email"
                    label="Admin Email"
                    type="email"
                    value={form.admin_email}
                    onChange={(val) => setForm({ ...form, admin_email: val })}
                    required
                    icon={Mail}
                  />

                  <PasswordField
                    id="admin_password"
                    label="Admin Password"
                    value={form.admin_password}
                    onChange={(val) => setForm({ ...form, admin_password: val })}
                    required
                    showStrength
                  />

                  <FormSelect
                    id="plan"
                    label="Subscription Plan"
                    value={form.plan}
                    onChange={(val) => setForm({ ...form, plan: val })}
                    options={[
                      { value: "free", label: "Free" },
                      { value: "basic", label: "Basic" },
                      { value: "premium", label: "Premium" },
                      { value: "enterprise", label: "Enterprise" },
                    ]}
                    icon={Layers}
                  />

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Brand Theme Color</label>
                    <div className="flex items-center gap-3 mt-1.5 p-2 rounded-2xl border-2 border-border/70 bg-background/80">
                      <input type="color" value={form.theme_color} onChange={(e) => setForm({ ...form, theme_color: e.target.value })} className="h-8 w-12 rounded-xl border border-border/80 cursor-pointer" />
                      <span className="text-xs font-mono text-foreground font-medium">{form.theme_color}</span>
                    </div>
                  </div>

                  {error && <p className="text-xs text-rose-500 font-semibold md:col-span-2">{error}</p>}
                  <div className="flex gap-2 md:col-span-2 pt-2">
                    <SubmitButton
                      type="submit"
                      isLoading={createMutation.isPending}
                      loadingText="Creating..."
                      successText="Created!"
                    >
                      Create College
                    </SubmitButton>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(""); }} className="rounded-2xl">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Edit College Form */}
          {editingCollege && (
            <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 backdrop-blur-xl rounded-3xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Edit className="h-4 w-4 text-amber-500" /> Edit — {editingCollege.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateCollege} className="grid gap-4 md:grid-cols-2">
                  <FormField
                    id="edit_name"
                    label="College Name"
                    value={editingCollege.name}
                    onChange={(val) => setEditingCollege({ ...editingCollege, name: val })}
                    icon={Building}
                  />

                  <FormField
                    id="edit_subdomain"
                    label="Subdomain (Read-only)"
                    value={editingCollege.subdomain}
                    onChange={() => {}}
                    disabled
                    icon={Globe}
                  />

                  <FormSelect
                    id="edit_plan"
                    label="Subscription Plan"
                    value={editingCollege.plan}
                    onChange={(val) => setEditingCollege({ ...editingCollege, plan: val })}
                    options={[
                      { value: "free", label: "Free" },
                      { value: "basic", label: "Basic" },
                      { value: "premium", label: "Premium" },
                      { value: "enterprise", label: "Enterprise" },
                    ]}
                    icon={Layers}
                  />

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Theme Color</label>
                    <div className="flex items-center gap-3 mt-1.5 p-2 rounded-2xl border-2 border-border/70 bg-background/80">
                      <input type="color" value={editingCollege.theme_color} onChange={(e) => setEditingCollege({ ...editingCollege, theme_color: e.target.value })} className="h-8 w-12 rounded-xl border border-border/80 cursor-pointer" />
                      <span className="text-xs font-mono text-foreground font-medium">{editingCollege.theme_color}</span>
                    </div>
                  </div>

                  {error && <p className="text-xs text-rose-500 font-semibold md:col-span-2">{error}</p>}
                  <div className="flex gap-2 md:col-span-2 pt-2">
                    <SubmitButton
                      type="submit"
                      variant="warning"
                      isLoading={updateMutation.isPending}
                      loadingText="Updating..."
                      successText="Updated!"
                    >
                      Update College
                    </SubmitButton>
                    <Button type="button" variant="outline" onClick={() => { setEditingCollege(null); setError(""); }} className="rounded-2xl">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Colleges DataTable */}
          <DataTable
            title={`All Colleges (${colleges.length})`}
            description="Manage college tenants, subscriptions, and account status"
            data={colleges}
            columns={columns}
            filters={tableFilters}
            searchPlaceholder="Search college name, subdomain, plan..."
            searchFields={["name", "subdomain", "plan"]}
            exportFileName="colleges_directory"
            isLoading={isLoading}
            emptyMessage="No colleges match your search. Onboard your first college above."
            actions={
              <Button
                onClick={() => { setShowForm(!showForm); setEditingCollege(null); }}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md text-xs"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Onboard College
              </Button>
            }
          />
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
