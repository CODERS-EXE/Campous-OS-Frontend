"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, Exam } from "@/lib/api";
import { CheckCircle, Download, Calculator, Loader2, Eye, X, TrendingUp, Award, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function ExamResultsPage() {
  const queryClient = useQueryClient();
  const [viewResultsExam, setViewResultsExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ["exams-for-results"],
    queryFn: () => api.getExams(),
  });

  const calculateMutation = useMutation({
    mutationFn: (examId: string) => api.calculateExamResults(examId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exams-for-results"] });
      toast.success(`Results calculated for ${data.total_students} students.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: (examId: string) => api.publishExamResults(examId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exams-for-results"] });
      toast.success(`${data.count} results published to students.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const exportMutation = useMutation({
    mutationFn: (examId: string) => api.exportExamResultsCsv(examId),
    onSuccess: (data) => {
      // Trigger browser download from the CSV string the backend returns
      const blob = new Blob([data.content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.rows} result rows.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isBusy = (examId: string) =>
    (calculateMutation.isPending && calculateMutation.variables === examId) ||
    (publishMutation.isPending && publishMutation.variables === examId) ||
    (exportMutation.isPending && exportMutation.variables === examId);

  const handleViewResults = async (exam: Exam) => {
    setViewResultsExam(exam);
    try {
      // Fetch all results for this exam
      const response = await api.get(`/exams/${exam.id}/results`);
      setExamResults(response || []);
    } catch (error) {
      console.error("Failed to fetch results", error);
      toast.error("Failed to load results");
      setExamResults([]);
    }
  };

  // Calculate statistics
  const getStats = () => {
    if (!examResults.length) return { total: 0, passed: 0, failed: 0, avgSgpa: 0, highest: 0, lowest: 0 };
    
    const passed = examResults.filter((r: any) => r.result_status === "pass").length;
    const failed = examResults.length - passed;
    const sgpas = examResults.map((r: any) => r.sgpa || 0).filter(s => s > 0);
    const avgSgpa = sgpas.length ? (sgpas.reduce((a, b) => a + b, 0) / sgpas.length).toFixed(2) : 0;
    const highest = sgpas.length ? Math.max(...sgpas).toFixed(2) : 0;
    const lowest = sgpas.length ? Math.min(...sgpas).toFixed(2) : 0;

    return { total: examResults.length, passed, failed, avgSgpa, highest, lowest };
  };

  const filteredExams = exams?.filter(exam => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "published") return exam.results_published;
    if (selectedFilter === "pending") return !exam.results_published;
    return true;
  }) || [];

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Results Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Results Management</h1>
              <p className="text-muted-foreground mt-2">
                Calculate, verify, and publish exam results
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 border-b-2 transition ${
                selectedFilter === "all"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              All Exams ({exams?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter("pending")}
              className={`px-4 py-2 border-b-2 transition ${
                selectedFilter === "pending"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending ({exams?.filter(e => !e.results_published).length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter("published")}
              className={`px-4 py-2 border-b-2 transition ${
                selectedFilter === "published"
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Published ({exams?.filter(e => e.results_published).length || 0})
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))}
            </div>
          ) : filteredExams && filteredExams.length > 0 ? (
            <div className="space-y-4">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{exam.name}</h3>
                        {exam.results_published && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Published
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exam.academic_year} | Semester {exam.semester} |{" "}
                        {exam.total_students} students
                      </div>
                      {exam.published_at && (
                        <div className="text-xs text-muted-foreground">
                          Published on:{" "}
                          {new Date(exam.published_at).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!exam.results_published ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy(exam.id)}
                            onClick={() => calculateMutation.mutate(exam.id)}
                          >
                            {calculateMutation.isPending && calculateMutation.variables === exam.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Calculator className="mr-2 h-4 w-4" />
                            )}
                            Calculate Results
                          </Button>
                          <Button
                            size="sm"
                            disabled={isBusy(exam.id)}
                            onClick={() => {
                              if (confirm(`Publish results for "${exam.name}"? Students will be notified.`)) {
                                publishMutation.mutate(exam.id);
                              }
                            }}
                          >
                            {publishMutation.isPending && publishMutation.variables === exam.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Publish Results
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(exam)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy(exam.id)}
                            onClick={() => exportMutation.mutate(exam.id)}
                          >
                            {exportMutation.isPending && exportMutation.variables === exam.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="mr-2 h-4 w-4" />
                            )}
                            Export CSV
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {!exam.results_published && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Results not yet published. Calculate and verify before
                        publishing to students.
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No exams found for selected filter
              </p>
            </Card>
          )}

          {/* ── View Results Modal ── */}
          {viewResultsExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-6xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl font-bold">{viewResultsExam.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {viewResultsExam.academic_year} | Semester {viewResultsExam.semester}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setViewResultsExam(null);
                      setExamResults([]);
                    }}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Statistics Cards */}
                {examResults.length > 0 && (
                  <div className="grid grid-cols-6 gap-3">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{getStats().total}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Total Students</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{getStats().passed}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Passed</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <X className="h-5 w-5 mx-auto mb-2 text-red-600" />
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{getStats().failed}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                      <TrendingUp className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{getStats().avgSgpa}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Avg SGPA</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <Award className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{getStats().highest}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Highest SGPA</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <TrendingUp className="h-5 w-5 mx-auto mb-2 text-orange-600 rotate-180" />
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{getStats().lowest}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Lowest SGPA</p>
                    </div>
                  </div>
                )}

                {/* Results Table */}
                <div className="border rounded-lg overflow-hidden">
                  {examResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 text-sm font-semibold">Student</th>
                            <th className="text-left p-3 text-sm font-semibold">Roll Number</th>
                            <th className="text-center p-3 text-sm font-semibold">SGPA</th>
                            <th className="text-center p-3 text-sm font-semibold">CGPA</th>
                            <th className="text-center p-3 text-sm font-semibold">Status</th>
                            <th className="text-center p-3 text-sm font-semibold">Backlog</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {examResults.map((result: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/50">
                              <td className="p-3 text-sm">{result.student_name || "N/A"}</td>
                              <td className="p-3 text-sm font-mono">{result.roll_number || "N/A"}</td>
                              <td className="p-3 text-sm text-center font-semibold">
                                {result.sgpa ? result.sgpa.toFixed(2) : "-"}
                              </td>
                              <td className="p-3 text-sm text-center font-semibold">
                                {result.cgpa ? result.cgpa.toFixed(2) : "-"}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  result.result_status === "pass"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}>
                                  {result.result_status?.toUpperCase() || "PENDING"}
                                </span>
                              </td>
                              <td className="p-3 text-center text-sm">
                                {result.has_backlog ? (
                                  <span className="text-red-600 font-medium">Yes</span>
                                ) : (
                                  <span className="text-green-600">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">No results found for this exam</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click "Calculate Results" to generate results
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewResultsExam(null);
                      setExamResults([]);
                    }}
                  >
                    Close
                  </Button>
                  {examResults.length > 0 && (
                    <Button onClick={() => {
                      exportMutation.mutate(viewResultsExam.id);
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
