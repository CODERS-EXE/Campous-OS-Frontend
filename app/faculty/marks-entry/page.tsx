"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentExam } from "@/lib/api";
import { Upload, Save } from "lucide-react";

export default function MarksEntryPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const { data: students, isLoading } = useQuery<StudentExam[]>({
    queryKey: ["subject-students", selectedExam],
    queryFn: async () => {
      if (!selectedExam) return [];
      const res = await fetch(
        `/api/v1/exams/subjects/${selectedExam}/students`
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    enabled: !!selectedExam,
  });

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Marks Entry">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Marks Entry</h1>
              <p className="text-muted-foreground mt-2">
                Enter internal and external marks for students
              </p>
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </div>

          {!selectedExam ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Select an exam from your assigned exams to enter marks
              </p>
              <Button variant="outline">View Assigned Exams</Button>
            </Card>
          ) : isLoading ? (
            <Card className="p-6">
              <Skeleton className="h-8 w-full mb-4" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2" />
              ))}
            </Card>
          ) : students && students.length > 0 ? (
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Student Marks Entry</h2>
                <p className="text-sm text-muted-foreground">
                  {students.length} students enrolled
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium">Roll No.</th>
                      <th className="pb-3 font-medium">Student Name</th>
                      <th className="pb-3 font-medium">Attendance</th>
                      <th className="pb-3 font-medium w-24">Internal</th>
                      <th className="pb-3 font-medium w-24">External</th>
                      <th className="pb-3 font-medium w-24">Total</th>
                      <th className="pb-3 font-medium">Grade</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="py-3">{student.student_roll_number}</td>
                        <td className="py-3">{student.student_name}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              student.attendance === "present"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : student.attendance === "absent"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {student.attendance}
                          </span>
                        </td>
                        <td className="py-3">
                          <Input
                            type="number"
                            className="w-20"
                            placeholder="0"
                            defaultValue={student.internal_marks || ""}
                            disabled={student.attendance !== "present"}
                          />
                        </td>
                        <td className="py-3">
                          <Input
                            type="number"
                            className="w-20"
                            placeholder="0"
                            defaultValue={student.external_marks || ""}
                            disabled={student.attendance !== "present"}
                          />
                        </td>
                        <td className="py-3 font-medium">
                          {student.total_marks?.toFixed(1) || "-"}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold">{student.grade || "-"}</span>
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost">
                            <Save className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save All Marks</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No students found</p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
