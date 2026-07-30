"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Search,
} from "lucide-react";
import { api, LibraryBook, LibraryIssueWithOverdue } from "@/lib/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const TABS = ["My Books", "Browse Library"] as const;
type Tab = typeof TABS[number];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    issued: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    returned: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    lost: "bg-gray-100 text-gray-700",
    damaged: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || map["issued"]}`}>
      {status}
    </span>
  );
}

export default function StudentLibraryPage() {
  const [tab, setTab] = useState<Tab>("My Books");
  const [search, setSearch] = useState("");

  const { data: myIssues = [], isLoading: loadingIssues } = useQuery<LibraryIssueWithOverdue[]>({
    queryKey: ["my-library-issues"],
    queryFn: () => api.getMyLibraryIssues(),
    enabled: tab === "My Books",
  });

  const { data: books = [], isLoading: loadingBooks } = useQuery<LibraryBook[]>({
    queryKey: ["library-books-browse", search],
    queryFn: () => api.getLibraryBooks({ search: search || undefined }),
    enabled: tab === "Browse Library",
  });

  const activeIssues = myIssues.filter((i) => i.status === "issued");
  const overdueIssues = myIssues.filter((i) => i.is_overdue);
  const pendingFine = myIssues.reduce((sum, i) => sum + (i.fine_paid ? 0 : i.fine_amount), 0);

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Library">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Books Borrowed", value: activeIssues.length, icon: BookOpenCheck, color: "bg-blue-500" },
              { label: "Overdue", value: overdueIssues.length, icon: AlertTriangle, color: "bg-red-500" },
              { label: "Total Returned", value: myIssues.filter((i) => i.status === "returned").length, icon: CheckCircle2, color: "bg-emerald-500" },
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

          {/* Tab Bar */}
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* My Books Tab */}
          {tab === "My Books" && (
            <div className="space-y-4">
              {loadingIssues ? (
                <div className="text-center py-8 text-muted-foreground">Loading…</div>
              ) : myIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BookOpenCheck className="h-14 w-14 mb-4 opacity-30" />
                  <p className="font-medium">No books borrowed yet.</p>
                  <p className="text-sm">Browse the library to find books!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myIssues.map((issue) => (
                    <Card
                      key={issue.id}
                      className={`hover:shadow-md transition-shadow ${
                        issue.is_overdue ? "border-red-300 dark:border-red-800" : ""
                      }`}
                    >
                      <CardContent className="p-4">
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
                              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Issued: {new Date(issue.issue_date).toLocaleDateString()}
                                </span>
                                <span className={`flex items-center gap-1 ${issue.is_overdue ? "text-red-600 font-medium" : ""}`}>
                                  {issue.is_overdue && <AlertTriangle className="h-3 w-3" />}
                                  Due: {new Date(issue.due_date).toLocaleDateString()}
                                </span>
                                {issue.renewed_count > 0 && (
                                  <span>Renewed: {issue.renewed_count}×</span>
                                )}
                              </div>
                              {issue.fine_amount > 0 && (
                                <p className={`text-xs mt-1 font-medium ${issue.fine_paid ? "text-emerald-600" : "text-orange-600"}`}>
                                  Fine: ₹{issue.fine_amount.toFixed(2)} {issue.fine_paid ? "(Paid ✓)" : "(Unpaid — pay at library)"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <StatusBadge status={issue.is_overdue && issue.status === "issued" ? "overdue" : issue.status} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Browse Library Tab */}
          {tab === "Browse Library" && (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by title, author, ISBN…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {loadingBooks ? (
                <div className="text-center py-8 text-muted-foreground">Searching books…</div>
              ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BookOpen className="h-14 w-14 mb-4 opacity-30" />
                  <p>No books found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {books.map((book) => (
                    <Card key={book.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="h-16 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{book.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                            {book.category_name && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{book.category_name}</span>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {book.total_quantity} copies total
                              </span>
                              <span className={`text-xs font-medium ${book.available_quantity > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {book.available_quantity > 0
                                  ? `${book.available_quantity} available`
                                  : "All checked out"}
                              </span>
                            </div>
                            {book.location && (
                              <p className="text-xs text-muted-foreground mt-0.5">📍 {book.location}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
