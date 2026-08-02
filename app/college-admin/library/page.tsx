"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Download,
  IndianRupee,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, LibraryBook, LibraryCategory, LibraryIssue } from "@/lib/api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const TABS = ["Overview", "Books", "Categories", "Issues", "Returns & Fines"] as const;
type Tab = typeof TABS[number];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Modal wrapper
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-background shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function CollegeAdminLibraryPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  // Modal states
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState<LibraryCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  const [showBookModal, setShowBookModal] = useState(false);
  const [editBook, setEditBook] = useState<LibraryBook | null>(null);
  const [bookForm, setBookForm] = useState({
    title: "", author: "", isbn: "", publisher: "", edition: "",
    year: "", category_id: "", total_quantity: "1", location: "", language: "English", description: "",
  });

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ book_id: "", user_id: "", due_days: "14" });

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnIssue, setReturnIssue] = useState<LibraryIssue | null>(null);
  const [returnForm, setReturnForm] = useState({ is_lost: false, is_damaged: false, remarks: "" });

  // Queries
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["library-analytics"],
    queryFn: () => api.getLibraryAnalytics(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["library-categories"],
    queryFn: () => api.getLibraryCategories(),
  });

  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["library-books", search],
    queryFn: () => api.getLibraryBooks({ search: search || undefined }),
  });

  const { data: issues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ["library-issues"],
    queryFn: () => api.getLibraryIssues(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: () => api.getStudents(),
  });

  // Mutations
  const saveCatMutation = useMutation({
    mutationFn: () =>
      editCat
        ? api.updateLibraryCategory(editCat.id, catForm)
        : api.createLibraryCategory(catForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-categories"] });
      qc.invalidateQueries({ queryKey: ["library-analytics"] });
      setShowCatModal(false);
      toast.success(editCat ? "Category updated" : "Category created");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => api.deleteLibraryCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-categories"] });
      toast.success("Category deleted");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const saveBookMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...bookForm,
        year: bookForm.year ? parseInt(bookForm.year) : undefined,
        total_quantity: parseInt(bookForm.total_quantity) || 1,
        category_id: bookForm.category_id || undefined,
      };
      return editBook
        ? api.updateLibraryBook(editBook.id, payload)
        : api.createLibraryBook(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["library-analytics"] });
      setShowBookModal(false);
      toast.success(editBook ? "Book updated" : "Book added");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => api.deleteLibraryBook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["library-analytics"] });
      toast.success("Book deleted");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const issueMutation = useMutation({
    mutationFn: () => api.issueLibraryBook({ ...issueForm, due_days: parseInt(issueForm.due_days) || 14 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-issues"] });
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["library-analytics"] });
      setShowIssueModal(false);
      setIssueForm({ book_id: "", user_id: "", due_days: "14" });
      toast.success("Book issued successfully");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const returnMutation = useMutation({
    mutationFn: () => api.returnLibraryBook({ issue_id: returnIssue!.id, ...returnForm }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["library-issues"] });
      qc.invalidateQueries({ queryKey: ["library-books"] });
      qc.invalidateQueries({ queryKey: ["library-analytics"] });
      setShowReturnModal(false);
      const fine = res.fine_amount;
      toast.success(fine && fine > 0 ? `Book returned. Fine: ₹${fine.toFixed(2)}` : "Book returned successfully");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const renewMutation = useMutation({
    mutationFn: (issueId: string) => api.renewLibraryBook({ issue_id: issueId, additional_days: 14 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-issues"] });
      toast.success("Book renewed for 14 more days");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const payFineMutation = useMutation({
    mutationFn: (issueId: string) => api.payLibraryFine(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library-issues"] });
      toast.success("Fine marked as paid");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const now = new Date();
  const activeIssues = issues.filter((i) => i.status === "issued");
  const overdueIssues = issues.filter((i) => i.status === "issued" && new Date(i.due_date) < now);
  const pendingFines = issues.filter((i) => i.fine_amount > 0 && !i.fine_paid);
  const availableBooks = books.filter((b) => b.available_quantity > 0);

  const openAddCat = () => { setEditCat(null); setCatForm({ name: "", description: "" }); setShowCatModal(true); };
  const openEditCat = (c: LibraryCategory) => { setEditCat(c); setCatForm({ name: c.name, description: c.description || "" }); setShowCatModal(true); };
  const openAddBook = () => { setEditBook(null); setBookForm({ title: "", author: "", isbn: "", publisher: "", edition: "", year: "", category_id: "", total_quantity: "1", location: "", language: "English", description: "" }); setShowBookModal(true); };
  const openEditBook = (b: LibraryBook) => { setEditBook(b); setBookForm({ title: b.title, author: b.author, isbn: b.isbn || "", publisher: b.publisher || "", edition: b.edition || "", year: b.year?.toString() || "", category_id: b.category_id || "", total_quantity: b.total_quantity.toString(), location: b.location || "", language: b.language, description: b.description || "" }); setShowBookModal(true); };
  const openReturn = (i: LibraryIssue) => { setReturnIssue(i); setReturnForm({ is_lost: false, is_damaged: false, remarks: "" }); setShowReturnModal(true); };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Library Management">
        <div className="space-y-6">
          {/* Tab Bar */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 min-w-[80px] rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === "Overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Total Books" value={loadingAnalytics ? "…" : (analytics?.total_books ?? 0)} icon={BookOpen} color="bg-blue-500" />
                <StatCard label="Available" value={loadingAnalytics ? "…" : (analytics?.total_available ?? 0)} icon={CheckCircle2} color="bg-emerald-500" />
                <StatCard label="Issued" value={loadingAnalytics ? "…" : (analytics?.total_issued ?? 0)} icon={BookOpenCheck} color="bg-amber-500" />
                <StatCard label="Overdue" value={loadingAnalytics ? "…" : (analytics?.overdue_issues ?? 0)} icon={AlertTriangle} color="bg-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Categories" value={loadingAnalytics ? "…" : (analytics?.total_categories ?? 0)} icon={Tag} color="bg-violet-500" />
                <StatCard label="Active Issues" value={loadingAnalytics ? "…" : (analytics?.active_issues ?? 0)} icon={Users} color="bg-cyan-500" />
                <StatCard label="Pending Fines" value={loadingAnalytics ? "…" : `₹${(analytics?.pending_fines_amount ?? 0).toFixed(0)}`} icon={IndianRupee} color="bg-orange-500" />
                <StatCard label="Fines Collected" value={loadingAnalytics ? "…" : `₹${(analytics?.collected_fines_amount ?? 0).toFixed(0)}`} icon={IndianRupee} color="bg-green-600" />
              </div>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Recent Active Issues</CardTitle></CardHeader>
                <CardContent>
                  {activeIssues.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">No active book issues.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b">
                          <th className="text-left pb-2 font-medium text-muted-foreground">Book</th>
                          <th className="text-left pb-2 font-medium text-muted-foreground">Borrower</th>
                          <th className="text-right pb-2 font-medium text-muted-foreground">Due Date</th>
                        </tr></thead>
                        <tbody>
                          {activeIssues.slice(0, 6).map((i) => (
                            <tr key={i.id} className="border-b last:border-0">
                              <td className="py-2 pr-3 font-medium">{i.book_title}</td>
                              <td className="py-2 pr-3 text-muted-foreground">{i.user_name}</td>
                              <td className="py-2 text-right">
                                {new Date(i.due_date) < now
                                  ? <span className="text-red-500 font-medium">Overdue</span>
                                  : new Date(i.due_date).toLocaleDateString()}
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
          )}

          {/* ── Books ── */}
          {tab === "Books" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search by title, author, ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowIssueModal(true)}>
                    <BookOpenCheck className="mr-2 h-4 w-4" /> Issue Book
                  </Button>
                  <Button size="sm" onClick={openAddBook}>
                    <Plus className="mr-2 h-4 w-4" /> Add Book
                  </Button>
                </div>
              </div>
              {loadingBooks ? (
                <div className="text-center py-8 text-muted-foreground">Loading books…</div>
              ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-3 opacity-30" />
                  <p>No books found. Add your first book!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Book", "Category", "ISBN", "Total", "Available", "Location", "Actions"].map((h) => (
                          <th key={h} className={`p-3 font-medium text-muted-foreground ${h === "Actions" ? "text-right" : h === "Total" || h === "Available" ? "text-center" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <p className="font-medium">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                          </td>
                          <td className="p-3 text-muted-foreground">{book.category_name || "—"}</td>
                          <td className="p-3 text-muted-foreground">{book.isbn || "—"}</td>
                          <td className="p-3 text-center">{book.total_quantity}</td>
                          <td className="p-3 text-center">
                            <span className={`font-medium ${book.available_quantity === 0 ? "text-red-500" : "text-emerald-600"}`}>
                              {book.available_quantity}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">{book.location || "—"}</td>
                          <td className="p-3 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="outline" size="sm" onClick={() => openEditBook(book)}>Edit</Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteBookMutation.mutate(book.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Categories ── */}
          {tab === "Categories" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={openAddCat}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
              </div>
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Tag className="h-12 w-12 mb-3 opacity-30" />
                  <p>No categories yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => (
                    <Card key={cat.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{cat.name}</p>
                            {cat.description && <p className="text-sm text-muted-foreground mt-0.5">{cat.description}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openEditCat(cat)}>Edit</Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteCatMutation.mutate(cat.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Issues ── */}
          {tab === "Issues" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{activeIssues.length} active · {overdueIssues.length} overdue</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowIssueModal(true)}>
                    <BookOpenCheck className="mr-2 h-4 w-4" /> Issue Book
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    api.exportLibraryReport()
                      .catch(() => toast.error("Export failed"));
                  }}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
              {loadingIssues ? (
                <div className="text-center py-8 text-muted-foreground">Loading…</div>
              ) : activeIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BookOpenCheck className="h-12 w-12 mb-3 opacity-30" />
                  <p>No active issues.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Book", "Borrower", "Issued", "Due", "Renewals", "Actions"].map((h) => (
                          <th key={h} className={`p-3 font-medium text-muted-foreground ${h === "Actions" ? "text-right" : h === "Renewals" ? "text-center" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeIssues.map((issue) => {
                        const isOverdue = new Date(issue.due_date) < now;
                        return (
                          <tr key={issue.id} className={`border-t hover:bg-muted/30 transition-colors ${isOverdue ? "bg-red-50/40 dark:bg-red-950/20" : ""}`}>
                            <td className="p-3 font-medium">{issue.book_title}</td>
                            <td className="p-3">
                              <p>{issue.user_name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{issue.user_role}</p>
                            </td>
                            <td className="p-3 text-muted-foreground">{new Date(issue.issue_date).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className={isOverdue ? "text-red-600 font-medium flex items-center gap-1" : ""}>
                                {isOverdue && <AlertTriangle className="h-3.5 w-3.5" />}
                                {new Date(issue.due_date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-3 text-center">{issue.renewed_count}/{issue.max_renewals}</td>
                            <td className="p-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button variant="outline" size="sm" className="text-emerald-600" onClick={() => openReturn(issue)}>
                                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> Return
                                </Button>
                                {issue.renewed_count < issue.max_renewals && (
                                  <Button variant="outline" size="sm" onClick={() => renewMutation.mutate(issue.id)} disabled={renewMutation.isPending}>
                                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Renew
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Returns & Fines ── */}
          {tab === "Returns & Fines" && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-orange-500" /> Pending Fines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingFines.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground text-sm">No pending fines.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b">
                          {["Book", "User", "Reason", "Fine", "Action"].map((h) => (
                            <th key={h} className={`pb-2 font-medium text-muted-foreground ${h === "Action" || h === "Fine" ? "text-right" : "text-left"}`}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {pendingFines.map((i) => (
                            <tr key={i.id} className="border-b last:border-0">
                              <td className="py-2 pr-3">{i.book_title}</td>
                              <td className="py-2 pr-3">{i.user_name}</td>
                              <td className="py-2 pr-3 capitalize text-muted-foreground">{i.fine_reason}</td>
                              <td className="py-2 pr-3 text-right font-semibold text-orange-600">₹{i.fine_amount.toFixed(2)}</td>
                              <td className="py-2 text-right">
                                <Button size="sm" onClick={() => payFineMutation.mutate(i.id)} disabled={payFineMutation.isPending}>
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark Paid
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-emerald-500" /> Return History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {issues.filter((i) => i.status === "returned").length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground text-sm">No return history yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b">
                          {["Book", "User", "Returned", "Fine"].map((h) => (
                            <th key={h} className={`pb-2 font-medium text-muted-foreground ${h === "Fine" ? "text-right" : "text-left"}`}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {issues.filter((i) => i.status === "returned").slice(0, 15).map((i) => (
                            <tr key={i.id} className="border-b last:border-0">
                              <td className="py-2 pr-3">{i.book_title}</td>
                              <td className="py-2 pr-3">{i.user_name}</td>
                              <td className="py-2 pr-3 text-muted-foreground">{i.return_date ? new Date(i.return_date).toLocaleDateString() : "—"}</td>
                              <td className="py-2 text-right">
                                {i.fine_amount > 0 ? (
                                  <span className={i.fine_paid ? "text-emerald-600" : "text-orange-600"}>
                                    ₹{i.fine_amount.toFixed(2)} {i.fine_paid ? "✓" : "(pending)"}
                                  </span>
                                ) : <span className="text-muted-foreground">None</span>}
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
          )}
        </div>

        {/* ── Category Modal ── */}
        <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title={editCat ? "Edit Category" : "Add Category"}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category Name *</Label>
              <Input value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Science, Engineering" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={catForm.description} onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
            </div>
            <Button className="w-full" onClick={() => saveCatMutation.mutate()} disabled={!catForm.name || saveCatMutation.isPending}>
              {saveCatMutation.isPending ? "Saving…" : "Save Category"}
            </Button>
          </div>
        </Modal>

        {/* ── Book Modal ── */}
        <Modal open={showBookModal} onClose={() => setShowBookModal(false)} title={editBook ? "Edit Book" : "Add Book"}>
          <div className="space-y-3">
            {[
              { key: "title", label: "Title *", placeholder: "Book title" },
              { key: "author", label: "Author *", placeholder: "Author name" },
              { key: "isbn", label: "ISBN", placeholder: "ISBN number" },
              { key: "publisher", label: "Publisher", placeholder: "Publisher name" },
              { key: "edition", label: "Edition", placeholder: "e.g. 3rd Edition" },
              { key: "year", label: "Year", placeholder: "Publication year" },
              { key: "total_quantity", label: "Total Copies *", placeholder: "Number of copies" },
              { key: "location", label: "Shelf Location", placeholder: "e.g. Shelf A-3" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={(bookForm as Record<string, string>)[key]}
                  onChange={(e) => setBookForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  type={["year", "total_quantity"].includes(key) ? "number" : "text"}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={bookForm.category_id}
                onChange={(e) => setBookForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Button className="w-full" onClick={() => saveBookMutation.mutate()} disabled={!bookForm.title || !bookForm.author || saveBookMutation.isPending}>
              {saveBookMutation.isPending ? "Saving…" : "Save Book"}
            </Button>
          </div>
        </Modal>

        {/* ── Issue Modal ── */}
        <Modal open={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue Book to User">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Book *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={issueForm.book_id}
                onChange={(e) => setIssueForm((f) => ({ ...f, book_id: e.target.value }))}
              >
                <option value="">Select a book</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>{b.title} by {b.author} ({b.available_quantity} avail.)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={issueForm.user_id}
                onChange={(e) => setIssueForm((f) => ({ ...f, user_id: e.target.value }))}
              >
                <option value="">Select student</option>
                {students.map((s) => <option key={s.user_id} value={s.user_id}>{s.name} — {s.roll_no}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Due Days</Label>
              <Input type="number" value={issueForm.due_days} onChange={(e) => setIssueForm((f) => ({ ...f, due_days: e.target.value }))} min="1" max="90" />
            </div>
            <Button className="w-full" onClick={() => issueMutation.mutate()} disabled={!issueForm.book_id || !issueForm.user_id || issueMutation.isPending}>
              {issueMutation.isPending ? "Issuing…" : "Issue Book"}
            </Button>
          </div>
        </Modal>

        {/* ── Return Modal ── */}
        <Modal open={showReturnModal} onClose={() => setShowReturnModal(false)} title="Return Book">
          {returnIssue && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">{returnIssue.book_title}</p>
                <p className="text-muted-foreground">Issued to: {returnIssue.user_name}</p>
                <p className="text-muted-foreground">Due: {new Date(returnIssue.due_date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={returnForm.is_lost}
                    onChange={(e) => setReturnForm((f) => ({ ...f, is_lost: e.target.checked, is_damaged: false }))} />
                  <span className="text-sm">Lost (₹500 fine)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={returnForm.is_damaged}
                    onChange={(e) => setReturnForm((f) => ({ ...f, is_damaged: e.target.checked, is_lost: false }))} />
                  <span className="text-sm">Damaged (₹200 fine)</span>
                </label>
              </div>
              <div className="space-y-1.5">
                <Label>Remarks</Label>
                <Input value={returnForm.remarks} onChange={(e) => setReturnForm((f) => ({ ...f, remarks: e.target.value }))} placeholder="Optional" />
              </div>
              <Button className="w-full" onClick={() => returnMutation.mutate()} disabled={returnMutation.isPending}>
                {returnMutation.isPending ? "Processing…" : "Confirm Return"}
              </Button>
            </div>
          )}
        </Modal>
      </DashboardShell>
    </AuthGuard>
  );
}
