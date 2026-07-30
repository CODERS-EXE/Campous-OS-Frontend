"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Attendance, Faculty, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function FacultyAttendancePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionName, setSessionName] = useState("");
  const [subject, setSubject] = useState("");
  const [statusByStudent, setStatusByStudent] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const profileQuery = useQuery<Faculty>({
    queryKey: ["faculty-profile"],
    queryFn: () => api.get<Faculty>("/api/v1/users/me/profile"),
    enabled: !!user,
  });

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
    enabled: !!user,
  });

  const attendanceQuery = useQuery<Attendance[]>({
    queryKey: ["attendance", "mine"],
    queryFn: () => api.get<Attendance[]>("/api/v1/attendance/mine"),
    enabled: !!user,
  });

  const attendanceMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      if (selectedAttendanceId) {
        return api.patch<Attendance>(`/api/v1/attendance/${selectedAttendanceId}`, payload);
      }
      return api.post<Attendance>("/api/v1/attendance", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "mine"] });
      setMessage("Attendance saved successfully.");
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Unable to save attendance.");
    },
  });

  const selectedAttendance = useMemo(
    () => attendanceQuery.data?.find((item) => item.id === selectedAttendanceId) ?? null,
    [attendanceQuery.data, selectedAttendanceId]
  );

  useEffect(() => {
    if (selectedAttendance) {
      setSubject(selectedAttendance.subject);
      setDate(selectedAttendance.date.slice(0, 10));
      setSessionName(selectedAttendance.session_name ?? "");
      const nextStatus: Record<string, string> = {};
      selectedAttendance.records.forEach((record) => {
        nextStatus[record.student_id] = record.status;
      });
      setStatusByStudent(nextStatus);
      return;
    }
    if (profileQuery.data?.subjects?.length) {
      setSubject((prev) => prev || (profileQuery.data?.subjects[0] ?? ""));
    }
  }, [selectedAttendance, profileQuery.data]);

  useEffect(() => {
    if (!studentsQuery.data || Object.keys(statusByStudent).length > 0) return;
    const nextStatus: Record<string, string> = {};
    studentsQuery.data.forEach((student) => {
      nextStatus[student.user_id] = "absent";
    });
    setStatusByStudent(nextStatus);
  }, [studentsQuery.data, statusByStudent]);

  const studentRows = useMemo(() => {
    return studentsQuery.data?.map((student) => ({
      ...student,
      status: statusByStudent[student.user_id] ?? "absent",
    })) ?? [];
  }, [studentsQuery.data, statusByStudent]);

  const handleStatusChange = (studentId: string, status: string) => {
    setStatusByStudent((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!subject) {
      setMessage("Please select a subject before saving attendance.");
      return;
    }
    if (!studentsQuery.data?.length) {
      setMessage("No assigned students available for attendance.");
      return;
    }

    const payload = {
      subject,
      date,
      session_name: sessionName || null,
      records: studentsQuery.data.map((student) => ({
        student_id: student.user_id,
        status: statusByStudent[student.user_id] || "absent",
      })),
    };
    attendanceMutation.mutate(payload);
  };

  const sessions = useMemo(
    () => attendanceQuery.data?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ?? [],
    [attendanceQuery.data]
  );

  const subjectOptions = profileQuery.data?.subjects ?? [];

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Attendance">
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Mark Today&apos;s Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((subjectOption) => (
                        <option key={subjectOption} value={subjectOption}>
                          {subjectOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                  </div>
                  <div className="lg:col-span-2">
                    <Label htmlFor="session">Session Name</Label>
                    <Input id="session" value={sessionName} onChange={(event) => setSessionName(event.target.value)} placeholder="Morning lecture, Lab, etc." />
                  </div>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2">Student</th>
                        <th className="px-3 py-2">Roll No</th>
                        <th className="px-3 py-2">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {studentsQuery.isLoading && (
                        <tr>
                          <td colSpan={3} className="p-4 text-sm text-muted-foreground">
                            Loading students...
                          </td>
                        </tr>
                      )}
                      {!studentsQuery.isLoading && studentRows.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-sm text-muted-foreground">
                            No assigned students available.
                          </td>
                        </tr>
                      )}
                      {studentRows.map((student) => (
                        <tr key={student.id}>
                          <td className="px-3 py-3 font-medium">{student.name}</td>
                          <td className="px-3 py-3 text-muted-foreground">{student.roll_no}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: "present", label: "Present" },
                                { value: "absent", label: "Absent" },
                                { value: "late", label: "Late" },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${statusByStudent[student.user_id] === option.value ? "bg-tenant text-white" : "border border-input bg-background text-muted-foreground"}`}
                                  onClick={() => handleStatusChange(student.user_id, option.value)}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {message ? <p className="text-sm text-destructive">{message}</p> : null}
                  <div className="flex items-center gap-2">
                    <Button variant="tenant" onClick={handleSave} disabled={attendanceMutation.status === "pending"}>
                        {attendanceMutation.status === "pending" ? "Saving..." : "Save Attendance"}
                    </Button>
                    <Button variant="outline" onClick={() => attendanceQuery.refetch()}>
                      <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Recent sessions you created</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedAttendanceId(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Session
                </Button>
              </CardHeader>
              <CardContent>
                {attendanceQuery.isLoading && <p className="text-sm text-muted-foreground">Loading attendance history...</p>}
                {!attendanceQuery.isLoading && sessions.length === 0 && <p className="text-sm text-muted-foreground">No attendance records yet.</p>}
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      className={`w-full rounded-xl border p-4 text-left transition ${selectedAttendanceId === session.id ? "border-tenant bg-tenant/5" : "border-border bg-background hover:border-tenant"}`}
                      onClick={() => setSelectedAttendanceId(session.id)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{session.subject}</p>
                          <p className="text-sm text-muted-foreground">{session.session_name || "Session"}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDate(session.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{session.records.length} students</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
