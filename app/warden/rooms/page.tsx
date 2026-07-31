"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { api, Room } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { DataTable, ColumnDef, FilterOption } from "@/components/shared/DataTable";
import { Building2, Home, Users } from "lucide-react";

function RoomStatusBadge({ room }: { room: Room }) {
  if (room.occupied >= room.capacity)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">
        Full
      </span>
    );
  if (room.occupied > 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
        Partial ({room.occupied}/{room.capacity})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
      Available
    </span>
  );
}

export default function WardenRoomsPage() {
  const { user } = useAuthStore();

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ["rooms", "all"],
    queryFn: () => api.get<Room[]>("/api/v1/hostel/rooms"),
    enabled: !!user,
  });

  const hostels = useMemo(() => {
    const s = new Set<string>();
    rooms.forEach((r) => s.add(r.hostel_name));
    return Array.from(s).sort();
  }, [rooms]);

  const stats = useMemo(() => ({
    total: rooms.length,
    available: rooms.filter((r) => r.is_available && r.occupied < r.capacity).length,
    occupied: rooms.filter((r) => r.occupied > 0 && r.occupied < r.capacity).length,
    full: rooms.filter((r) => r.occupied >= r.capacity).length,
  }), [rooms]);

  const columns: ColumnDef<Room>[] = [
    {
      header: "Room Number",
      accessorKey: "room_number",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5 text-indigo-500" /> {row.room_number}
        </span>
      ),
    },
    {
      header: "Hostel Block",
      accessorKey: "hostel_name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.hostel_name}</p>
          {row.block && (
            <p className="text-[11px] text-muted-foreground">
              Block {row.block}{row.floor != null ? ` • Floor ${row.floor}` : ""}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Capacity",
      accessorKey: "capacity",
      sortable: true,
      cell: (row) => <span className="font-bold">{row.capacity} beds</span>,
    },
    {
      header: "Occupied / Available",
      accessorKey: "occupied",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-rose-600">{row.occupied} occupied</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-emerald-600">{Math.max(0, row.capacity - row.occupied)} free</span>
        </div>
      ),
    },
    {
      header: "Status",
      id: "status",
      sortable: false,
      cell: (row) => <RoomStatusBadge room={row} />,
    },
    {
      header: "Amenities",
      id: "amenities",
      cell: (row) =>
        row.amenities?.length ? (
          <div className="flex flex-wrap gap-1">
            {row.amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-semibold">
                {a}
              </span>
            ))}
            {row.amenities.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{row.amenities.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
  ];

  const tableFilters: FilterOption<Room>[] = [
    {
      id: "hostel_name",
      label: "Hostels",
      options: hostels.map((h) => ({ label: h, value: h })),
    },
    {
      id: "occupancy_status",
      label: "Status",
      options: [
        { label: "Available", value: "available" },
        { label: "Partially Occupied", value: "partial" },
        { label: "Full", value: "full" },
      ],
      filterFn: (row, val) => {
        if (val === "available") return row.is_available && row.occupied < row.capacity;
        if (val === "partial") return row.occupied > 0 && row.occupied < row.capacity;
        if (val === "full") return row.occupied >= row.capacity;
        return true;
      },
    },
  ];

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Room Management">
        <div className="space-y-5">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Rooms", value: stats.total, color: "text-foreground", bg: "bg-card/70", icon: Building2 },
              { label: "Available", value: stats.available, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: Home },
              { label: "Partially Occupied", value: stats.occupied, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: Users },
              { label: "Full", value: stats.full, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", icon: Home },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className={`rounded-3xl border border-border/60 ${bg} backdrop-blur-md p-4 flex items-center gap-3 shadow-sm`}>
                <div className={`h-9 w-9 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <DataTable
            title={`Room Directory (${rooms.length})`}
            description="Filter by hostel block or occupancy status"
            data={rooms}
            columns={columns}
            filters={tableFilters}
            searchPlaceholder="Search room number, hostel, block..."
            searchFields={["room_number", "hostel_name", "block"]}
            exportFileName="hostel_rooms"
            isLoading={isLoading}
            emptyMessage="No rooms match your current filter criteria."
          />
        </div>
      </DashboardShell>
    </AuthGuard>
  );
}
