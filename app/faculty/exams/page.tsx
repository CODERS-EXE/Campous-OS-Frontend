"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectExam } from "@/lib/api";
import { Calendar, Clock, Users } from "lucide-react";

export default function FacultyExamsPage() {
  const { data: assignedExams, isLoading } = useQuery<SubjectExam[]>({
    queryKey: ["faculty-assigned-exams"],
    queryFn: async () => {
      const res = await fetch("/api/v1/exams/faculty/assigned-exams");
      if (!res.ok) throw new Error("Failed to fetch assigned exams");
      return res.json();
    },
  });

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="My Exam Duties">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Exam Duties</h1>
            <p className="text-muted-foreground mt-2">
              Exams assigned for invigilation and marks entry
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-5 w-40 mb-3" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </Card>
              ))}
            </div>
          ) : assignedExams && assignedExams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {assignedExams.map((exam) => (
                <Card key={exam.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{exam.subject_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exam.subject_code}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(exam.exam_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {exam.start_time} - {exam.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {exam.enrolled_students} students | Room:{" "}
                          {exam.room_numbers.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-muted-foreground">Max Marks:</span>
                          <span className="ml-1 font-medium">{exam.max_marks}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Appeared:</span>
                          <span className="ml-1 font-medium">
                            {exam.appeared_students}/{exam.enrolled_students}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Mark Attendance
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Enter Marks
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No exams assigned to you currently
              </p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
