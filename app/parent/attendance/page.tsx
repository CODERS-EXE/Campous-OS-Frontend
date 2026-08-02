"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api, Attendance, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function ParentAttendancePage() {
  const { user } = useAuthStore();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const childParam = params.get("child");
      if (childParam) {
        setSelectedChildId(childParam);
      }
    }
  }, []);

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["my-children"],
    queryFn: () => api.get<Student[]>("/api/v1/users/my-children"),
    enabled: !!user,
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "student"],
    queryFn: () => api.get<Attendance[]>("/api/v1/attendance/student"),
    enabled: !!user,
  });

  const myChildren = studentsQuery.data ?? [];

  // Auto-select first child if none selected
  useEffect(() => {
    if (!selectedChildId && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].user_id);
    }
  }, [myChildren, selectedChildId]);

  const selectedChild = useMemo(
    () => myChildren.find((child) => child.user_id === selectedChildId),
    [myChildren, selectedChildId]
  );

  const childAttendanceRecords = useMemo(() => {
    if (!selectedChildId || !attendanceQuery.data) return [];
    
    const records: Array<{
      id: string;
      subject: string;
      date: string;
      session_name?: string;
      status: string;
    }> = [];

    attendanceQuery.data.forEach((attendance) => {
      const record = attendance.records.find((r) => r.student_id === selectedChildId || r.student_id?.toString() === selectedChildId?.toString());
      if (record) {
        records.push({
          id: attendance.id,
          subject: attendance.subject,
          date: attendance.date,
          session_name: attendance.session_name || undefined,
          status: record.status,
        });
      }
    });

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedChildId, attendanceQuery.data]);

  const stats = useMemo(() => {
    const present = childAttendanceRecords.filter((r) => r.status === "present").length;
    const absent = childAttendanceRecords.filter((r) => r.status === "absent").length;
    const late = childAttendanceRecords.filter((r) => r.status === "late").length;
    const total = childAttendanceRecords.length;
    const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;

    return { present, absent, late, total, percentage: percentage.toFixed(1) };
  }, [childAttendanceRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "absent":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      case "late":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Child Attendance">
        <div className="space-y-6">
          {myChildren.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Child</CardTitle>
                <CardDescription>View attendance records for your child</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="child-select">Child</Label>
                  <select
                    id="child-select"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {myChildren.map((child) => (
                      <option key={child.user_id} value={child.user_id}>
                        {child.name} - Roll No: {child.roll_no}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedChild && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Recorded</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Present</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                    <p className="text-xs text-muted-foreground">Sessions attended</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                    <p className="text-xs text-muted-foreground">Sessions missed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Attendance %</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.percentage}%</p>
                    <p className="text-xs text-muted-foreground">Overall percentage</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Attendance History
                  </CardTitle>
                  <CardDescription>
                    Attendance records for {selectedChild.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attendanceQuery.isLoading && (
                    <p className="text-sm text-muted-foreground">Loading attendance...</p>
                  )}
                  {!attendanceQuery.isLoading && childAttendanceRecords.length === 0 && (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        No attendance records yet for {selectedChild.name}.
                      </p>
                    </div>
                  )}
                  {childAttendanceRecords.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border text-left text-sm">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 font-medium">Date</th>
                            <th className="px-3 py-2 font-medium">Subject</th>
                            <th className="px-3 py-2 font-medium">Session</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {childAttendanceRecords.map((record) => (
                            <tr key={record.id}>
                              <td className="px-3 py-3">{formatDate(record.date)}</td>
                              <td className="px-3 py-3 font-medium">{record.subject}</td>
                              <td className="px-3 py-3 text-muted-foreground">
                                {record.session_name || "—"}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(record.status)}`}
                                >
                                  {getStatusIcon(record.status)}
                                  {record.status}
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
            </>
          )}

          {myChildren.length === 0 && !studentsQuery.isLoading && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No children linked to your account.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please contact your college administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
