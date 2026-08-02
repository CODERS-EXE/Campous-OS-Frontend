"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, Attendance } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface AttendanceAnalytics {
  total_sessions: number;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  overall_percentage: number;
  subject_stats: {
    subject: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  }[];
  low_attendance_students: {
    student_name: string;
    roll_no: string;
    department: string;
    attendance_percentage: number;
    total_classes: number;
    present: number;
  }[];
}

const TABS = ["Overview", "All Records", "Subject-wise", "Defaulters"] as const;
type Tab = typeof TABS[number];

export default function CollegeAdminAttendancePage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [subjectFilter, setSubjectFilter] = useState("");

  const analyticsQuery = useQuery<AttendanceAnalytics>({
    queryKey: ["attendance-analytics"],
    queryFn: () => api.get<AttendanceAnalytics>("/api/v1/attendance/analytics"),
  });

  const allAttendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance-all"],
    queryFn: () =>
      api.get<Attendance[]>(
        `/api/v1/attendance${subjectFilter ? `?subject=${encodeURIComponent(subjectFilter)}` : ""}`
      ),
    enabled: tab === "All Records",
  });

  const analytics = analyticsQuery.data;

  const uniqueSubjects = useMemo(
    () => Array.from(new Set(analytics?.subject_stats.map((s) => s.subject) ?? [])),
    [analytics]
  );

  const handleExportCSV = () => {
    const rows = [
      ["Subject", "Total", "Present", "Absent", "Late", "Percentage"],
      ...(analytics?.subject_stats.map((s) => [
        s.subject,
        s.total,
        s.present,
        s.absent,
        s.late,
        `${s.percentage}%`,
      ]) ?? []),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Attendance Management">
        <div className="space-y-6">
          {/* Tab Bar */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 min-w-[80px] rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {tab === "Overview" && (
            <div className="space-y-6">
              {analyticsQuery.isLoading ? (
                <div className="grid gap-4 md:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-8 w-16 bg-muted rounded mb-2" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </Card>
                  ))}
                </div>
              ) : analytics ? (
                <>
                  {/* KPI Cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Total Sessions", value: analytics.total_sessions, icon: Calendar, color: "bg-blue-500" },
                      { label: "Overall %", value: `${analytics.overall_percentage}%`, icon: TrendingUp, color: "bg-emerald-500" },
                      { label: "Present Records", value: analytics.present_count, icon: CheckCircle2, color: "bg-green-500" },
                      { label: "Absent Records", value: analytics.absent_count, icon: XCircle, color: "bg-red-500" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <Card key={label}>
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
                    ))}
                  </div>

                  {/* Low Attendance Alert */}
                  {analytics.low_attendance_students.length > 0 && (
                    <Card className="border-orange-200 dark:border-orange-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                          <AlertTriangle className="h-5 w-5" />
                          Low Attendance Alert — {analytics.low_attendance_students.length} student(s) below 75%
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left pb-2 font-medium text-muted-foreground">Student</th>
                                <th className="text-left pb-2 font-medium text-muted-foreground">Roll No</th>
                                <th className="text-left pb-2 font-medium text-muted-foreground">Dept</th>
                                <th className="text-center pb-2 font-medium text-muted-foreground">Present/Total</th>
                                <th className="text-center pb-2 font-medium text-muted-foreground">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.low_attendance_students.map((s, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="py-2 font-medium">{s.student_name}</td>
                                  <td className="py-2 text-muted-foreground font-mono">{s.roll_no}</td>
                                  <td className="py-2 text-muted-foreground">{s.department}</td>
                                  <td className="py-2 text-center">{s.present}/{s.total_classes}</td>
                                  <td className="py-2 text-center">
                                    <span className="font-bold text-orange-600">{s.attendance_percentage}%</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center text-muted-foreground">No analytics data available.</Card>
              )}
            </div>
          )}

          {/* ── All Records Tab ── */}
          {tab === "All Records" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={() => allAttendanceQuery.refetch()}>
                    Refresh
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>

              {allAttendanceQuery.isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading attendance records…</div>
              ) : !allAttendanceQuery.data?.length ? (
                <Card className="p-12 text-center text-muted-foreground">No attendance records found.</Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Subject", "Date", "Session", "Students", "Present", "Absent", "Late"].map((h) => (
                          <th key={h} className={`p-3 font-medium text-muted-foreground ${h === "Students" || h === "Present" || h === "Absent" || h === "Late" ? "text-center" : "text-left"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allAttendanceQuery.data.map((att) => {
                        const present = att.records.filter((r) => r.status === "present").length;
                        const absent = att.records.filter((r) => r.status === "absent").length;
                        const late = att.records.filter((r) => r.status === "late").length;
                        return (
                          <tr key={att.id} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-medium">{att.subject}</td>
                            <td className="p-3 text-muted-foreground">{formatDate(att.date)}</td>
                            <td className="p-3 text-muted-foreground">{att.session_name || "—"}</td>
                            <td className="p-3 text-center">{att.records.length}</td>
                            <td className="p-3 text-center text-green-600 font-semibold">{present}</td>
                            <td className="p-3 text-center text-red-500 font-semibold">{absent}</td>
                            <td className="p-3 text-center text-orange-500 font-semibold">{late}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Subject-wise Tab ── */}
          {tab === "Subject-wise" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
              {analyticsQuery.isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading…</div>
              ) : !analytics?.subject_stats.length ? (
                <Card className="p-12 text-center text-muted-foreground">No subject data.</Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {analytics.subject_stats.map((s) => (
                    <Card key={s.subject}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {s.subject}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl font-bold">{s.percentage}%</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.percentage >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {s.percentage >= 75 ? "Good" : "Low"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all ${s.percentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(s.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-center">
                          <div>
                            <p className="font-bold text-green-600">{s.present}</p>
                            <p className="text-muted-foreground">Present</p>
                          </div>
                          <div>
                            <p className="font-bold text-red-500">{s.absent}</p>
                            <p className="text-muted-foreground">Absent</p>
                          </div>
                          <div>
                            <p className="font-bold text-orange-500">{s.late}</p>
                            <p className="text-muted-foreground">Late</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Defaulters Tab ── */}
          {tab === "Defaulters" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <p className="text-sm text-muted-foreground">
                  Students with attendance below 75% threshold
                </p>
              </div>
              {analyticsQuery.isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading…</div>
              ) : !analytics?.low_attendance_students.length ? (
                <Card className="p-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                  <p className="text-muted-foreground">No defaulters — all students are above 75%! 🎉</p>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        {["Student", "Roll No", "Department", "Classes Present", "Total Classes", "Attendance %"].map((h) => (
                          <th key={h} className={`p-3 font-medium text-muted-foreground ${h === "Attendance %" || h === "Classes Present" || h === "Total Classes" ? "text-center" : "text-left"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.low_attendance_students.map((s, i) => (
                        <tr key={i} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">{s.student_name}</td>
                          <td className="p-3 font-mono text-muted-foreground">{s.roll_no}</td>
                          <td className="p-3 text-muted-foreground">{s.department}</td>
                          <td className="p-3 text-center text-green-600">{s.present}</td>
                          <td className="p-3 text-center">{s.total_classes}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold text-sm ${s.attendance_percentage < 60 ? "text-red-600" : "text-orange-500"}`}>
                              {s.attendance_percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
