"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectExam } from "@/lib/api";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function ExamSchedulePage() {
  const { data: subjectExams, isLoading } = useQuery<SubjectExam[]>({
    queryKey: ["subject-exams"],
    queryFn: async () => {
      // This would typically fetch for a specific exam_id
      const res = await fetch("/api/v1/exams/faculty/assigned-exams");
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
  });

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
            <Button>Schedule Subject</Button>
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
                          {subjectExam.room_numbers.join(", ") || "Not assigned"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex justify-between items-center text-sm">
                      <div className="space-x-3">
                        <span>
                          <span className="font-medium">Enrolled:</span>{" "}
                          {subjectExam.enrolled_students}
                        </span>
                        <span>
                          <span className="font-medium">Appeared:</span>{" "}
                          {subjectExam.appeared_students}
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

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit Schedule
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Students
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No scheduled exams</p>
              <Button>Schedule First Subject</Button>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
