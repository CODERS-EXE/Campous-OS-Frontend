"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Send,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  FeeAnalytics,
  FeeStructure,
  Payment,
  PendingDue,
  Student,
} from "@/lib/api";

export default function CollegeAdminFeesPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"dashboard" | "structures" | "student_fees" | "payments" | "reports">("dashboard");

  // Filters & State
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / Forms
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [structForm, setStructForm] = useState({
    name: "",
    code: "",
    description: "",
    amount: "",
    academic_year: "2026-2027",
    semester: "1",
    department: "All",
    course: "All",
  });

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({
    fee_structure_id: "",
    due_date: new Date().toISOString().split("T")[0],
    discount: "0",
    department: "All",
    year: "",
    semester: "",
  });

  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    student_id: "",
    amount: "",
    payment_method: "Cash",
    transaction_id: "",
    remarks: "",
  });

  // Queries
  const analyticsQuery = useQuery<FeeAnalytics>({
    queryKey: ["fees", "analytics"],
    queryFn: () => api.getFeeAnalytics(),
  });

  const structuresQuery = useQuery<FeeStructure[]>({
    queryKey: ["fees", "structures", academicYear, semesterFilter, departmentFilter],
    queryFn: () =>
      api.getFeeStructures({
        academic_year: academicYear || undefined,
        semester: semesterFilter ? parseInt(semesterFilter) : undefined,
        department: departmentFilter || undefined,
      }),
  });

  const duesQuery = useQuery<PendingDue[]>({
    queryKey: ["fees", "dues", searchQuery, academicYear, semesterFilter, departmentFilter],
    queryFn: () =>
      api.getPendingDues({
        search: searchQuery || undefined,
        academic_year: academicYear || undefined,
        semester: semesterFilter ? parseInt(semesterFilter) : undefined,
        department: departmentFilter || undefined,
      }),
  });

  const paymentsQuery = useQuery<Payment[]>({
    queryKey: ["fees", "payments"],
    queryFn: () => api.getPayments(),
  });

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => api.getStudents(),
  });

  // Mutations
  const createStructureMutation = useMutation({
    mutationFn: (body: unknown) => api.createFeeStructure(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees", "structures"] });
      qc.invalidateQueries({ queryKey: ["fees", "analytics"] });
      setShowStructureForm(false);
      setStructForm({
        name: "",
        code: "",
        description: "",
        amount: "",
        academic_year: "2026-2027",
        semester: "1",
        department: "All",
        course: "All",
      });
      toast.success("Fee Structure created successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const assignFeeMutation = useMutation({
    mutationFn: (body: unknown) => api.assignFees(body),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["fees", "dues"] });
      qc.invalidateQueries({ queryKey: ["fees", "analytics"] });
      setShowAssignForm(false);
      toast.success(`Assigned fee to ${res.assigned_count} student(s)!`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const offlinePaymentMutation = useMutation({
    mutationFn: (body: unknown) => api.recordOfflinePayment(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees", "payments"] });
      qc.invalidateQueries({ queryKey: ["fees", "dues"] });
      qc.invalidateQueries({ queryKey: ["fees", "analytics"] });
      setShowOfflineForm(false);
      setOfflineForm({ student_id: "", amount: "", payment_method: "Cash", transaction_id: "", remarks: "" });
      toast.success("Offline payment recorded successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approvePaymentMutation = useMutation({
    mutationFn: (id: string) => api.approvePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees", "payments"] });
      qc.invalidateQueries({ queryKey: ["fees", "dues"] });
      qc.invalidateQueries({ queryKey: ["fees", "analytics"] });
      toast.success("Online payment approved!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (id: string) => api.rejectPayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fees", "payments"] });
      toast.success("Payment request rejected.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (body: unknown) => api.generateInvoice(body),
    onSuccess: () => {
      toast.success("Invoice generated successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleExportCSV = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(`${API_URL}/api/v1/fees/export`, "_blank");
  };

  const stats = analyticsQuery.data;
  const structures = structuresQuery.data ?? [];
  const dues = duesQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const pendingPayments = payments.filter((p) => p.status === "pending");

  return (
    <AuthGuard allowedRoles={["college_admin", "super_admin"]}>
      <DashboardShell title="Fees Management">
        <div className="space-y-6">
          {/* Top Bar Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "outline"}
                onClick={() => setActiveTab("dashboard")}
                className="rounded-xl text-sm font-medium"
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === "structures" ? "default" : "outline"}
                onClick={() => setActiveTab("structures")}
                className="rounded-xl text-sm font-medium"
              >
                Fee Structures ({structures.length})
              </Button>
              <Button
                variant={activeTab === "student_fees" ? "default" : "outline"}
                onClick={() => setActiveTab("student_fees")}
                className="rounded-xl text-sm font-medium"
              >
                Assign & Manage Fees
              </Button>
              <Button
                variant={activeTab === "payments" ? "default" : "outline"}
                onClick={() => setActiveTab("payments")}
                className="rounded-xl text-sm font-medium relative"
              >
                Payments
                {pendingPayments.length > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 text-white text-xs px-2 py-0.5 font-bold">
                    {pendingPayments.length}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === "reports" ? "default" : "outline"}
                onClick={() => setActiveTab("reports")}
                className="rounded-xl text-sm font-medium"
              >
                Pending Dues & Reports
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="rounded-xl text-xs gap-1.5 border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export CSV Report
              </Button>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Fee Billed</p>
                        <p className="text-2xl font-bold">₹{stats?.total_billed?.toLocaleString() ?? 0}</p>
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
                        <p className="text-2xl font-bold text-emerald-600">
                          ₹{stats?.total_paid?.toLocaleString() ?? 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Pending Dues</p>
                        <p className="text-2xl font-bold text-amber-600">
                          ₹{stats?.total_due?.toLocaleString() ?? 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
                        <p className="text-2xl font-bold text-purple-600">{stats?.collection_rate ?? 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Collection Mode Breakdown</CardTitle>
                    <CardDescription>Online vs Offline cash/cheque fee collections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span>Online Payments</span>
                        <span className="text-emerald-600 font-bold">₹{stats?.online_paid?.toLocaleString() ?? 0}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${stats?.total_paid ? Math.min(((stats?.online_paid ?? 0) / stats.total_paid) * 100, 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span>Offline Payments</span>
                        <span className="text-blue-600 font-bold">₹{stats?.offline_paid?.toLocaleString() ?? 0}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${stats?.total_paid ? Math.min(((stats?.offline_paid ?? 0) / stats.total_paid) * 100, 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Administrative Actions</CardTitle>
                    <CardDescription>Shortcut triggers for fee management tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button
                      onClick={() => {
                        setActiveTab("structures");
                        setShowStructureForm(true);
                      }}
                      className="w-full justify-start rounded-xl h-12 gap-2 text-left"
                      variant="outline"
                    >
                      <Plus className="h-5 w-5 text-blue-600" /> Create Fee Structure
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab("student_fees");
                        setShowAssignForm(true);
                      }}
                      className="w-full justify-start rounded-xl h-12 gap-2 text-left"
                      variant="outline"
                    >
                      <Send className="h-5 w-5 text-indigo-600" /> Assign Fee to Class
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab("payments");
                        setShowOfflineForm(true);
                      }}
                      className="w-full justify-start rounded-xl h-12 gap-2 text-left"
                      variant="outline"
                    >
                      <CreditCard className="h-5 w-5 text-emerald-600" /> Record Cash Payment
                    </Button>
                    <Button
                      onClick={() => setActiveTab("reports")}
                      className="w-full justify-start rounded-xl h-12 gap-2 text-left"
                      variant="outline"
                    >
                      <FileText className="h-5 w-5 text-amber-600" /> View Pending Defaulters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: FEE STRUCTURES */}
          {activeTab === "structures" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">Fee Structures</h3>
                  <p className="text-sm text-muted-foreground">Manage templates for Tuition, Hostel, Library & Exam fees</p>
                </div>
                <Button onClick={() => setShowStructureForm(true)} className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" /> Create Fee Structure
                </Button>
              </div>

              {/* Form Modal / Inline Card */}
              {showStructureForm && (
                <Card className="border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">New Fee Structure Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        createStructureMutation.mutate({
                          ...structForm,
                          amount: parseFloat(structForm.amount),
                          semester: structForm.semester ? parseInt(structForm.semester) : undefined,
                        });
                      }}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Fee Name *</label>
                        <input
                          required
                          value={structForm.name}
                          onChange={(e) => setStructForm({ ...structForm, name: e.target.value })}
                          placeholder="e.g. B.Tech Tuition Fee 2026"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Code *</label>
                        <input
                          required
                          value={structForm.code}
                          onChange={(e) => setStructForm({ ...structForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. TUIT-SEM1-2026"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Amount (₹) *</label>
                        <input
                          required
                          type="number"
                          value={structForm.amount}
                          onChange={(e) => setStructForm({ ...structForm, amount: e.target.value })}
                          placeholder="e.g. 45000"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Academic Year</label>
                        <input
                          value={structForm.academic_year}
                          onChange={(e) => setStructForm({ ...structForm, academic_year: e.target.value })}
                          placeholder="2026-2027"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                        <select
                          value={structForm.semester}
                          onChange={(e) => setStructForm({ ...structForm, semester: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                          <option value="3">Semester 3</option>
                          <option value="4">Semester 4</option>
                          <option value="5">Semester 5</option>
                          <option value="6">Semester 6</option>
                          <option value="7">Semester 7</option>
                          <option value="8">Semester 8</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Department</label>
                        <input
                          value={structForm.department}
                          onChange={(e) => setStructForm({ ...structForm, department: e.target.value })}
                          placeholder="e.g. CSE or All"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setShowStructureForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createStructureMutation.isPending} className="bg-blue-600 text-white rounded-xl">
                          {createStructureMutation.isPending ? "Saving..." : "Save Fee Structure"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* List of Fee Structures */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {structures.map((s) => (
                  <Card key={s.id} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-bold">{s.name}</CardTitle>
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {s.code}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">₹{s.amount.toLocaleString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1.5 text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Academic Year:</strong> {s.academic_year}
                      </p>
                      <p>
                        <strong className="text-foreground">Semester:</strong> {s.semester ?? "Full Year"}
                      </p>
                      <p>
                        <strong className="text-foreground">Department:</strong> {s.department ?? "All"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGN & MANAGE FEES */}
          {activeTab === "student_fees" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">Assign Fees to Students</h3>
                  <p className="text-sm text-muted-foreground">Bulk assign fee structures to departments/classes with custom discounts & due dates</p>
                </div>
                <Button onClick={() => setShowAssignForm(!showAssignForm)} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Send className="h-4 w-4" /> Assign New Fee
                </Button>
              </div>

              {showAssignForm && (
                <Card className="border-indigo-500/40 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">Fee Assignment Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!assignForm.fee_structure_id) {
                          toast.error("Please select a Fee Structure before assigning.");
                          return;
                        }
                        assignFeeMutation.mutate({
                          fee_structure_id: assignForm.fee_structure_id,
                          due_date: assignForm.due_date,
                          discount: parseFloat(assignForm.discount || "0"),
                          department: assignForm.department === "All" ? undefined : assignForm.department,
                          year: assignForm.year ? parseInt(assignForm.year) : undefined,
                          semester: assignForm.semester ? parseInt(assignForm.semester) : undefined,
                        });
                      }}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Select Fee Structure *</label>
                        <select
                          required
                          value={assignForm.fee_structure_id}
                          onChange={(e) => setAssignForm({ ...assignForm, fee_structure_id: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="">-- Choose Structure --</option>
                          {structures.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} - ₹{st.amount} ({st.academic_year})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Due Date *</label>
                        <input
                          type="date"
                          required
                          value={assignForm.due_date}
                          onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Scholarship Discount (₹)</label>
                        <input
                          type="number"
                          value={assignForm.discount}
                          onChange={(e) => setAssignForm({ ...assignForm, discount: e.target.value })}
                          placeholder="0"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Filter Department</label>
                        <input
                          value={assignForm.department}
                          onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })}
                          placeholder="CSE, ECE, or All"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Filter Year</label>
                        <select
                          value={assignForm.year}
                          onChange={(e) => setAssignForm({ ...assignForm, year: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="">All Years</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setShowAssignForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={assignFeeMutation.isPending} className="bg-indigo-600 text-white rounded-xl">
                          {assignFeeMutation.isPending ? "Assigning..." : "Confirm & Assign Fee"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">Payments & Approvals</h3>
                  <p className="text-sm text-muted-foreground">Approve online portal payments or record offline cash/cheque payments</p>
                </div>
                <Button onClick={() => setShowOfflineForm(true)} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4" /> Record Offline Payment
                </Button>
              </div>

              {/* Record Offline Modal */}
              {showOfflineForm && (
                <Card className="border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">Record Cash/Cheque Offline Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        offlinePaymentMutation.mutate({
                          student_id: offlineForm.student_id,
                          amount: parseFloat(offlineForm.amount),
                          payment_method: offlineForm.payment_method,
                          transaction_id: offlineForm.transaction_id,
                          remarks: offlineForm.remarks,
                        });
                      }}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Student *</label>
                        <select
                          required
                          value={offlineForm.student_id}
                          onChange={(e) => setOfflineForm({ ...offlineForm, student_id: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="">-- Choose Student --</option>
                          {students.map((st) => (
                            <option key={st.id} value={st.user_id}>
                              {st.name} ({st.roll_no} - {st.department})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Amount Paid (₹) *</label>
                        <input
                          type="number"
                          required
                          value={offlineForm.amount}
                          onChange={(e) => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                          placeholder="e.g. 25000"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Payment Method</label>
                        <select
                          value={offlineForm.payment_method}
                          onChange={(e) => setOfflineForm({ ...offlineForm, payment_method: e.target.value })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Cheque">Cheque</option>
                          <option value="DD">Demand Draft (DD)</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Receipt / Reference No</label>
                        <input
                          value={offlineForm.transaction_id}
                          onChange={(e) => setOfflineForm({ ...offlineForm, transaction_id: e.target.value })}
                          placeholder="CHQ-987123"
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setShowOfflineForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={offlinePaymentMutation.isPending} className="bg-emerald-600 text-white rounded-xl">
                          {offlinePaymentMutation.isPending ? "Recording..." : "Record Payment & Generate Receipt"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Payments Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payment Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Mode & Method</th>
                          <th className="px-4 py-3">Transaction Ref</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3.5 text-xs">
                              {new Date(p.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-xs capitalize">{p.payment_mode}</span> - {p.payment_method}
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
                            <td className="px-4 py-3.5 text-right">
                              {p.status === "pending" && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => approvePaymentMutation.mutate(p.id)}
                                    className="bg-emerald-600 text-white rounded-lg h-8 px-2 text-xs"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectPaymentMutation.mutate(p.id)}
                                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-8 px-2 text-xs"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 5: REPORTS & DEFAULTERS */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">Pending Dues & Defaulter Reports</h3>
                  <p className="text-sm text-muted-foreground">Filter student fee balances and generate invoices</p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name or roll..."
                    className="w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <input
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    placeholder="Filter by Department (e.g. CSE)"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">All Semesters</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                  </select>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Roll No</th>
                          <th className="px-4 py-3">Dept</th>
                          <th className="px-4 py-3">Fee Name</th>
                          <th className="px-4 py-3">Net Payable</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Due Balance</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {dues.map((d) => (
                          <tr key={d.student_fee_id} className="hover:bg-muted/20">
                            <td className="px-4 py-3.5 font-medium">{d.student_name}</td>
                            <td className="px-4 py-3.5 font-mono text-xs">{d.roll_no}</td>
                            <td className="px-4 py-3.5 text-xs">{d.department}</td>
                            <td className="px-4 py-3.5">{d.fee_name}</td>
                            <td className="px-4 py-3.5">₹{d.net_amount.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-emerald-600 font-medium">₹{d.paid_amount.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-amber-600 font-bold">₹{d.due_amount.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-xs">{d.due_date}</td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  generateInvoiceMutation.mutate({
                                    student_id: d.student_id,
                                    academic_year: d.academic_year,
                                    due_date: d.due_date,
                                  })
                                }
                                className="rounded-lg h-8 text-xs gap-1"
                              >
                                <FileText className="h-3.5 w-3.5" /> Invoice
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
