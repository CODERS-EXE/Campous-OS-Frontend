"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Search, User, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, HostelStudent } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function WardenStudentsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostel, setSelectedHostel] = useState<string>("");

  const studentsQuery = useQuery<HostelStudent[]>({
    queryKey: ["hostel-students", "all"],
    queryFn: () => api.get<HostelStudent[]>("/api/v1/hostel/students"),
    enabled: !!user,
  });

  const hostels = useMemo(() => {
    const hostelSet = new Set<string>();
    studentsQuery.data?.forEach((s) => s.hostel && hostelSet.add(s.hostel));
    return Array.from(hostelSet).sort();
  }, [studentsQuery.data]);

  const filteredStudents = useMemo(() => {
    let result = studentsQuery.data || [];

    if (selectedHostel) {
      result = result.filter((s) => s.hostel === selectedHostel);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.roll_no.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query)
      );
    }

    return result;
  }, [studentsQuery.data, selectedHostel, searchQuery]);

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Hostel Students">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Find students by name, roll number, or hostel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, roll no, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hostel">Filter by Hostel</Label>
                  <select
                    id="hostel"
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">All Hostels</option>
                    {hostels.map((hostel) => (
                      <option key={hostel} value={hostel}>
                        {hostel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Students List
              </CardTitle>
              <CardDescription>
                Showing {filteredStudents.length} of {studentsQuery.data?.length || 0} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading students...</p>
              )}
              {!studentsQuery.isLoading && filteredStudents.length === 0 && (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {searchQuery || selectedHostel
                      ? "No students found matching your search."
                      : "No hostel students found."}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tenant/10">
                            <User className="h-6 w-6 text-tenant" />
                          </div>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Roll: {student.roll_no} • {student.department}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Year {student.year} • Semester {student.semester}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded-full bg-tenant/10 px-3 py-1 text-sm font-medium text-tenant">
                            {student.hostel}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        {student.emergency_contact && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-red-600" />
                            <span>Emergency: {student.emergency_contact}</span>
                          </div>
                        )}
                        {student.blood_group && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Blood: {student.blood_group}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
