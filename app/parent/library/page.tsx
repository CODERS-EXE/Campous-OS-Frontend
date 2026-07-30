"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
} from "lucide-react";
import { api, LibraryIssue } from "@/lib/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";

function StatusBadge({ status, isOverdue }: { status: string; isOverdue: boolean }) {
  const label = isOverdue && status === "issued" ? "overdue" : status;
  const map: Record<string, string> = {
    issued: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    returned: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    lost: "bg-gray-100 text-gray-700",
    damaged: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[label] || map["issued"]}`}>
      {label}
    </span>
  );
}

export default function ParentLibraryPage() {
  const { user } = useAuthStore();
  const studentId =
    user?.profile?.student_ids && Array.isArray(user.profile.student_ids) && user.profile.student_ids.length > 0
      ? (user.profile.student_ids as string[])[0]
      : undefined;

  const { data: issues = [], isLoading } = useQuery<LibraryIssue[]>({
    queryKey: ["library-issues-parent", studentId],
    queryFn: () => api.getLibraryIssues({ user_id: studentId }),
    enabled: !!studentId,
  });

  const now = new Date();
  const activeIssues = issues.filter((i) => i.status === "issued");
  const overdueIssues = issues.filter((i) => i.status === "issued" && new Date(i.due_date) < now);
  const pendingFine = issues.reduce((sum, i) => sum + (i.fine_paid ? 0 : i.fine_amount), 0);

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Child's Library">
        <div className="space-y-6">
          {!studentId ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <BookOpen className="h-14 w-14 mb-4 opacity-30" />
              <p className="font-medium">No student linked to your account.</p>
              <p className="text-sm">Please contact the college admin.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Currently Borrowed", value: activeIssues.length, icon: BookOpenCheck, color: "bg-blue-500" },
                  { label: "Overdue", value: overdueIssues.length, icon: AlertTriangle, color: overdueIssues.length > 0 ? "bg-red-500" : "bg-gray-400" },
                  { label: "Total Returned", value: issues.filter((i) => i.status === "returned").length, icon: CheckCircle2, color: "bg-emerald-500" },
                  { label: "Pending Fine", value: `₹${pendingFine.toFixed(0)}`, icon: IndianRupee, color: pendingFine > 0 ? "bg-orange-500" : "bg-gray-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <Card key={label} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-xl font-bold mt-0.5">{value}</p>
                        </div>
                        <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Overdue Alert */}
              {overdueIssues.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">
                      {overdueIssues.length} book{overdueIssues.length > 1 ? "s" : ""} overdue
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">
                      Please remind your child to return the overdue book{overdueIssues.length > 1 ? "s" : ""} to avoid additional fines (₹2/day).
                    </p>
                  </div>
                </div>
              )}

              {/* Issue History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Book Borrow History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading…</div>
                  ) : issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mb-3 opacity-30" />
                      <p>No library activity yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {issues.map((issue) => {
                        const isOverdue = issue.status === "issued" && new Date(issue.due_date) < now;
                        return (
                          <div
                            key={issue.id}
                            className={`rounded-xl border p-4 transition-colors ${isOverdue ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : "hover:bg-muted/30"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-3">
                                <div className="h-12 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                                  <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold">{issue.book_title}</p>
                                  {issue.book_isbn && (
                                    <p className="text-xs text-muted-foreground">ISBN: {issue.book_isbn}</p>
                                  )}
                                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Issued: {new Date(issue.issue_date).toLocaleDateString()}
                                    </span>
                                    <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                                      {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                      Due: {new Date(issue.due_date).toLocaleDateString()}
                                    </span>
                                    {issue.return_date && (
                                      <span className="text-emerald-600">
                                        Returned: {new Date(issue.return_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {issue.fine_amount > 0 && (
                                    <p className={`text-xs mt-1 font-medium ${issue.fine_paid ? "text-emerald-600" : "text-orange-600"}`}>
                                      Fine: ₹{issue.fine_amount.toFixed(2)} {issue.fine_paid ? "(Paid ✓)" : "(Unpaid — pay at library)"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <StatusBadge status={issue.status} isOverdue={isOverdue} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
