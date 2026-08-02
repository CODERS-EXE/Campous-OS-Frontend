"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, FileText, Upload } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Assignment, Submission } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function StudentAssignmentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const assignmentsQuery = useQuery<Assignment[]>({
    queryKey: ["assignments", "student"],
    queryFn: () => api.get<Assignment[]>("/api/v1/assignments?limit=100"),
    enabled: !!user,
  });

  const submissionsQuery = useQuery<Submission[]>({
    queryKey: ["submissions", "my"],
    queryFn: () => api.get<Submission[]>("/api/v1/assignments/my-submissions"),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { assignment_id: string; files: string[] }) =>
      api.post<Submission>("/api/v1/assignments/submit", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", "my"] });
      setSelectedAssignment(null);
      setFiles([]);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit assignment");
    },
  });

  const publishedAssignments = useMemo(
    () => assignmentsQuery.data?.filter((a) => a.published) ?? [],
    [assignmentsQuery.data]
  );

  const pendingAssignments = useMemo(() => {
    const submitted = new Set(submissionsQuery.data?.map((s) => s.assignment_id) ?? []);
    return publishedAssignments.filter((a) => !submitted.has(a.id));
  }, [publishedAssignments, submissionsQuery.data]);

  const completedAssignments = useMemo(() => {
    const submitted = new Set(submissionsQuery.data?.map((s) => s.assignment_id) ?? []);
    return publishedAssignments.filter((a) => submitted.has(a.id));
  }, [publishedAssignments, submissionsQuery.data]);

  const handleSubmit = () => {
    if (!selectedAssignment) return;
    if (files.length === 0) {
      setErrorMessage("Please add at least one file URL");
      return;
    }
    submitMutation.mutate({ assignment_id: selectedAssignment.id, files });
  };

  const getSubmission = (assignmentId: string) =>
    submissionsQuery.data?.find((s) => s.assignment_id === assignmentId);

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Assignments">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{publishedAssignments.length}</p>
                <p className="text-xs text-muted-foreground">All published</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{pendingAssignments.length}</p>
                <p className="text-xs text-muted-foreground">Not submitted yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{completedAssignments.length}</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </CardContent>
            </Card>
          </div>

          {selectedAssignment && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Assignment</CardTitle>
                <CardDescription>{selectedAssignment.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedAssignment.description}</p>
                    {selectedAssignment.due_date && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Due: {formatDate(selectedAssignment.due_date)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="file-url">File URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="file-url"
                        placeholder="Enter file URL (Google Drive, OneDrive, etc.)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            setFiles([...files, e.currentTarget.value.trim()]);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input = document.getElementById("file-url") as HTMLInputElement;
                          if (input?.value.trim()) {
                            setFiles([...files, input.value.trim()]);
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Files:</Label>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-xl border p-3">
                          <span className="text-sm truncate">{file}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                  <div className="flex gap-2">
                    <Button
                      variant="tenant"
                      onClick={handleSubmit}
                      disabled={submitMutation.status === "pending"}
                    >
                      {submitMutation.status === "pending" ? "Submitting..." : "Submit Assignment"}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Assignments awaiting submission</CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!assignmentsQuery.isLoading && pendingAssignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending assignments.</p>
              )}
              <div className="space-y-3">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <p className="font-semibold">{assignment.title}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{assignment.subject || "General"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{assignment.description || "No description"}</p>
                        {assignment.due_date && (
                          <p className="mt-2 text-sm text-orange-600">Due {formatDate(assignment.due_date)}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssignment(assignment)}
                        disabled={!!selectedAssignment}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Submit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Assignments</CardTitle>
              <CardDescription>Assignments you have submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {submissionsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!submissionsQuery.isLoading && completedAssignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No completed assignments yet.</p>
              )}
              <div className="space-y-3">
                {completedAssignments.map((assignment) => {
                  const submission = getSubmission(assignment.id);
                  return (
                    <div key={assignment.id} className="rounded-xl border p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="font-semibold">{assignment.title}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{assignment.subject || "General"}</p>
                          {submission && (
                            <>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Submitted on {formatDate(submission.submitted_at)}
                              </p>
                              {submission.marks_awarded !== null && submission.marks_awarded !== undefined && (
                                <p className="mt-1 text-sm font-medium text-green-600">
                                  Marks: {submission.marks_awarded}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        {submission && submission.files.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <FileText className="inline h-4 w-4" /> {submission.files.length} file(s)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
