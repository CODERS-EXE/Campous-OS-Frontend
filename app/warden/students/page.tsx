"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { api, HostelStudent } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Phone, Heart, Building2 } from "lucide-react";

export default function WardenStudentsPage() {
  const { user } = useAuthStore();

  const { data: students = [], isLoading } = useQuery<HostelStudent[]>({
    queryKey: ["hostel-students", "all"],
    queryFn: () => api.get<HostelStudent[]>("/api/v1/hostel/students"),
    enabled: !!user,
  });

  const hostels = useMemo(() => {
    const hostelSet = new Set<string>();
    students.forEach((s) => s.hostel && hostelSet.add(s.hostel));
    return Array.from(hostelSet).sort();
  }, [students]);

  const columns: ColumnDef<HostelStudent>[] = [
    {
      header: "Student",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Roll Number",
      accessorKey: "roll_no",
      sortable: true,
      cell: (row) => <span className="font-mono font-bold">{row.roll_no}</span>,
    },
    {
      header: "Department",
      accessorKey: "department",
      sortable: true,
    },
    {
      header: "Year / Sem",
      accessorKey: "year",
      sortable: true,
      cell: (row) => `Yr ${row.year} • Sem ${row.semester}`,
    },
    {
      header: "Hostel",
      accessorKey: "hostel",
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
          <Building2 className="h-3.5 w-3.5" />
          {row.hostel || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Contact",
      id: "contact",
      cell: (row) => (
        <div className="space-y-0.5">
          {row.phone && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3" /> {row.phone}
            </p>
          )}
          {row.emergency_contact && (
            <p className="flex items-center gap-1 text-[11px] text-rose-500">
              <Heart className="h-3 w-3" /> {row.emergency_contact}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Blood Group",
      accessorKey: "blood_group",
      cell: (row) => row.blood_group ? (
        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{row.blood_group}</span>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      header: "Status",
      id: "status",
      cell: () => <StatusBadge status="active" label="Resident" />,
    },
  ];

  const tableFilters: FilterOption<HostelStudent>[] = [
    {
      id: "hostel",
      label: "Hostels",
      options: hostels.map((h) => ({ label: h, value: h })),
      filterFn: (row, val) => row.hostel === val,
    },
  ];

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Hostel Students">
        <DataTable
          title={`Hostel Residents (${students.length})`}
          description="Search by name, roll no, department, or filter by hostel block"
          data={students}
          columns={columns}
          filters={tableFilters}
          searchPlaceholder="Search by name, roll no, email, department..."
          searchFields={["name", "roll_no", "email", "department", "hostel"]}
          exportFileName="hostel_students"
          isLoading={isLoading}
          emptyMessage="No hostel students found matching your search."
        />
      </DashboardShell>
    </AuthGuard>
  );
}
