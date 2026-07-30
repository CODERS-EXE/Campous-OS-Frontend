"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Attendance } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function StudentAttendancePage() {
  const { user } = useAuthStore();

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "all"],
    queryFn: () => api.get<Attendance[]>("/api/v1/attendance/mine"),
    enabled: !!user,
  });

  const myAttendanceRecords = useMemo(() => {
    const records: Array<{
      id: string;
      subject: string;
      date: string;
      session_name?: string;
      status: string;
      marked_by?: string;
    }> = [];

    attendanceQuery.data?.forEach((attendance) => {
      const myRecord = attendance.records.find((r) => r.student_id === user?.id);
      if (myRecord) {
        records.push({
          id: attendance.id,
          subject: attendance.subject,
          date: attendance.date,
          session_name: attendance.session_name || undefined,
          status: myRecord.status,
          marked_by: myRecord.marked_by || undefined,
        });
      }
    });

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceQuery.data, user?.id]);

  const stats = useMemo(() => {
    const present = myAttendanceRecords.filter((r) => r.status === "present").length;
    const absent = myAttendanceRecords.filter((r) => r.status === "absent").length;
    const late = myAttendanceRecords.filter((r) => r.status === "late").length;
    const total = myAttendanceRecords.length;
    const percentage = total > 0 ? ((present + late * 0.5) / total) * 100 : 0;

    return { present, absent, late, total, percentage: percentage.toFixed(1) };
  }, [myAttendanceRecords]);

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

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Attendance">
        <div className="space-y-6">
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
              <CardDescription>Your attendance records across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading attendance...</p>
              )}
              {!attendanceQuery.isLoading && myAttendanceRecords.length === 0 && (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No attendance records yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your faculty will mark attendance for classes.
                  </p>
                </div>
              )}
              {myAttendanceRecords.length > 0 && (
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
                      {myAttendanceRecords.map((record) => (
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
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
