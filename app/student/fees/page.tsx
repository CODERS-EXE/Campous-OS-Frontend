"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  QrCode,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, StudentFeeDetailsResponse, StudentFee } from "@/lib/api";

export default function StudentFeesPage() {
  const qc = useQueryClient();
  const [payModalFee, setPayModalFee] = useState<StudentFee | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "UPI",
    transaction_id: "",
    remarks: "",
  });

  const detailsQuery = useQuery<StudentFeeDetailsResponse>({
    queryKey: ["student", "fees"],
    queryFn: () => api.getStudentFeeDetails(),
  });

  const payMutation = useMutation({
    mutationFn: (body: unknown) => api.submitOnlinePayment(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "fees"] });
      setPayModalFee(null);
      setPaymentForm({ amount: "", payment_method: "UPI", transaction_id: "", remarks: "" });
      toast.success("Payment submitted successfully! Pending admin approval.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const data = detailsQuery.data;
  const isLoading = detailsQuery.isLoading;

  const summary = data?.summary;
  const fees = data?.student_fees ?? [];
  const payments = data?.payments ?? [];
  const invoices = data?.invoices ?? [];
  const receipts = data?.receipts ?? [];

  const handleDownloadInvoice = (id: string, num: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(`${API_URL}/api/v1/fees/invoices/${id}/download`, "_blank");
  };

  const handleDownloadReceipt = (id: string, num: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(`${API_URL}/api/v1/fees/receipts/${id}/download`, "_blank");
  };

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="My Fees & Receipts">
        <div className="space-y-6">
          {/* KPI Summary Cards */}
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
                    <p className="text-xs font-medium text-muted-foreground">Pending Balance Due</p>
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

          {/* Payment Modal */}
          {payModalFee && (
            <Card className="border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" /> Pay {payModalFee.fee_name}
                </CardTitle>
                <CardDescription>
                  Outstanding due amount: <strong className="text-amber-600">₹{payModalFee.due_amount.toLocaleString()}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    payMutation.mutate({
                      student_fee_id: payModalFee.id,
                      amount: parseFloat(paymentForm.amount),
                      payment_method: paymentForm.payment_method,
                      transaction_id: paymentForm.transaction_id,
                      remarks: paymentForm.remarks,
                    });
                  }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Payment Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      max={payModalFee.due_amount}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder={String(payModalFee.due_amount)}
                      className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Payment Method *</label>
                    <select
                      value={paymentForm.payment_method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                      className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Transaction / UTR Reference No *</label>
                    <input
                      required
                      value={paymentForm.transaction_id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                      placeholder="e.g. UTR-123456789"
                      className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Remarks (Optional)</label>
                    <input
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      placeholder="Optional notes"
                      className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setPayModalFee(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={payMutation.isPending} className="bg-blue-600 text-white rounded-xl">
                      {payMutation.isPending ? "Submitting..." : "Submit Online Payment"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Section 1: Allocated Fees */}
          <Card>
            <CardHeader>
              <CardTitle>My Allocated Fees</CardTitle>
              <CardDescription>Breakdown of fees assigned for current academic year</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : fees.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">No fees currently allocated.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Fee Category</th>
                        <th className="px-4 py-3">Year / Sem</th>
                        <th className="px-4 py-3">Net Amount</th>
                        <th className="px-4 py-3">Paid Amount</th>
                        <th className="px-4 py-3">Balance Due</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
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
                          <td className="px-4 py-3.5 text-right">
                            {f.due_amount > 0 && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPayModalFee(f);
                                  setPaymentForm({ ...paymentForm, amount: String(f.due_amount) });
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs gap-1"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Pay Now
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Invoices & Receipts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" /> Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No invoices generated yet.</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                        <div>
                          <p className="font-semibold text-sm">{inv.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">Due: ₹{inv.due_amount.toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(inv.id, inv.invoice_number)}
                          className="rounded-lg text-xs gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" /> Payment Receipts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {receipts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No payment receipts available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {receipts.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                        <div>
                          <p className="font-semibold text-sm">{rec.receipt_number}</p>
                          <p className="text-xs text-emerald-600 font-medium">Paid: ₹{rec.amount_paid.toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReceipt(rec.id, rec.receipt_number)}
                          className="rounded-lg text-xs gap-1 border-emerald-600/30 text-emerald-600"
                        >
                          <Download className="h-3.5 w-3.5" /> Receipt
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Payment History Log */}
          <Card>
            <CardHeader>
              <CardTitle>My Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payment history found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Mode / Method</th>
                        <th className="px-4 py-3">Transaction ID</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3.5 text-xs">{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5 text-xs font-medium capitalize">
                            {p.payment_mode} ({p.payment_method})
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs">{p.transaction_id}</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-600">₹{p.amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                p.status === "approved"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : p.status === "pending"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              }`}
                            >
                              {p.status.toUpperCase()}
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
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
