"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Search, Users, XCircle } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Attendance, HostelStudent } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { FormDatePicker, FormSelect, FormField } from "@/components/shared/forms";
import { Home } from "lucide-react";

export default function WardenAttendancePage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostel, setSelectedHostel] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const studentsQuery = useQuery<HostelStudent[]>({
    queryKey: ["hostel-students", "all"],
    queryFn: () => api.get<HostelStudent[]>("/api/v1/hostel/students"),
    enabled: !!user,
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "all"],
    queryFn: () => api.get<Attendance[]>("/api/v1/attendance/mine"),
    enabled: !!user,
  });

  const hostels = useMemo(() => {
    const hostelSet = new Set<string>();
    studentsQuery.data?.forEach((s) => s.hostel && hostelSet.add(s.hostel));
    return Array.from(hostelSet).sort();
  }, [studentsQuery.data]);

  const filteredStudents = useMemo(() => {
    let result = studentsQuery.data || [];

    if (selectedHostel) {
      result = result.filter((s) => s.hostel === selectedHostel);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.roll_no.toLowerCase().includes(query) ||
          s.hostel.toLowerCase().includes(query)
      );
    }

    return result;
  }, [studentsQuery.data, selectedHostel, searchQuery]);

  const attendanceStats = useMemo(() => {
    const studentAttendance: Record<
      string,
      { present: number; absent: number; total: number }
    > = {};

    attendanceQuery.data?.forEach((attendance) => {
      const date = attendance.date.split("T")[0];
      if (date === selectedDate) {
        attendance.records.forEach((record) => {
          if (!studentAttendance[record.student_id]) {
            studentAttendance[record.student_id] = { present: 0, absent: 0, total: 0 };
          }
          studentAttendance[record.student_id].total += 1;
          if (record.status === "present") {
            studentAttendance[record.student_id].present += 1;
          } else if (record.status === "absent") {
            studentAttendance[record.student_id].absent += 1;
          }
        });
      }
    });

    return studentAttendance;
  }, [attendanceQuery.data, selectedDate]);

  const totalPresent = Object.values(attendanceStats).filter((s) => s.present > 0).length;
  const totalAbsent = Object.values(attendanceStats).filter(
    (s) => s.absent > 0 && s.present === 0
  ).length;

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Hostel Attendance">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{filteredStudents.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Present Today</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{totalPresent}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Absent Today</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{totalAbsent}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>View attendance for specific students and dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FormDatePicker
                  id="date"
                  label="Date"
                  value={selectedDate}
                  onChange={(val) => setSelectedDate(val)}
                />

                <FormSelect
                  id="hostel"
                  label="Hostel"
                  value={selectedHostel}
                  onChange={(val) => setSelectedHostel(val)}
                  placeholder="All Hostels"
                  options={hostels.map((h) => ({ value: h, label: h }))}
                  icon={Home}
                />

                <FormField
                  id="search"
                  label="Search Students"
                  value={searchQuery}
                  onChange={(val) => setSearchQuery(val)}
                  placeholder="Search students..."
                  icon={Search}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Attendance for {formatDate(selectedDate)}
              </CardTitle>
              <CardDescription>
                Showing attendance for {filteredStudents.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading students...</p>
              )}
              {!studentsQuery.isLoading && filteredStudents.length === 0 && (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">No students found.</p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-left text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Roll No</th>
                      <th className="px-3 py-2 font-medium">Hostel</th>
                      <th className="px-3 py-2 font-medium">Department</th>
                      <th className="px-3 py-2 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.map((student) => {
                      const stats = attendanceStats[student.user_id];
                      const status = stats
                        ? stats.present > 0
                          ? "present"
                          : "absent"
                        : "not_marked";

                      return (
                        <tr key={student.id}>
                          <td className="px-3 py-3 font-medium">{student.name}</td>
                          <td className="px-3 py-3">{student.roll_no}</td>
                          <td className="px-3 py-3">{student.hostel}</td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {student.department}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {status === "present" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Present
                              </span>
                            )}
                            {status === "absent" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                <XCircle className="h-3 w-3" />
                                Absent
                              </span>
                            )}
                            {status === "not_marked" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
