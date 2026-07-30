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
import { api, UpdateUserPayload, User } from "@/lib/api";

interface WardenForm extends UpdateUserPayload {
  name: string;
  email: string;
  password: string;
  hostel: string;
  status: string;
}

const PAGE_SIZE = 8;

export default function WardensPage() {
  const queryClient = useQueryClient();
  const [selectedWarden, setSelectedWarden] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<WardenForm>({
    name: "",
    email: "",
    password: "",
    hostel: "",
    status: "active",
  });

  const { data: wardens, isLoading } = useQuery({
    queryKey: ["wardens"],
    queryFn: () => api.get<User[]>("/api/v1/users/wardens"),
  });

  const hostels = useMemo(
    () => Array.from(new Set(wardens?.map((warden) => String(warden.profile?.hostel ?? "")).filter(Boolean))),
    [wardens]
  );

  const filteredWardens = useMemo(() => {
    if (!wardens) return [];
    const normalizedSearch = search.toLowerCase();
    const normalizedHostelFilter = hostelFilter.toLowerCase();
    const normalizedStatusFilter = statusFilter.toLowerCase();
    return wardens.filter((warden) => {
      const profileHostel = String(warden.profile?.hostel ?? "").toLowerCase();
      const profileStatus = String(warden.profile?.status ?? "").toLowerCase();
      const matchesSearch =
        warden.name.toLowerCase().includes(normalizedSearch) ||
        warden.email.toLowerCase().includes(normalizedSearch) ||
        profileHostel.includes(normalizedSearch) ||
        profileStatus.includes(normalizedSearch);
      const matchesHostel = hostelFilter ? profileHostel === normalizedHostelFilter : true;
      const matchesStatus = statusFilter ? profileStatus === normalizedStatusFilter : true;
      return matchesSearch && matchesHostel && matchesStatus;
    });
  }, [wardens, search, hostelFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredWardens.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedWardens = filteredWardens.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const createMutation = useMutation({
    mutationFn: (body: WardenForm) =>
      api.post<User>("/api/v1/users", {
        ...body,
        role: "warden",
      }),
    onSuccess: () => {
      setMessage("Warden user created successfully.");
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
      setMessage("Warden user updated successfully.");
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
      setMessage("Warden user deleted successfully.");
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

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Wardens">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{selectedWarden ? "Edit Warden" : "Add Warden"}</CardTitle>
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
                    required={!selectedWarden}
                    placeholder={selectedWarden ? "Leave blank to keep current" : "Minimum 8 characters"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostel">Hostel</Label>
                  <Input
                    id="hostel"
                    value={form.hostel}
                    onChange={(e) => setForm({ ...form, hostel: e.target.value })}
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
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && <p className="text-sm text-primary">{message}</p>}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Button type="submit" disabled={createMutation.status === "pending" || updateMutation.status === "pending"}>
                    {selectedWarden ? (updateMutation.status === "pending" ? "Updating..." : "Update Warden") : (createMutation.status === "pending" ? "Creating..." : "Add Warden")}
                  </Button>
                  {selectedWarden && (
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
              <CardTitle>Warden Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage warden users for your college.</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>Total wardens: <span className="font-semibold">{wardens?.length ?? 0}</span></p>
                <p>{selectedWarden ? "Editing an existing warden." : "Create a new warden profile."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>All Wardens ({filteredWardens.length})</CardTitle>
                <p className="text-sm text-muted-foreground">Search, filter, and manage hostel wardens.</p>
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
                    placeholder="Name, email, hostel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-hostel">Hostel</Label>
                  <select
                    id="filter-hostel"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    value={hostelFilter}
                    onChange={(e) => {
                      setHostelFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All hostels</option>
                    {hostels.map((hostel) => (
                      <option key={hostel} value={hostel}>
                        {hostel}
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
            ) : filteredWardens.length > 0 ? (
              <div className="space-y-3">
                {paginatedWardens.map((warden) => (
                  <div key={warden.id} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{warden.name}</p>
                      <p className="text-sm text-muted-foreground">{warden.email}</p>
                      <p className="text-sm text-muted-foreground">Hostel: {String(warden.profile?.hostel ?? "-")}</p>
                      <p className="text-sm text-muted-foreground">Status: {String(warden.profile?.status ?? "active")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(warden)}>
                        Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(warden)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No warden users registered yet.</p>
            )}
          </CardContent>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(PAGE_SIZE, filteredWardens.length - (currentPage - 1) * PAGE_SIZE)} of {filteredWardens.length} wardens
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
