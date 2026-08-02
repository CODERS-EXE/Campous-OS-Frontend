"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, Clock, MapPin, Plus, Trash2, X, Loader2, Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, Faculty, TimetableEntry } from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-background shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

interface TimetableFormState {
  faculty_id: string;
  subject: string;
  classroom: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

const EMPTY_FORM: TimetableFormState = {
  faculty_id: "",
  subject: "",
  classroom: "",
  day_of_week: "0",
  start_time: "09:00",
  end_time: "10:00",
};

export default function CollegeAdminTimetablePage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [form, setForm] = useState<TimetableFormState>(EMPTY_FORM);
  const [filterDay, setFilterDay] = useState<string>("");
  const [filterFaculty, setFilterFaculty] = useState<string>("");

  const { data: allEntries = [], isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ["timetable-admin", filterDay, filterFaculty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterFaculty) params.set("faculty_user_id", filterFaculty);
      if (filterDay !== "") params.set("day_of_week", filterDay);
      const q = params.toString();
      return api.get<TimetableEntry[]>(`/api/v1/timetable${q ? `?${q}` : ""}`);
    },
  });

  const { data: facultyList = [] } = useQuery<Faculty[]>({
    queryKey: ["faculty"],
    queryFn: () => api.get<Faculty[]>("/api/v1/users/faculty"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => api.post<TimetableEntry>("/api/v1/timetable", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable-admin"] });
      toast.success("Timetable entry created");
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      api.patch<TimetableEntry>(`/api/v1/timetable/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable-admin"] });
      toast.success("Timetable entry updated");
      setShowModal(false);
      setEditEntry(null);
      setForm(EMPTY_FORM);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete<{ ok: boolean }>(`/api/v1/timetable/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable-admin"] });
      toast.success("Entry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditEntry(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (entry: TimetableEntry) => {
    setEditEntry(entry);
    setForm({
      faculty_id: entry.faculty_id,
      subject: entry.subject,
      classroom: entry.classroom || "",
      day_of_week: String(entry.day_of_week),
      start_time: entry.start_time,
      end_time: entry.end_time,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      faculty_id: form.faculty_id,
      subject: form.subject,
      classroom: form.classroom || null,
      day_of_week: parseInt(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
    };
    if (editEntry) {
      updateMutation.mutate({ id: editEntry.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const grouped = useMemo(() => {
    const g: Record<number, TimetableEntry[]> = {};
    allEntries.forEach((e) => {
      g[e.day_of_week] = [...(g[e.day_of_week] ?? []), e].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );
    });
    return g;
  }, [allEntries]);

  const handleExportCSV = () => {
    const rows = [
      ["Day", "Subject", "Faculty", "Classroom", "Start", "End"],
      ...allEntries.map((e) => {
        const fac = facultyList.find((f) => f.user_id === e.faculty_id);
        return [
          DAYS[e.day_of_week] ?? e.day_of_week,
          e.subject,
          fac?.name ?? e.faculty_id,
          e.classroom ?? "",
          e.start_time,
          e.end_time,
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <AuthGuard allowedRoles={["college_admin"]}>
      <DashboardShell title="Timetable Management">
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={filterFaculty}
                onChange={(e) => setFilterFaculty(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Faculty</option>
                {facultyList.map((f) => (
                  <option key={f.user_id} value={f.user_id}>
                    {f.name} — {f.department}
                  </option>
                ))}
              </select>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Days</option>
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button size="sm" onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading timetable…</div>
          ) : allEntries.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No timetable entries yet. Click "Add Entry" to get started.</p>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {DAYS.map((day, idx) => {
                const entries = grouped[idx] ?? [];
                return (
                  <Card key={day}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" /> {day}
                        </span>
                        <span className="text-xs text-muted-foreground">{entries.length} session(s)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {entries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sessions</p>
                      ) : (
                        entries.map((e) => {
                          const fac = facultyList.find((f) => f.user_id === e.faculty_id);
                          return (
                            <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border p-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{e.subject}</p>
                                <p className="text-xs text-muted-foreground">
                                  {fac?.name ?? "Unknown Faculty"}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {e.start_time} – {e.end_time}
                                  </span>
                                  {e.classroom && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {e.classroom}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openEdit(e)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    if (confirm(`Delete "${e.subject}" on ${day}?`)) {
                                      deleteMutation.mutate(e.id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        <Modal
          open={showModal}
          onClose={() => { setShowModal(false); setEditEntry(null); setForm(EMPTY_FORM); }}
          title={editEntry ? "Edit Timetable Entry" : "Add Timetable Entry"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Faculty *</Label>
              <select
                required
                value={form.faculty_id}
                onChange={(e) => setForm((f) => ({ ...f, faculty_id: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select faculty…</option>
                {facultyList.map((fac) => (
                  <option key={fac.user_id} value={fac.user_id}>
                    {fac.name} — {fac.department} ({fac.subjects?.join(", ") || "No subjects"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Subject *</Label>
              <Input
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Data Structures"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Day *</Label>
                <select
                  required
                  value={form.day_of_week}
                  onChange={(e) => setForm((f) => ({ ...f, day_of_week: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Classroom</Label>
                <Input
                  value={form.classroom}
                  onChange={(e) => setForm((f) => ({ ...f, classroom: e.target.value }))}
                  placeholder="e.g. Hall A-101"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time *</Label>
                <Input
                  required
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  required
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isBusy}>
              {isBusy ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editEntry ? "Updating…" : "Creating…"}
                </span>
              ) : editEntry ? "Update Entry" : "Create Entry"}
            </Button>
          </form>
        </Modal>
      </DashboardShell>
    </AuthGuard>
  );
}
