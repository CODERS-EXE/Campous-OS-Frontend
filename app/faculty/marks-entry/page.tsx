"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, StudentExam, SubjectExam } from "@/lib/api";
import { Save, BookOpen, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function MarksEntryPage() {
  const queryClient = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [marksState, setMarksState] = useState<Record<string, { internal?: number; external?: number; remarks?: string }>>({});

  const { data: assignedExams = [], isLoading: isLoadingExams } = useQuery<SubjectExam[]>({
    queryKey: ["assigned-exams"],
    queryFn: () => api.getAssignedExams(),
  });

  const { data: students = [], isLoading: isLoadingStudents } = useQuery<StudentExam[]>({
    queryKey: ["subject-students", selectedExamId],
    queryFn: () => api.getSubjectExamStudents(selectedExamId),
    enabled: !!selectedExamId,
  });

  const singleSaveMutation = useMutation({
    mutationFn: (data: { studentExamId: string; internal_marks?: number; external_marks?: number; remarks?: string }) =>
      api.enterStudentMarks(data.studentExamId, {
        internal_marks: data.internal_marks,
        external_marks: data.external_marks,
        remarks: data.remarks,
      }),
    onSuccess: () => {
      toast.success("Marks saved successfully");
      queryClient.invalidateQueries({ queryKey: ["subject-students", selectedExamId] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save marks"),
  });

  const bulkSaveMutation = useMutation({
    mutationFn: () => {
      const payload = Object.entries(marksState).map(([studentExamId, val]) => ({
        student_exam_id: studentExamId,
        internal_marks: val.internal,
        external_marks: val.external,
      }));
      return api.bulkUploadMarks(selectedExamId, payload);
    },
    onSuccess: () => {
      toast.success("All marks saved successfully");
      queryClient.invalidateQueries({ queryKey: ["subject-students", selectedExamId] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to bulk save marks"),
  });

  const handleMarkChange = (studentExamId: string, field: "internal" | "external", value: string, defaultInternal?: number, defaultExternal?: number) => {
    const num = value === "" ? undefined : Number(value);
    setMarksState((prev) => ({
      ...prev,
      [studentExamId]: {
        internal: defaultInternal,
        external: defaultExternal,
        ...prev[studentExamId],
        [field]: num,
      },
    }));
  };

  const handleSaveSingle = (student: StudentExam) => {
    const changes = marksState[student.id] || {};
    singleSaveMutation.mutate({
      studentExamId: student.id,
      internal_marks: changes.internal !== undefined ? changes.internal : student.internal_marks,
      external_marks: changes.external !== undefined ? changes.external : student.external_marks,
    });
  };

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Marks Entry">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Marks Entry</h1>
              <p className="text-muted-foreground mt-1">
                Enter internal and external examination marks for enrolled students
              </p>
            </div>
            {selectedExamId && (
              <Button onClick={() => bulkSaveMutation.mutate()} disabled={bulkSaveMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {bulkSaveMutation.isPending ? "Saving All..." : "Save All Marks"}
              </Button>
            )}
          </div>

          {/* Exam / Subject Selector */}
          <Card className="p-6">
            <label className="block text-sm font-medium mb-2">Select Assigned Subject / Exam</label>
            {isLoadingExams ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- Choose an assigned subject exam --</option>
                {assignedExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.subject_name} ({exam.subject_code}) - {exam.exam_date} ({exam.start_time} - {exam.end_time})
                  </option>
                ))}
              </select>
            )}
          </Card>

          {!selectedExamId ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                Please select an assigned exam from the dropdown above to view and enter marks.
              </p>
            </Card>
          ) : isLoadingStudents ? (
            <Card className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </Card>
          ) : students.length > 0 ? (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Student Roster & Marks</h2>
                  <p className="text-sm text-muted-foreground">{students.length} students enrolled</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium">Roll No.</th>
                      <th className="pb-3 font-medium">Student Name</th>
                      <th className="pb-3 font-medium">Attendance</th>
                      <th className="pb-3 font-medium w-28">Internal</th>
                      <th className="pb-3 font-medium w-28">External</th>
                      <th className="pb-3 font-medium w-20">Total</th>
                      <th className="pb-3 font-medium w-20">Grade</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const curInternal = marksState[student.id]?.internal ?? student.internal_marks ?? "";
                      const curExternal = marksState[student.id]?.external ?? student.external_marks ?? "";
                      return (
                        <tr key={student.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 font-mono font-medium">{student.student_roll_number}</td>
                          <td className="py-3 font-medium">{student.student_name}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                student.attendance === "present"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : student.attendance === "absent"
                                  ? "bg-rose-500/10 text-rose-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {student.attendance}
                            </span>
                          </td>
                          <td className="py-3">
                            <Input
                              type="number"
                              className="w-24"
                              placeholder="0"
                              value={curInternal}
                              onChange={(e) => handleMarkChange(student.id, "internal", e.target.value, student.internal_marks, student.external_marks)}
                              disabled={student.attendance !== "present"}
                            />
                          </td>
                          <td className="py-3">
                            <Input
                              type="number"
                              className="w-24"
                              placeholder="0"
                              value={curExternal}
                              onChange={(e) => handleMarkChange(student.id, "external", e.target.value, student.internal_marks, student.external_marks)}
                              disabled={student.attendance !== "present"}
                            />
                          </td>
                          <td className="py-3 font-semibold">
                            {student.total_marks !== undefined && student.total_marks !== null ? student.total_marks.toFixed(1) : "-"}
                          </td>
                          <td className="py-3 font-bold">{student.grade || "-"}</td>
                          <td className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveSingle(student)}
                              disabled={singleSaveMutation.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No students enrolled in this exam.</p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
