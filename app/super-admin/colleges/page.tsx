"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Edit, Plus, Search, Trash2, XCircle } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, College } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function CollegesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const collegesQuery = useQuery({
    queryKey: ["colleges"],
    queryFn: () => api.get<College[]>("/api/v1/colleges"),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post<College>("/api/v1/colleges", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setShowForm(false);
      setForm({
        name: "",
        subdomain: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
        theme_color: "#2563eb",
        plan: "free",
      });
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

  const filteredColleges = useMemo(() => {
    let result = collegesQuery.data || [];

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.subdomain.toLowerCase().includes(query) ||
          c.plan.toLowerCase().includes(query)
      );
    }

    return result;
  }, [collegesQuery.data, statusFilter, searchQuery]);

  const handleStatusToggle = (college: College) => {
    const newStatus = college.status === "active" ? "suspended" : "active";
    if (
      confirm(
        `${newStatus === "active" ? "Activate" : "Suspend"} ${college.name}? This will ${
          newStatus === "active" ? "restore" : "block"
        } access for all users.`
      )
    ) {
      updateMutation.mutate({ id: college.id, updates: { status: newStatus } });
    }
  };

  const handleEditClick = (college: College) => {
    setEditingCollege(college);
    setShowForm(false);
  };

  const handleUpdateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;
    
    updateMutation.mutate({
      id: editingCollege.id,
      updates: {
        name: editingCollege.name,
        theme_color: editingCollege.theme_color,
        plan: editingCollege.plan,
      },
    });
  };

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="College Management">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingCollege(null);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Onboard College
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Onboard New College</CardTitle>
                <CardDescription>Create a new college and administrator account</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setError("");
                    createMutation.mutate(form);
                  }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label>College Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subdomain *</Label>
                    <Input
                      value={form.subdomain}
                      onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
                      placeholder="abc-college"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.subdomain || "subdomain"}.campusos.com
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Name *</Label>
                    <Input
                      value={form.admin_name}
                      onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Email *</Label>
                    <Input
                      type="email"
                      value={form.admin_email}
                      onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Password *</Label>
                    <Input
                      type="password"
                      value={form.admin_password}
                      onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscription Plan</Label>
                    <select
                      value={form.plan}
                      onChange={(e) => setForm({ ...form, plan: e.target.value })}
                      className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Theme Color</Label>
                    <Input
                      type="color"
                      value={form.theme_color}
                      onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
                  <div className="flex gap-2 md:col-span-2">
                    <Button type="submit" disabled={createMutation.isPending} variant="default">
                      {createMutation.isPending ? "Creating..." : "Create College"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {editingCollege && (
            <Card>
              <CardHeader>
                <CardTitle>Edit College</CardTitle>
                <CardDescription>Update college information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateCollege} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>College Name</Label>
                    <Input
                      value={editingCollege.name}
                      onChange={(e) =>
                        setEditingCollege({ ...editingCollege, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subdomain (Read-only)</Label>
                    <Input value={editingCollege.subdomain} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscription Plan</Label>
                    <select
                      value={editingCollege.plan}
                      onChange={(e) =>
                        setEditingCollege({ ...editingCollege, plan: e.target.value })
                      }
                      className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Theme Color</Label>
                    <Input
                      type="color"
                      value={editingCollege.theme_color}
                      onChange={(e) =>
                        setEditingCollege({ ...editingCollege, theme_color: e.target.value })
                      }
                    />
                  </div>
                  {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
                  <div className="flex gap-2 md:col-span-2">
                    <Button type="submit" disabled={updateMutation.isPending} variant="default">
                      {updateMutation.isPending ? "Updating..." : "Update College"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingCollege(null);
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Colleges</CardTitle>
              <CardDescription>
                Showing {filteredColleges.length} of {collegesQuery.data?.length || 0} colleges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collegesQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredColleges.length > 0 ? (
                <div className="space-y-3">
                  {filteredColleges.map((college) => (
                    <Card key={college.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-12 w-12 rounded-xl"
                            style={{ backgroundColor: college.theme_color }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{college.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {college.subdomain}.campusos.com
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {formatDate(college.created_at || "")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                                {college.plan}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                  college.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                }`}
                              >
                                {college.status === "active" ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {college.status}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(college)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant={college.status === "active" ? "destructive" : "default"}
                                size="sm"
                                onClick={() => handleStatusToggle(college)}
                              >
                                {college.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "No colleges match your search."
                      : "No colleges yet. Onboard your first college above."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
