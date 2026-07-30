"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, StudentFeeDetailsResponse } from "@/lib/api";

export default function ParentFeesPage() {
  const detailsQuery = useQuery<StudentFeeDetailsResponse>({
    queryKey: ["parent", "child_fees"],
    queryFn: () => api.getStudentFeeDetails(),
  });

  const data = detailsQuery.data;
  const isLoading = detailsQuery.isLoading;

  const summary = data?.summary;
  const fees = data?.student_fees ?? [];
  const payments = data?.payments ?? [];
  const receipts = data?.receipts ?? [];

  const handleDownloadReceipt = (id: string, num: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(`${API_URL}/api/v1/fees/receipts/${id}/download`, "_blank");
  };

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Child Fees & Receipts">
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Fee Billed</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">₹{summary?.total_net?.toLocaleString() ?? 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Amount Paid</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{summary?.total_paid?.toLocaleString() ?? 0}
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
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Pending Dues</p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-amber-600">
                        ₹{summary?.total_due?.toLocaleString() ?? 0}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Child Allocated Fees */}
          <Card>
            <CardHeader>
              <CardTitle>Child Allocated Fees</CardTitle>
              <CardDescription>Academic fee structure & balance due status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : fees.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">No fees allocated for your child.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Fee Item</th>
                        <th className="px-4 py-3">Academic Term</th>
                        <th className="px-4 py-3">Net Amount</th>
                        <th className="px-4 py-3">Paid Amount</th>
                        <th className="px-4 py-3">Due Balance</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fees.map((f) => (
                        <tr key={f.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3.5 font-medium">{f.fee_name}</td>
                          <td className="px-4 py-3.5 text-xs">
                            {f.academic_year} (Sem {f.semester ?? 1})
                          </td>
                          <td className="px-4 py-3.5">₹{f.net_amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-emerald-600 font-medium">₹{f.paid_amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-amber-600 font-bold">₹{f.due_amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-xs">{new Date(f.due_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                f.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : f.status === "partially_paid"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {f.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Receipts for Parent */}
          <Card>
            <CardHeader>
              <CardTitle>Child Payment Receipts</CardTitle>
              <CardDescription>Download official payment receipts for tax and fee records</CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">No receipts generated yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {receipts.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20">
                      <div>
                        <p className="font-semibold text-sm">{rec.receipt_number}</p>
                        <p className="text-xs text-emerald-600 font-medium">Paid: ₹{rec.amount_paid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(rec.payment_date).toLocaleDateString()}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(rec.id, rec.receipt_number)}
                        className="rounded-lg text-xs gap-1 border-emerald-600/30 text-emerald-600"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
