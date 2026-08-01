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
import { api, Company } from "@/lib/api";
import { Plus, Building2, Trash2, Globe, MapPin, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    tier: "tier_1",
    description: "",
  });

  const { data: response, isLoading } = useQuery<{ companies: Company[] }>({
    queryKey: ["companies"],
    queryFn: () => api.get("/api/v1/placements/companies"),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post<{ id: string }>("/api/v1/placements/companies", body),
    onSuccess: () => {
      toast.success("Company added successfully");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setShowModal(false);
      setForm({ name: "", industry: "", location: "", website: "", tier: "tier_1", description: "" });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add company"),
  });

  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => api.delete(`/api/v1/placements/companies/${companyId}`),
    onSuccess: () => {
      toast.success("Company removed");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete company"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.industry.trim() || !form.location.trim()) {
      toast.error("Company name, industry and location are required");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Companies">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage partner companies for placement drives</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : response?.companies && response.companies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {response.companies.map((company) => (
                <Card key={company.id} className="relative group">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2 font-bold">
                        <Building2 className="h-5 w-5 text-indigo-500" />
                        {company.name}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (confirm(`Remove ${company.name}?`)) {
                            deleteMutation.mutate(company.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <p className="text-muted-foreground font-medium">{company.industry}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{company.location}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <Globe className="h-3.5 w-3.5" />
                        <a href={company.website} target="_blank" rel="noreferrer" className="underline truncate">
                          {company.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t mt-3">
                      <span className="text-[11px] text-muted-foreground">
                        {company.total_drives ?? 0} drives conduct
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${company.tier === "tier_1" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                        {company.tier.replace("_", " ")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              No companies registered yet. Click &quot;Add Company&quot; to get started.
            </Card>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-md bg-background p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Register New Company</h3>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="c-name">Company Name</Label>
                    <Input
                      id="c-name"
                      placeholder="e.g. Google India"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="c-ind">Industry</Label>
                      <Input
                        id="c-ind"
                        placeholder="e.g. Software / Tech"
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-loc">Location</Label>
                      <Input
                        id="c-loc"
                        placeholder="e.g. Bengaluru, KA"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="c-web">Website (optional)</Label>
                    <Input
                      id="c-web"
                      placeholder="https://company.com"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-tier">Tier Classification</Label>
                    <select
                      id="c-tier"
                      value={form.tier}
                      onChange={(e) => setForm({ ...form, tier: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="tier_1">Tier 1 (Dream Companies)</option>
                      <option value="tier_2">Tier 2 (Core / IT Services)</option>
                      <option value="tier_3">Tier 3 (Mass Recruiters / Startups)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Adding..." : "Add Company"}
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
