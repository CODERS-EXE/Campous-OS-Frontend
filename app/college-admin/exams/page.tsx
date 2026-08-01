"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Exam } from "@/lib/api";
import { Plus, X, Loader2, Calendar, FileText, Trash2, Eye, CalendarPlus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CollegeAdminExamsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState<Exam | null>(null);
  const [viewDetailsExam, setViewDetailsExam] = useState<Exam | null>(null);
  const [examSubjects, setExamSubjects] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [examType, setExamType] = useState("mid_term");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [semester, setSemester] = useState<number>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: () => api.getExams(),
  });

  const createExamMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      exam_type: string;
      academic_year: string;
      semester: number;
      start_date: string;
      end_date: string;
      description?: string;
    }) => api.createExam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam created successfully!");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create exam: ${error.message}`);
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.updateExam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam updated successfully!");
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingExamId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update exam: ${error.message}`);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: (examId: string) => api.deleteExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully!");
      setDeleteConfirmExam(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete exam: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setExamType("mid_term");
    setAcademicYear("2024-2025");
    setSemester(1);
    setStartDate("");
    setEndDate("");
    setDescription("");
    setIsEditMode(false);
    setEditingExamId(null);
  };

  const handleEditClick = (exam: Exam) => {
    setIsEditMode(true);
    setEditingExamId(exam.id);
    setName(exam.name);
    setExamType(exam.exam_type);
    setAcademicYear(exam.academic_year);
    setSemester(exam.semester);
    setStartDate(exam.start_date.split("T")[0]);
    setEndDate(exam.end_date.split("T")[0]);
    setDescription(exam.description || "");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (exam: Exam) => {
    setDeleteConfirmExam(exam);
  };

  const handleViewDetails = async (exam: Exam) => {
    setViewDetailsExam(exam);
    // Fetch subjects for this exam
    try {
      const subjects = await api.get(`/exams/${exam.id}/subjects`);
      setExamSubjects(subjects || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      setExamSubjects([]);
    }
  };

  const handleScheduleSubjects = (examId: string) => {
    // Redirect to exam-schedule page with pre-selected exam
    router.push(`/college-admin/exam-schedule?examId=${examId}`);
  };

  const confirmDelete = () => {
    if (deleteConfirmExam) {
      deleteExamMutation.mutate(deleteConfirmExam.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      name,
      exam_type: examType,
      academic_year: academicYear,
      semester: Number(semester),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      description,
    };

    if (isEditMode && editingExamId) {
      updateExamMutation.mutate({ id: editingExamId, payload });
    } else {
      createExamMutation.mutate(payload);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ongoing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Exam Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Exam Management</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage examinations
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))}
            </div>
          ) : exams && exams.length > 0 ? (
            <div className="grid gap-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{exam.name}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                            exam.status
                          )}`}
                        >
                          {exam.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {exam.exam_type.replace("_", " ").toUpperCase()}
                        </p>
                        <p>
                          <span className="font-medium">Academic Year:</span>{" "}
                          {exam.academic_year} | Semester {exam.semester}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {new Date(exam.start_date).toLocaleDateString()} -{" "}
                          {new Date(exam.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span>
                          <span className="font-medium">Subjects:</span>{" "}
                          {exam.total_subjects}
                        </span>
                        <span>
                          <span className="font-medium">Students:</span>{" "}
                          {exam.total_students}
                        </span>
                        <span>
                          <span className="font-medium">Results:</span>{" "}
                          {exam.results_published ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Published
                            </span>
                          ) : (
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                              Pending
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(exam)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(exam)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleScheduleSubjects(exam.id)}>
                        <CalendarPlus className="mr-1 h-4 w-4" />
                        Schedule Subjects
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(exam)}
                        disabled={exam.results_published}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No exams found</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Exam
              </Button>
            </Card>
          )}

          {/* ── Create/Edit Exam Modal ── */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">
                      {isEditMode ? "Edit Examination" : "Create New Examination"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                      Exam Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mid-Term Examination Fall 2024"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Exam Type *
                      </label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="internal">Internal</option>
                        <option value="mid_term">Mid-Term</option>
                        <option value="end_term">End-Term</option>
                        <option value="supplementary">Supplementary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Semester *
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Academic Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="e.g. 2024-2025"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                      Description & Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional notes or instructions..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createExamMutation.isPending || updateExamMutation.isPending}>
                      {createExamMutation.isPending || updateExamMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>{isEditMode ? "Update Exam" : "Create Exam"}</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Delete Confirmation Modal ── */}
          {deleteConfirmExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Delete Exam</h2>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{deleteConfirmExam.name}</span>?
                  </p>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <p className="text-muted-foreground">This will permanently delete:</p>
                    <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                      <li>All scheduled subjects for this exam</li>
                      <li>All student hall tickets and attendance</li>
                      <li>All marks and exam results</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmExam(null)}
                    disabled={deleteExamMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={deleteExamMutation.isPending}
                  >
                    {deleteExamMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Exam
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── View Details Modal ── */}
          {viewDetailsExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Exam Details</h2>
                  </div>
                  <button
                    onClick={() => {
                      setViewDetailsExam(null);
                      setExamSubjects([]);
                    }}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Exam Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Exam Name</p>
                      <p className="font-semibold">{viewDetailsExam.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(viewDetailsExam.status)}`}>
                        {viewDetailsExam.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Type</p>
                      <p className="font-medium">{viewDetailsExam.exam_type.replace("_", " ").toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Academic Year</p>
                      <p className="font-medium">{viewDetailsExam.academic_year}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Semester</p>
                      <p className="font-medium">Semester {viewDetailsExam.semester}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Duration</p>
                      <p className="font-medium text-sm">
                        {new Date(viewDetailsExam.start_date).toLocaleDateString()} - {new Date(viewDetailsExam.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{viewDetailsExam.total_subjects || 0}</p>
                      <p className="text-xs text-muted-foreground">Subjects Scheduled</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{viewDetailsExam.total_students || 0}</p>
                      <p className="text-xs text-muted-foreground">Students Enrolled</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {viewDetailsExam.results_published ? "✅" : "⏳"}
                      </p>
                      <p className="text-xs text-muted-foreground">Results Status</p>
                    </div>
                  </div>

                  {/* Scheduled Subjects */}
                  {examSubjects.length > 0 && (
                    <div className="pt-3 border-t">
                      <h3 className="font-semibold mb-3">Scheduled Subjects ({examSubjects.length})</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {examSubjects.map((subject: any, idx: number) => (
                          <div key={idx} className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{subject.subject_name}</p>
                                <p className="text-sm text-muted-foreground">{subject.subject_code}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p>{new Date(subject.exam_date).toLocaleDateString()}</p>
                                <p className="text-muted-foreground">{subject.start_time} - {subject.end_time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {examSubjects.length === 0 && (
                    <div className="pt-3 border-t text-center text-muted-foreground">
                      <p>No subjects scheduled yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setViewDetailsExam(null);
                          handleScheduleSubjects(viewDetailsExam.id);
                        }}
                      >
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Schedule Subjects
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDetailsExam(null);
                      setExamSubjects([]);
                    }}
                  >
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewDetailsExam(null);
                    handleScheduleSubjects(viewDetailsExam.id);
                  }}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Schedule Subjects
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
