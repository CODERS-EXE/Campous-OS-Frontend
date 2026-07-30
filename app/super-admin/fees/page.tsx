"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, DollarSign, TrendingUp, Building2, Search, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, FeeAnalytics } from "@/lib/api";

export default function SuperAdminFeesPage() {
  const [search, setSearch] = useState("");

  const analyticsQuery = useQuery<FeeAnalytics>({
    queryKey: ["fees", "analytics", "super_admin"],
    queryFn: () => api.getFeeAnalytics(),
  });

  const data = analyticsQuery.data;
  const isLoading = analyticsQuery.isLoading;

  const collegeStats = data?.college_stats ?? [];
  const filteredColleges = collegeStats.filter((c) =>
    c.college_name.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = collegeStats.map((c) => ({
    name: c.college_name.length > 15 ? c.college_name.substring(0, 12) + "..." : c.college_name,
    Billed: c.total_billed,
    Collected: c.total_paid,
    Pending: c.total_due,
  }));

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Cross-College Fee Analytics">
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Billed</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-28 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">₹{data?.total_billed?.toLocaleString() ?? 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Collected</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-28 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{data?.total_paid?.toLocaleString() ?? 0}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Pending</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-28 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-amber-600">
                        ₹{data?.total_due?.toLocaleString() ?? 0}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Overall Collection Rate</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-purple-600">{data?.collection_rate ?? 0}%</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Overview */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" /> College Fee Breakdown
              </CardTitle>
              <CardDescription>Comparison of billed, collected, and pending amounts per college</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full rounded-xl" />
              ) : chartData.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
                  No college fee analytics data available.
                </div>
              ) : (
                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                      <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]} />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Bar dataKey="Billed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* College Detailed Table */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>College-wise Fee Performance</CardTitle>
                <CardDescription>Detailed overview of fee recovery across registered colleges</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search college name..."
                  className="w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredColleges.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">No colleges match your search criteria.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">College Name</th>
                        <th className="px-4 py-3">Total Billed</th>
                        <th className="px-4 py-3">Total Collected</th>
                        <th className="px-4 py-3">Pending Dues</th>
                        <th className="px-4 py-3">Recovery Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredColleges.map((col) => (
                        <tr key={col.college_id} className="hover:bg-muted/20">
                          <td className="px-4 py-3.5 font-medium">{col.college_name}</td>
                          <td className="px-4 py-3.5 font-medium text-blue-600">₹{col.total_billed.toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-medium text-emerald-600">₹{col.total_paid.toLocaleString()}</td>
                          <td className="px-4 py-3.5 font-medium text-amber-600">₹{col.total_due.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(col.collection_rate, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{col.collection_rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
