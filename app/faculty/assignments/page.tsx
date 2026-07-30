"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, PlusCircle } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Assignment, Faculty } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

export default function FacultyAssignmentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    subject: "",
    due_date: "",
    published: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileQuery = useQuery<Faculty>({
    queryKey: ["faculty-profile"],
    queryFn: () => api.get<Faculty>("/api/v1/users/me/profile"),
    enabled: !!user,
  });

  const assignmentsQuery = useQuery<Assignment[]>({
    queryKey: ["assignments"],
    queryFn: () => api.get<Assignment[]>("/api/v1/assignments?limit=50"),
    enabled: !!user,
  });

  const assignmentMutation = useMutation({
    mutationFn: async (payload: unknown) => {
      if (selectedAssignmentId) {
        return api.patch<Assignment>(`/api/v1/assignments/${selectedAssignmentId}`, payload);
      }
      return api.post<Assignment>("/api/v1/assignments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setSelectedAssignmentId(null);
      setFormState({ title: "", description: "", subject: "", due_date: "", published: false });
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save assignment.");
    },
  });

  useEffect(() => {
    if (selectedAssignmentId && assignmentsQuery.data) {
      const selected = assignmentsQuery.data.find((item) => item.id === selectedAssignmentId);
      if (selected) {
        setFormState({
          title: selected.title,
          description: selected.description ?? "",
          subject: selected.subject ?? "",
          due_date: selected.due_date ? selected.due_date.slice(0, 16) : "",
          published: selected.published,
        });
      }
    }
  }, [selectedAssignmentId, assignmentsQuery.data]);

  useEffect(() => {
    if (!formState.subject && profileQuery.data?.subjects?.length) {
      setFormState((prev) => ({ ...prev, subject: prev.subject || (profileQuery.data?.subjects[0] ?? "") }));
    }
  }, [profileQuery.data, formState.subject]);

  const subjects = profileQuery.data?.subjects ?? [];

  const assignmentList = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data]);

  const handleSave = () => {
    if (!formState.title.trim()) {
      setErrorMessage("Assignment title is required.");
      return;
    }
    if (!formState.subject.trim()) {
      setErrorMessage("Please select a valid subject.");
      return;
    }
    assignmentMutation.mutate({
      title: formState.title,
      description: formState.description,
      subject: formState.subject,
      due_date: formState.due_date || null,
      attachments: [],
      published: formState.published,
    });
  };

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Assignments">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{selectedAssignmentId ? "Edit Assignment" : "Create Assignment"}</CardTitle>
                <CardDescription>Manage assignments for your classes</CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedAssignmentId(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Assignment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formState.title} onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))} />
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
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-2 min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input id="due_date" type="datetime-local" value={formState.due_date} onChange={(event) => setFormState((prev) => ({ ...prev, due_date: event.target.value }))} />
                </div>
                <div className="flex items-end gap-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formState.published}
                      onChange={(event) => setFormState((prev) => ({ ...prev, published: event.target.checked }))}
                      className="h-4 w-4 rounded border-input text-tenant focus:ring-tenant"
                    />
                    Publish now
                  </label>
                </div>
              </div>
              {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="tenant" onClick={handleSave} disabled={assignmentMutation.status === "pending"}>
                  {assignmentMutation.status === "pending" ? "Saving..." : selectedAssignmentId ? "Update Assignment" : "Create Assignment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>My Assignments</CardTitle>
                <CardDescription>Assignments created for your subjects</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {assignmentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
              {!assignmentsQuery.isLoading && assignmentList.length === 0 && <p className="text-sm text-muted-foreground">No assignments created yet.</p>}
              <div className="space-y-3">
                {assignmentList.map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground">{assignment.subject || "General"}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{assignment.description || "No description."}</p>
                      </div>
                      <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground sm:items-end">
                        {assignment.due_date && <span>Due {formatDate(assignment.due_date)}</span>}
                        <span>{assignment.published ? "Published" : "Draft"}</span>
                        <Button variant="outline" size="sm" onClick={() => setSelectedAssignmentId(assignment.id)}>
                          <Pen className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
