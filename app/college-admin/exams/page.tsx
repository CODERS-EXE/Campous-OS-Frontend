"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Exam } from "@/lib/api";
import { Plus } from "lucide-react";

export default function CollegeAdminExamsPage() {
  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await fetch("/api/v1/exams/");
      if (!res.ok) throw new Error("Failed to fetch exams");
      return res.json();
    },
  });

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
            <Button>
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
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
                            <span className="text-green-600 dark:text-green-400">
                              Published
                            </span>
                          ) : (
                            <span className="text-orange-600 dark:text-orange-400">
                              Pending
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Schedule Subjects
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No exams found</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Exam
              </Button>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
