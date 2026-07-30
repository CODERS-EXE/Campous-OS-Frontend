"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, Company } from "@/lib/api";
import { Plus, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const { data: response, isLoading } = useQuery<{ companies: Company[] }>({
    queryKey: ["companies"],
    queryFn: () => api.get("/api/v1/placements/companies"),
  });

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Companies">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Manage companies for placement drives</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {response?.companies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{company.industry}</p>
                    <p>{company.location}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {company.total_drives} drives
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
