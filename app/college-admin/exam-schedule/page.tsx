"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, SubjectExam, Exam } from "@/lib/api";
import { Calendar, Clock, MapPin, Plus, X, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ExamSchedulePage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const preSelectedExamId = searchParams.get("examId");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<SubjectExam | null>(null);
  const [viewStudentsSubject, setViewStudentsSubject] = useState<SubjectExam | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [generatingHallTickets, setGeneratingHallTickets] = useState(false);

  // Form state
  const [selectedExamId, setSelectedExamId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("09:30");
  const [endTime, setEndTime] = useState("12:30");
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(40);
  const [roomNumbers, setRoomNumbers] = useState("");
  const [facultyId, setFacultyId] = useState("");

  // Pre-select exam if coming from exams page
  useEffect(() => {
    if (preSelectedExamId) {
      setSelectedExamId(preSelectedExamId);
      setIsModalOpen(true); // Auto-open modal
    }
  }, [preSelectedExamId]);

  const { data: subjectExams, isLoading } = useQuery<SubjectExam[]>({
    queryKey: ["subject-exams"],
    queryFn: async () => {
      // For college admin, we need to get all exams first, then get subjects for each
      const exams = await api.getExams();
      if (!exams || exams.length === 0) return [];
      
      // Get subjects for all exams
      const allSubjects: SubjectExam[] = [];
      for (const exam of exams) {
        try {
          const subjects = await api.getSubjectExams(exam.id);
          allSubjects.push(...subjects);
        } catch (error) {
          console.error(`Failed to fetch subjects for exam ${exam.id}`, error);
        }
      }
      return allSubjects;
    },
  });

  const { data: exams } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: () => api.getExams(),
  });

  const { data: facultyList = [] } = useQuery<import("@/lib/api").Faculty[]>({
    queryKey: ["faculty"],
    queryFn: () => api.get<import("@/lib/api").Faculty[]>("/api/v1/users/faculty"),
  });

  const scheduleMutation = useMutation({
    mutationFn: (payload: {
      examId: string;
      subject_id: string;
      subject_name: string;
      subject_code: string;
      exam_date: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      max_marks: number;
      passing_marks: number;
      credits: number;
      room_numbers: string[];
      faculty_id?: string;
    }) =>
      api.scheduleSubjectExam(payload.examId, {
        subject_id: payload.subject_id,
        subject_name: payload.subject_name,
        subject_code: payload.subject_code,
        exam_date: payload.exam_date,
        start_time: payload.start_time,
        end_time: payload.end_time,
        duration_minutes: payload.duration_minutes,
        max_marks: payload.max_marks,
        passing_marks: payload.passing_marks,
        credits: 3,
        room_numbers: payload.room_numbers,
        faculty_id: payload.faculty_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
      toast.success("Subject exam scheduled successfully!");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to schedule subject exam");
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      api.updateSubjectExam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
      toast.success("Subject exam updated successfully!");
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingSubjectId(null);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update subject exam");
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (subjectExamId: string) =>
      api.deleteSubjectExam(subjectExamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
      toast.success("Subject exam deleted successfully!");
      setDeleteConfirmSubject(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete subject exam");
    },
  });

  const resetForm = () => {
    setSelectedExamId(preSelectedExamId || "");
    setSubjectName("");
    setSubjectCode("");
    setExamDate("");
    setStartTime("09:30");
    setEndTime("12:30");
    setDurationMinutes(180);
    setMaxMarks(100);
    setPassingMarks(40);
    setRoomNumbers("");
    setFacultyId("");
    setIsEditMode(false);
    setEditingSubjectId(null);
  };

  const handleEditSchedule = (subject: SubjectExam) => {
    setIsEditMode(true);
    setEditingSubjectId(subject.id);
    setSelectedExamId(subject.exam_id);
    setSubjectName(subject.subject_name);
    setSubjectCode(subject.subject_code);
    setExamDate(subject.exam_date.split("T")[0]);
    setStartTime(subject.start_time);
    setEndTime(subject.end_time);
    setDurationMinutes(subject.duration_minutes);
    setMaxMarks(subject.max_marks);
    setPassingMarks(subject.passing_marks);
    setRoomNumbers(subject.room_numbers?.join(", ") || "");
    setFacultyId(subject.faculty_id || "");
    setIsModalOpen(true);
  };

  const handleGenerateHallTickets = async (subjectExamId: string, examId: string) => {
    try {
      setGeneratingHallTickets(true);
      await api.post(`/api/v1/exams/${examId}/generate-hall-tickets`, {
        student_ids: []
      });
      toast.success("Hall tickets generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subject-exams"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to generate hall tickets");
    } finally {
      setGeneratingHallTickets(false);
    }
  };

  const handleViewStudents = async (subject: SubjectExam) => {
    setViewStudentsSubject(subject);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !subjectName || !subjectCode || !examDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const rooms = roomNumbers
      ? roomNumbers.split(",").map((r) => r.trim()).filter(Boolean)
      : [];

    const payload = {
      exam_date: new Date(examDate).toISOString(),
      start_time: startTime,
      end_time: endTime,
      duration_minutes: Number(durationMinutes),
      max_marks: Number(maxMarks),
      passing_marks: Number(passingMarks),
      room_numbers: rooms,
    };

    if (isEditMode && editingSubjectId) {
      updateSubjectMutation.mutate({ id: editingSubjectId, payload });
    } else {
      scheduleMutation.mutate({
        examId: selectedExamId,
        subject_id: "",
        subject_name: subjectName,
        subject_code: subjectCode,
        ...payload,
        credits: 3,
        faculty_id: facultyId || undefined,
      });
    }
  };

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Exam Schedule">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Exam Schedule</h1>
              <p className="text-muted-foreground mt-2">
                Manage subject-wise exam scheduling
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Subject
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </Card>
              ))}
            </div>
          ) : subjectExams && subjectExams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {subjectExams.map((subjectExam) => (
                <Card key={subjectExam.id} className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {subjectExam.subject_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {subjectExam.subject_code}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(subjectExam.exam_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {subjectExam.start_time} - {subjectExam.end_time} (
                          {subjectExam.duration_minutes} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {subjectExam.room_numbers?.join(", ") || "Not assigned"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex justify-between items-center text-sm">
                      <div className="space-x-3">
                        <span>
                          <span className="font-medium">Enrolled:</span>{" "}
                          {subjectExam.enrolled_students ?? 0}
                        </span>
                        <span>
                          <span className="font-medium">Appeared:</span>{" "}
                          {subjectExam.appeared_students ?? 0}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          subjectExam.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {subjectExam.status}
                      </span>
                    </div>
                    {subjectExam.faculty_id && (
                      <p className="text-xs text-muted-foreground">
                        Faculty: {facultyList.find(f => f.user_id === subjectExam.faculty_id)?.name || subjectExam.faculty_id}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => handleEditSchedule(subjectExam)}>
                        Edit Schedule
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewStudents(subjectExam)}>
                        View Students
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleGenerateHallTickets(subjectExam.id, subjectExam.exam_id)}
                        disabled={generatingHallTickets}
                      >
                        {generatingHallTickets ? "Generating..." : "Hall Tickets"}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setDeleteConfirmSubject(subjectExam)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No scheduled exams</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule First Subject
              </Button>
            </Card>
          )}

          {/* Schedule Subject Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">
                      {isEditMode ? "Edit Subject Schedule" : "Schedule Subject Exam"}
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
                      Select Exam *
                    </label>
                    <select
                      required
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select an examination...</option>
                      {exams?.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.name} ({exam.academic_year} - Sem {exam.semester})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Subject Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="e.g. Data Structures"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Subject Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        placeholder="e.g. CS301"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                      Assign Faculty (for marks entry)
                    </label>
                    <select
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Auto-detect from subjects (or leave blank)</option>
                      {facultyList.map((f) => (
                        <option key={f.user_id} value={f.user_id}>
                          {f.name} — {f.department} | {f.subjects?.join(", ") || "No subjects"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Exam Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Start Time *
                      </label>
                      <input
                        type="text"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="09:30"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        End Time *
                      </label>
                      <input
                        type="text"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="12:30"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Max Marks
                      </label>
                      <input
                        type="number"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                        Passing Marks
                      </label>
                      <input
                        type="number"
                        value={passingMarks}
                        onChange={(e) => setPassingMarks(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
                      Rooms (comma separated)
                    </label>
                    <input
                      type="text"
                      value={roomNumbers}
                      onChange={(e) => setRoomNumbers(e.target.value)}
                      placeholder="e.g. Hall 101, Hall 102"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={scheduleMutation.isPending}
                    >
                      {scheduleMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Scheduling...
                        </span>
                      ) : (
                        "Schedule Subject"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Delete Subject Confirmation Modal ── */}
          {deleteConfirmSubject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Delete Subject Exam</h2>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{deleteConfirmSubject.subject_name}</span>{" "}
                    ({deleteConfirmSubject.subject_code})?
                  </p>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <p className="text-muted-foreground">This will permanently delete:</p>
                    <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                      <li>Subject exam schedule</li>
                      <li>All hall tickets for this subject</li>
                      <li>Student attendance records (if any)</li>
                    </ul>
                    <p className="text-orange-600 dark:text-orange-400 font-medium mt-2">
                      ⚠️ You cannot delete if marks have been entered
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmSubject(null)}
                    disabled={deleteSubjectMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteConfirmSubject && deleteSubjectMutation.mutate(deleteConfirmSubject.id)}
                    disabled={deleteSubjectMutation.isPending}
                  >
                    {deleteSubjectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Subject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── View Students Modal ── */}
          {viewStudentsSubject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl font-bold">{viewStudentsSubject.subject_name}</h2>
                    <p className="text-sm text-muted-foreground">{viewStudentsSubject.subject_code}</p>
                  </div>
                  <button
                    onClick={() => setViewStudentsSubject(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{viewStudentsSubject.enrolled_students || 0}</p>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{viewStudentsSubject.appeared_students || 0}</p>
                      <p className="text-sm text-muted-foreground">Appeared</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{viewStudentsSubject.max_marks}</p>
                      <p className="text-sm text-muted-foreground">Max Marks</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Exam Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>{" "}
                        <span className="font-medium">{new Date(viewStudentsSubject.exam_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>{" "}
                        <span className="font-medium">{viewStudentsSubject.start_time} - {viewStudentsSubject.end_time}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        <span className="font-medium">{viewStudentsSubject.duration_minutes} minutes</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Room:</span>{" "}
                        <span className="font-medium">{viewStudentsSubject.room_numbers?.join(", ") || "Not assigned"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passing Marks:</span>{" "}
                        <span className="font-medium">{viewStudentsSubject.passing_marks}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <span className="font-medium capitalize">{viewStudentsSubject.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Detailed student list and marks entry available in Marks Entry section
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setViewStudentsSubject(null)}
                  >
                    Close
                  </Button>
                  <Button onClick={() => {
                    setViewStudentsSubject(null);
                    handleGenerateHallTickets(viewStudentsSubject.id, viewStudentsSubject.exam_id);
                  }}>
                    Generate Hall Tickets
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
