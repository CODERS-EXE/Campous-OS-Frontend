"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api, Student, TimetableEntry } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ParentTimetablePage() {
  const { user } = useAuthStore();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const childParam = params.get("child");
      if (childParam) {
        setSelectedChildId(childParam);
      }
    }
  }, []);

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["my-children"],
    queryFn: () => api.get<Student[]>("/api/v1/users/my-children"),
    enabled: !!user,
  });

  const myChildren = studentsQuery.data ?? [];

  useEffect(() => {
    if (!selectedChildId && myChildren.length > 0) {
      setSelectedChildId(myChildren[0].user_id);
    }
  }, [myChildren, selectedChildId]);

  const selectedChild = useMemo(
    () => myChildren.find((child) => child.user_id === selectedChildId),
    [myChildren, selectedChildId]
  );

  const timetableQuery = useQuery<TimetableEntry[]>({
    queryKey: ["timetable", "student", selectedChildId],
    queryFn: () => api.get<TimetableEntry[]>("/api/v1/timetable/student"),
    enabled: !!selectedChildId,
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
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return groups;
  }, [timetableQuery.data]);

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Child Timetable">
        <div className="space-y-6">
          {myChildren.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Child</CardTitle>
                <CardDescription>View class schedule for your child</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="child-select">Child</Label>
                  <select
                    id="child-select"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {myChildren.map((child) => (
                      <option key={child.user_id} value={child.user_id}>
                        {child.name} - Roll No: {child.roll_no}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedChild && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Weekly Timetable
                  </CardTitle>
                  <CardDescription>
                    Class schedule for {selectedChild.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {timetableQuery.isLoading && (
                    <p className="text-sm text-muted-foreground">Loading timetable...</p>
                  )}
                  {!timetableQuery.isLoading && timetableQuery.data?.length === 0 && (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        No timetable entries available yet for {selectedChild.name}.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Timetable will be available once faculty creates class schedules.
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
            </>
          )}

          {myChildren.length === 0 && !studentsQuery.isLoading && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No children linked to your account.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please contact your college administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
