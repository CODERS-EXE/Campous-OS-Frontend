"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, TimetableEntry } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentTimetablePage() {
  const { user } = useAuthStore();

  const timetableQuery = useQuery<TimetableEntry[]>({
    queryKey: ["timetable", "student"],
    queryFn: () => api.get<TimetableEntry[]>("/api/v1/timetable/student"),
    enabled: !!user,
  });

  const groupedByDay = useMemo(() => {
    const groups: Record<string, TimetableEntry[]> = {};
    DAYS.forEach((day) => {
      groups[day] = [];
    });
    timetableQuery.data?.forEach((entry) => {
      const day = DAYS[entry.day_of_week];
      if (day) groups[day].push(entry);
    });
    // Sort by start_time within each day
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return groups;
  }, [timetableQuery.data]);

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell title="Timetable">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Weekly Timetable
              </CardTitle>
              <CardDescription>Your class schedule for the week</CardDescription>
            </CardHeader>
            <CardContent>
              {timetableQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading timetable...</p>
              )}
              {!timetableQuery.isLoading && timetableQuery.data?.length === 0 && (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No timetable entries available yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your faculty will create timetable entries for your classes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {Object.entries(groupedByDay).map(([day, entries]) => {
            const isToday = day === today;
            return (
              <Card key={day} className={isToday ? "border-tenant" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {day}
                    {isToday && (
                      <span className="ml-2 rounded-full bg-tenant px-2 py-0.5 text-xs text-white">
                        Today
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{entries.length} class(es) scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No classes scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div key={entry.id} className="rounded-xl border p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold">{entry.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.classroom || "Classroom TBA"}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {entry.start_time} - {entry.end_time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
