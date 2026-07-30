"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, TimetableEntry } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { formatDate } from "@/lib/utils";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function sortByTime(a: TimetableEntry, b: TimetableEntry) {
  return a.start_time.localeCompare(b.start_time);
}

export default function FacultyTimetablePage() {
  const { user } = useAuthStore();

  const timetableQuery = useQuery<TimetableEntry[]>({
    queryKey: ["timetable", user?.id],
    queryFn: () => api.get<TimetableEntry[]>(`/api/v1/timetable/faculty/${user?.id}`),
    enabled: !!user?.id,
  });

  const grouped = useMemo(() => {
    const buckets: Record<number, TimetableEntry[]> = {};
    timetableQuery.data?.forEach((entry) => {
      buckets[entry.day_of_week] = [...(buckets[entry.day_of_week] ?? []), entry].sort(sortByTime);
    });
    return buckets;
  }, [timetableQuery.data]);

  const todayIndex = useMemo(() => ((new Date().getDay() + 6) % 7), []);

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Timetable">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>View your scheduled classes for the week</CardDescription>
            </CardHeader>
            <CardContent>
              {timetableQuery.isLoading && <p className="text-sm text-muted-foreground">Loading timetable...</p>}
              {!timetableQuery.isLoading && !timetableQuery.data?.length && (
                <p className="text-sm text-muted-foreground">No timetable entries found for your account.</p>
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                {DAY_LABELS.map((label, index) => (
                  <div key={label} className={`rounded-xl border p-4 ${index === todayIndex ? "border-tenant bg-tenant/5" : "border-border bg-background"}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{label}</p>
                        {index === todayIndex ? <p className="text-xs text-tenant">Today</p> : null}
                      </div>
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {grouped[index]?.length ? (
                      <div className="space-y-3">
                        {grouped[index].map((entry) => (
                          <div key={entry.id} className="rounded-xl border border-muted/60 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{entry.subject}</p>
                                <p className="text-sm text-muted-foreground">{entry.classroom || "Classroom not assigned"}</p>
                              </div>
                              <span className="text-sm text-muted-foreground">{entry.start_time} - {entry.end_time}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <div className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{entry.start_time}</span>
                              </div>
                              <div className="inline-flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{entry.classroom || "No classroom"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No classes scheduled.</p>
                    )}
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
