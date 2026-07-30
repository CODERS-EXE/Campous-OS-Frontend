"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, DoorOpen, Home, Users } from "lucide-react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { api, Room } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function WardenRoomsPage() {
  const { user } = useAuthStore();
  const [selectedHostel, setSelectedHostel] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const roomsQuery = useQuery<Room[]>({
    queryKey: ["rooms", "all"],
    queryFn: () => api.get<Room[]>("/api/v1/hostel/rooms"),
    enabled: !!user,
  });

  const hostels = useMemo(() => {
    const hostelSet = new Set<string>();
    roomsQuery.data?.forEach((r) => hostelSet.add(r.hostel_name));
    return Array.from(hostelSet).sort();
  }, [roomsQuery.data]);

  const filteredRooms = useMemo(() => {
    let result = roomsQuery.data || [];

    if (selectedHostel) {
      result = result.filter((r) => r.hostel_name === selectedHostel);
    }

    if (selectedFilter === "available") {
      result = result.filter((r) => r.is_available && r.occupied < r.capacity);
    } else if (selectedFilter === "occupied") {
      result = result.filter((r) => r.occupied > 0);
    } else if (selectedFilter === "full") {
      result = result.filter((r) => r.occupied >= r.capacity);
    }

    return result;
  }, [roomsQuery.data, selectedHostel, selectedFilter]);

  const stats = useMemo(() => {
    const total = roomsQuery.data?.length || 0;
    const available = roomsQuery.data?.filter((r) => r.is_available && r.occupied < r.capacity).length || 0;
    const occupied = roomsQuery.data?.filter((r) => r.occupied > 0).length || 0;
    const full = roomsQuery.data?.filter((r) => r.occupied >= r.capacity).length || 0;

    return { total, available, occupied, full };
  }, [roomsQuery.data]);

  const getRoomStatusColor = (room: Room) => {
    if (room.occupied >= room.capacity) {
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
    } else if (room.occupied > 0) {
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200";
    } else {
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
    }
  };

  const getRoomStatus = (room: Room) => {
    if (room.occupied >= room.capacity) return "Full";
    if (room.occupied > 0) return "Partially Occupied";
    return "Available";
  };

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Room Management">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Occupied</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{stats.occupied}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Full</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{stats.full}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filter Rooms</CardTitle>
              <CardDescription>Filter by hostel and occupancy status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="hostel">Hostel</Label>
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
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">All Rooms</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" /> Rooms
              </CardTitle>
              <CardDescription>
                Showing {filteredRooms.length} of {roomsQuery.data?.length || 0} rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roomsQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading rooms...</p>
              )}
              {!roomsQuery.isLoading && filteredRooms.length === 0 && (
                <div className="py-8 text-center">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {selectedHostel || selectedFilter !== "all"
                      ? "No rooms found matching your filters."
                      : "No rooms available."}
                  </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-tenant" />
                            <p className="font-semibold">Room {room.room_number}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{room.hostel_name}</p>
                          {room.block && (
                            <p className="text-xs text-muted-foreground">
                              Block {room.block}
                              {room.floor !== null && room.floor !== undefined && ` • Floor ${room.floor}`}
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getRoomStatusColor(room)}`}
                        >
                          {getRoomStatus(room)}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Occupied</span>
                          <span className="font-medium">{room.occupied}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Available</span>
                          <span className="font-medium text-green-600">
                            {Math.max(0, room.capacity - room.occupied)}
                          </span>
                        </div>
                      </div>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-xs text-muted-foreground">Amenities</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {room.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-muted px-2 py-0.5 text-xs"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
