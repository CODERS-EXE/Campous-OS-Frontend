"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, HallTicket } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { Download, Calendar, Clock, MapPin } from "lucide-react";

export default function StudentHallTicketPage() {
  const { user } = useAuthStore();
  const studentId = user?.id || "";

  const { data: hallTicket, isLoading } = useQuery<HallTicket>({
    queryKey: ["hall-ticket", studentId],
    queryFn: () => api.getStudentHallTicket(studentId),
    enabled: !!studentId,
  });

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Hall Ticket">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Hall Ticket</h1>
              <p className="text-muted-foreground mt-2">
                Download your examination hall ticket
              </p>
            </div>
            {hallTicket && (
              <Button onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>

          {isLoading ? (
            <Card className="p-8">
              <Skeleton className="h-8 w-64 mb-6" />
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-40 w-full" />
            </Card>
          ) : hallTicket ? (
            <Card className="p-8">
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {hallTicket.exam_name}
                    </h2>
                    <p className="text-muted-foreground">
                      {hallTicket.academic_year} | Semester {hallTicket.semester}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">
                      Hall Ticket Number
                    </div>
                    <div className="text-2xl font-bold">
                      {hallTicket.hall_ticket_number}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Student Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{hallTicket.student_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Roll Number
                    </div>
                    <div className="font-medium">
                      {hallTicket.student_roll_number}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Exam Schedule</h3>
                <div className="space-y-3">
                  {hallTicket.subjects.map((subject, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div>
                            <h4 className="font-semibold">{subject.subject_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {subject.subject_code}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(subject.exam_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {subject.start_time} - {subject.end_time}
                              </span>
                            </div>
                            {subject.room_number && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {subject.room_number}
                                  {subject.seat_number && ` | Seat: ${subject.seat_number}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <h4 className="font-semibold mb-2">Important Instructions</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Bring this hall ticket to the examination hall</li>
                  <li>Carry a valid photo ID card</li>
                  <li>Report 15 minutes before exam start time</li>
                  <li>Electronic devices are not allowed in the exam hall</li>
                </ul>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Hall ticket not generated yet. Please check back later.
              </p>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
