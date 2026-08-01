"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Company, PlacementDrive } from "@/lib/api";
import { Plus, Calendar, Building2, Trash2, X, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PlacementDrivesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    company_id: "",
    title: "",
    role: "",
    ctc: "10.0",
    start_date: new Date().toISOString().split("T")[0],
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    min_cgpa: "6.0",
    description: "",
  });

  const { data: response, isLoading } = useQuery<{ drives: PlacementDrive[] }>({
    queryKey: ["placement-drives"],
    queryFn: () => api.get("/api/v1/placements/drives"),
  });

  const { data: companiesRes } = useQuery<{ companies: Company[] }>({
    queryKey: ["companies"],
    queryFn: () => api.get("/api/v1/placements/companies"),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      api.post<{ id: string }>("/api/v1/placements/drives", {
        company_id: body.company_id,
        title: body.title,
        role: body.role,
        role_type: "full_time",
        package: { ctc: parseFloat(body.ctc) || 0 },
        locations: [{ city: "Multiple", country: "India", is_remote: false, is_hybrid: false }],
        eligibility: { min_cgpa: parseFloat(body.min_cgpa) || 0, allowed_branches: ["All"], max_backlogs: 2, max_gap_years: 1 },
        start_date: new Date(body.start_date).toISOString(),
        deadline: new Date(body.deadline).toISOString(),
        description: body.description,
      }),
    onSuccess: () => {
      toast.success("Placement drive created");
      queryClient.invalidateQueries({ queryKey: ["placement-drives"] });
      setShowModal(false);
      setForm({
        company_id: "",
        title: "",
        role: "",
        ctc: "10.0",
        start_date: new Date().toISOString().split("T")[0],
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        min_cgpa: "6.0",
        description: "",
      });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create drive"),
  });

  const deleteMutation = useMutation({
    mutationFn: (driveId: string) => api.delete(`/api/v1/placements/drives/${driveId}`),
    onSuccess: () => {
      toast.success("Drive deleted");
      queryClient.invalidateQueries({ queryKey: ["placement-drives"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete drive"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_id || !form.title || !form.role) {
      toast.error("Company, Drive Title, and Role are required");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Placement Drives">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage placement recruitment drives</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Drive
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : response?.drives && response.drives.length > 0 ? (
            <div className="space-y-4">
              {response.drives.map((drive) => (
                <Card key={drive.id} className="relative group">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-indigo-500" />
                        {drive.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{drive.package?.ctc ?? 0} LPA
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (confirm(`Delete drive ${drive.title}?`)) {
                              deleteMutation.mutate(drive.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Company</p>
                        <p className="font-semibold">{drive.company?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Role</p>
                        <p className="font-semibold">{drive.role}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Application Deadline</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(drive.deadline)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Applications</p>
                        <p className="font-semibold">{drive.total_applications ?? 0} received</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase ${drive.status === "open" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                          {drive.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              No placement drives found. Click &quot;Create Drive&quot; to initiate a recruitment drive.
            </Card>
          )}

          {/* Create Drive Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-lg bg-background p-6 rounded-2xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Create Placement Recruitment Drive</h3>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="d-comp">Select Company</Label>
                    <select
                      id="d-comp"
                      value={form.company_id}
                      onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">-- Choose a company --</option>
                      {companiesRes?.companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.industry})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="d-title">Drive Title</Label>
                    <Input
                      id="d-title"
                      placeholder="e.g. Software Engineer Campus Hiring 2026"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="d-role">Designation / Role</Label>
                      <Input
                        id="d-role"
                        placeholder="Software Engineer"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="d-ctc">Package (CTC in LPA)</Label>
                      <Input
                        id="d-ctc"
                        type="number"
                        step="0.5"
                        placeholder="12.5"
                        value={form.ctc}
                        onChange={(e) => setForm({ ...form, ctc: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="d-start">Start Date</Label>
                      <Input
                        id="d-start"
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="d-dl">Deadline Date</Label>
                      <Input
                        id="d-dl"
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="d-cgpa">Min CGPA Requirement</Label>
                    <Input
                      id="d-cgpa"
                      type="number"
                      step="0.1"
                      placeholder="6.5"
                      value={form.min_cgpa}
                      onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Drive"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
