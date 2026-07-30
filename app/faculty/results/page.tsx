"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, UserCheck } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Faculty, Result, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function FacultyResultsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    exam_name: "",
    subject: "",
    internal_marks: "",
    practical_marks: "",
  });
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const resultsQuery = useQuery<Result[]>({
    queryKey: ["results", selectedStudentId],
    queryFn: () => api.get<Result[]>(`/api/v1/results/student/${selectedStudentId}`),
    enabled: !!selectedStudentId,
  });

  const resultMutation = useMutation({
    mutationFn: async (payload: unknown) => api.post<Result>("/api/v1/results", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results", selectedStudentId] });
      setSelectedResultId(null);
      setFormState({ exam_name: "", subject: "", internal_marks: "", practical_marks: "" });
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save result.");
    },
  });

  useEffect(() => {
    if (!formState.subject && profileQuery.data?.subjects?.length) {
      setFormState((prev) => ({ ...prev, subject: prev.subject || (profileQuery.data?.subjects[0] ?? "") }));
    }
  }, [profileQuery.data, formState.subject]);

  useEffect(() => {
    if (selectedResultId && resultsQuery.data) {
      const selected = resultsQuery.data.find((result) => result.id === selectedResultId);
      if (selected) {
        setFormState({
          exam_name: selected.exam_name ?? "",
          subject: selected.subject,
          internal_marks: selected.internal_marks?.toString() ?? "",
          practical_marks: selected.practical_marks?.toString() ?? "",
        });
      }
    }
  }, [selectedResultId, resultsQuery.data]);

  const studentList = useMemo(
    () =>
      studentsQuery.data?.filter((student) => {
        if (!search.trim()) return true;
        const lower = search.toLowerCase();
        return (
          student.name.toLowerCase().includes(lower) ||
          student.roll_no.toLowerCase().includes(lower) ||
          student.department.toLowerCase().includes(lower) ||
          (student.course ?? "").toLowerCase().includes(lower)
        );
      }) ?? [],
    [search, studentsQuery.data]
  );

  const resultList = resultsQuery.data ?? [];

  const subjects = profileQuery.data?.subjects ?? [];

  const selectedStudent = studentsQuery.data?.find((student) => student.user_id === selectedStudentId) ?? null;

  const handleSave = () => {
    if (!selectedStudentId) {
      setErrorMessage("Select a student before saving a result.");
      return;
    }
    if (!formState.subject.trim()) {
      setErrorMessage("Subject is required.");
      return;
    }

    resultMutation.mutate({
      student_id: selectedStudentId,
      subject: formState.subject,
      exam_name: formState.exam_name || null,
      internal_marks: Number(formState.internal_marks) || 0,
      practical_marks: Number(formState.practical_marks) || 0,
    });
  };

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Results">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Enter Marks</CardTitle>
              <CardDescription>Manage student performance record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <select
                    id="student"
                    value={selectedStudentId ?? ""}
                    onChange={(event) => setSelectedStudentId(event.target.value || null)}
                    className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select student</option>
                    {studentsQuery.data?.map((student) => (
                      <option key={student.user_id} value={student.user_id}>
                        {student.name} • {student.roll_no}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={formState.subject}
                    onChange={(event) => setFormState((prev) => ({ ...prev, subject: event.target.value }))}
                    className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subjectOption) => (
                      <option key={subjectOption} value={subjectOption}>
                        {subjectOption}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor="exam_name">Exam / Assessment</Label>
                  <Input
                    id="exam_name"
                    value={formState.exam_name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, exam_name: event.target.value }))}
                    placeholder="Midterm, Semester exam, Practical, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="internal_marks">Internal Marks</Label>
                  <Input
                    id="internal_marks"
                    type="number"
                    min="0"
                    value={formState.internal_marks}
                    onChange={(event) => setFormState((prev) => ({ ...prev, internal_marks: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="practical_marks">Practical Marks</Label>
                  <Input
                    id="practical_marks"
                    type="number"
                    min="0"
                    value={formState.practical_marks}
                    onChange={(event) => setFormState((prev) => ({ ...prev, practical_marks: event.target.value }))}
                  />
                </div>
              </div>
              {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
              <div className="mt-4 flex gap-3">
                <Button variant="tenant" onClick={handleSave} disabled={resultMutation.status === "pending"}>
                  {resultMutation.status === "pending" ? "Saving..." : selectedResultId ? "Update Result" : "Save Result"}
                </Button>
              </div>
              {selectedStudent ? (
                <div className="mt-6 rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Selected Student</p>
                  <p className="mt-1 text-lg font-semibold">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">Roll No: {selectedStudent.roll_no}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>Search and review marks</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search">Search students</Label>
                <Input
                  id="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, roll number or department"
                />
              </div>
              {studentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading students...</p>}
              {!studentsQuery.isLoading && studentList.length === 0 && <p className="text-sm text-muted-foreground">No students found.</p>}
              <div className="space-y-3">
                {studentList.map((student) => (
                  <button
                    key={student.user_id}
                    type="button"
                    className={`w-full rounded-xl border p-4 text-left transition ${selectedStudentId === student.user_id ? "border-tenant bg-tenant/5" : "border-border bg-background hover:border-tenant"}`}
                    onClick={() => {
                      setSelectedStudentId(student.user_id);
                      setSelectedResultId(null);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.roll_no} • {student.course || student.department}</p>
                      </div>
                      <UserCheck className="h-5 w-5 text-tenant" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedStudentId ? (
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Results for the selected student</CardDescription>
              </CardHeader>
              <CardContent>
                {resultsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading results...</p>}
                {!resultsQuery.isLoading && resultList.length === 0 && <p className="text-sm text-muted-foreground">No results found for this student.</p>}
                <div className="space-y-3">
                  {resultList.map((result) => (
                    <div key={result.id} className="rounded-xl border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold">{result.subject}</p>
                          <p className="text-sm text-muted-foreground">{result.exam_name || "Assessment"}</p>
                          <p className="mt-2 text-sm text-muted-foreground">Grade: {result.grade || "Pending"}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Internal: {result.internal_marks ?? "—"}</p>
                          <p>Practical: {result.practical_marks ?? "—"}</p>
                          <p>Total: {result.total_marks ?? "—"}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setSelectedResultId(result.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
