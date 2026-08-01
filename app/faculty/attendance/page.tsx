"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { PlusCircle, RefreshCcw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Attendance, Faculty, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";
import { FormSelect, FormDatePicker, FormField, SubmitButton } from "@/components/shared/forms";
import { BookOpen, Layers } from "lucide-react";

export default function FacultyAttendancePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const preSelectedSubject = searchParams.get("subject");
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionName, setSessionName] = useState("");
  const [subject, setSubject] = useState(preSelectedSubject || "");
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
    // Reset form when starting new session
    setDate(new Date().toISOString().slice(0, 10));
    setSessionName("");
    setMessage(null);
    // Reset all students to absent
    if (studentsQuery.data) {
      const nextStatus: Record<string, string> = {};
      studentsQuery.data.forEach((student) => {
        nextStatus[student.user_id] = "absent";
      });
      setStatusByStudent(nextStatus);
    }
    if (profileQuery.data?.subjects?.length) {
      setSubject((prev) => prev || (profileQuery.data?.subjects[0] ?? ""));
    }
  }, [selectedAttendance, profileQuery.data, studentsQuery.data]);

  useEffect(() => {
    if (!studentsQuery.data || Object.keys(statusByStudent).length > 0) return;
    const nextStatus: Record<string, string> = {};
    studentsQuery.data.forEach((student) => {
      nextStatus[student.user_id] = "absent";
    });
    setStatusByStudent(nextStatus);
  // Initialise all students as absent — run only when students data changes.
  // statusByStudent is intentionally excluded: including it would cause an
  // infinite loop (setState inside effect depending on state it sets).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsQuery.data]);

  const studentRows = useMemo(() => {
    return (
      studentsQuery.data?.map((student) => ({
        ...student,
        status: statusByStudent[student.user_id] ?? "absent",
      })) ?? []
    );
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
    () =>
      attendanceQuery.data
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ?? [],
    [attendanceQuery.data]
  );

  const subjectOptions = profileQuery.data?.subjects ?? [];

  const presentCount = Object.values(statusByStudent).filter((s) => s === "present").length;
  const absentCount = Object.values(statusByStudent).filter((s) => s === "absent").length;
  const lateCount = Object.values(statusByStudent).filter((s) => s === "late").length;

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Attendance">
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Mark Attendance Card */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Mark Today&apos;s Attendance</CardTitle>
                <CardDescription>Select subject, date & session, then mark each student</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Controls */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormSelect
                    id="subject"
                    label="Subject"
                    value={subject}
                    onChange={(val) => setSubject(val)}
                    placeholder="Select subject"
                    options={subjectOptions.map((s) => ({ value: s, label: s }))}
                    icon={BookOpen}
                  />

                  <FormDatePicker
                    id="date"
                    label="Attendance Date"
                    value={date}
                    onChange={(val) => setDate(val)}
                  />

                  <FormField
                    id="session"
                    label="Session Name"
                    value={sessionName}
                    onChange={(val) => setSessionName(val)}
                    placeholder="Morning lecture, Lab…"
                    icon={Layers}
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Present", count: presentCount, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2 },
                    { label: "Absent", count: absentCount, color: "text-rose-600 bg-rose-500/10 border-rose-500/30", icon: XCircle },
                    { label: "Late", count: lateCount, color: "text-amber-600 bg-amber-500/10 border-amber-500/30", icon: Clock },
                  ].map(({ label, count, color, icon: Icon }) => (
                    <div key={label} className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold ${color}`}>
                      <Icon className="h-4 w-4" />
                      <span>{count} {label}</span>
                    </div>
                  ))}
                </div>

                {/* Attendance Table */}
                <div className="overflow-hidden rounded-2xl border border-border/60">
                  <div className="overflow-x-auto max-h-[420px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/60">
                        <tr className="text-muted-foreground uppercase tracking-wider font-bold">
                          <th className="px-4 py-3 text-left">Student</th>
                          <th className="px-4 py-3 text-left">Roll No</th>
                          <th className="px-4 py-3 text-left">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {studentsQuery.isLoading &&
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td className="px-4 py-3"><div className="h-4 w-32 bg-muted/60 rounded-lg" /></td>
                              <td className="px-4 py-3"><div className="h-4 w-20 bg-muted/60 rounded-lg" /></td>
                              <td className="px-4 py-3"><div className="h-7 w-48 bg-muted/60 rounded-lg" /></td>
                            </tr>
                          ))}
                        {!studentsQuery.isLoading && studentRows.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No assigned students available.</td>
                          </tr>
                        )}
                        {studentRows.map((student) => {
                          const status = statusByStudent[student.user_id] ?? "absent";
                          return (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-semibold text-foreground">{student.name}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{student.roll_no}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  {[
                                    { value: "present", label: "Present", active: "bg-emerald-500 text-white", inactive: "border border-border/80 text-muted-foreground hover:border-emerald-500 hover:text-emerald-600" },
                                    { value: "absent", label: "Absent", active: "bg-rose-500 text-white", inactive: "border border-border/80 text-muted-foreground hover:border-rose-500 hover:text-rose-600" },
                                    { value: "late", label: "Late", active: "bg-amber-500 text-white", inactive: "border border-border/80 text-muted-foreground hover:border-amber-500 hover:text-amber-600" },
                                  ].map((opt) => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${status === opt.value ? opt.active : opt.inactive}`}
                                      onClick={() => handleStatusChange(student.user_id, opt.value)}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Save Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                  {message && (
                    <p className={`text-xs font-semibold ${message.includes("success") ? "text-emerald-500" : "text-rose-500"}`}>
                      {message}
                    </p>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" onClick={() => attendanceQuery.refetch()} className="rounded-2xl">
                      <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Refresh
                    </Button>
                    <SubmitButton
                      onClick={handleSave}
                      isLoading={attendanceMutation.status === "pending"}
                      loadingText="Saving..."
                      successText="Saved!"
                      size="sm"
                    >
                      Save Attendance
                    </SubmitButton>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance History */}
            <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Attendance History</CardTitle>
                  <CardDescription className="text-xs">Recent sessions you created</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAttendanceId(null)}
                  className="rounded-2xl text-xs"
                >
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> New Session
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[580px] overflow-y-auto">
                {attendanceQuery.isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-16 rounded-2xl bg-muted/40" />
                  ))}
                {!attendanceQuery.isLoading && sessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No attendance records yet.</p>
                )}
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedAttendanceId(session.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all text-xs ${
                      selectedAttendanceId === session.id
                        ? "border-indigo-500/60 bg-indigo-500/10"
                        : "border-border/60 bg-background/50 hover:border-indigo-500/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-foreground">{session.subject}</p>
                      <span className="text-muted-foreground shrink-0">{formatDate(session.created_at)}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{session.session_name || "Session"} • {session.records.length} students</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
