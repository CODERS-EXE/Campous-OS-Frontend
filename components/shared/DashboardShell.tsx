"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Route,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, getRoleDashboardPath } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { NotificationBadge } from "@/components/shared/NotificationBadge";
import { AiAssistant } from "@/components/shared/AiAssistant";

const NAV_ITEMS: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  super_admin: [
    { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/super-admin/colleges", label: "Colleges", icon: GraduationCap },
    { href: "/super-admin/analytics", label: "Analytics", icon: LayoutDashboard },
    { href: "/super-admin/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/super-admin/notifications", label: "Notifications", icon: Bell },
    { href: "/super-admin/profile", label: "Profile", icon: Users },
    { href: "/super-admin/settings", label: "Settings", icon: Users },
  ],
  college_admin: [
    { href: "/college-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/college-admin/students", label: "Students", icon: Users },
    { href: "/college-admin/faculty", label: "Faculty", icon: BookOpen },
    { href: "/college-admin/parents", label: "Parents", icon: Users },
    { href: "/college-admin/wardens", label: "Wardens", icon: Home },
    { href: "/college-admin/hostel/dashboard", label: "Hostel Overview", icon: Home },
    { href: "/college-admin/hostel/buildings", label: "Hostel Buildings", icon: GraduationCap },
    { href: "/college-admin/hostel/rooms", label: "Hostel Rooms", icon: Home },
    { href: "/college-admin/hostel/allocations", label: "Room Allocations", icon: Users },
    { href: "/college-admin/hostel/requests", label: "Hostel Requests", icon: Bell },
    { href: "/college-admin/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/college-admin/notifications", label: "Notifications", icon: Bell },
    { href: "/college-admin/profile", label: "Profile", icon: Users },
    { href: "/college-admin/settings", label: "Settings", icon: Users },
    { href: "/transport/dashboard", label: "Transport", icon: Bus },
    { href: "/transport/buses", label: "Fleet", icon: MapPin },
    { href: "/transport/routes", label: "Routes", icon: Route },
    { href: "/transport/assignments", label: "Assignments", icon: Users },
  ],
  faculty: [
    { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/faculty/attendance", label: "Attendance", icon: Users },
    { href: "/faculty/students", label: "Students", icon: Users },
    { href: "/faculty/assignments", label: "Assignments", icon: BookOpen },
    { href: "/faculty/results", label: "Results", icon: BookOpen },
    { href: "/faculty/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/faculty/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/faculty/notifications", label: "Notifications", icon: Bell },
    { href: "/faculty/notes", label: "Notes", icon: BookOpen },
  ],
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/hostel", label: "Hostel & Room", icon: Home },
    { href: "/student/assignments", label: "Assignments", icon: BookOpen },
    { href: "/student/results", label: "Results", icon: BookOpen },
    { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/student/subjects", label: "Subjects", icon: BookOpen },
    { href: "/student/attendance", label: "Attendance", icon: Users },
    { href: "/student/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/student/notifications", label: "Notifications", icon: Bell },
    { href: "/student/profile", label: "Profile", icon: Users },
    { href: "/student/settings", label: "Settings", icon: Users },
    { href: "/student/bus", label: "Bus Tracking", icon: Bus },
  ],
  parent: [
    { href: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/parent/children", label: "My Children", icon: Users },
    { href: "/parent/attendance", label: "Attendance", icon: Users },
    { href: "/parent/results", label: "Results", icon: BookOpen },
    { href: "/parent/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/parent/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/parent/notifications", label: "Notifications", icon: Bell },
    { href: "/parent/profile", label: "Profile", icon: Users },
    { href: "/parent/settings", label: "Settings", icon: Users },
    { href: "/parent/bus", label: "Bus Tracking", icon: Bus },
  ],
  warden: [
    { href: "/warden/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/warden/students", label: "Students", icon: Users },
    { href: "/college-admin/hostel/buildings", label: "Buildings", icon: Home },
    { href: "/college-admin/hostel/rooms", label: "Rooms", icon: Home },
    { href: "/college-admin/hostel/allocations", label: "Allocations", icon: Users },
    { href: "/college-admin/hostel/requests", label: "Requests", icon: Bell },
    { href: "/warden/outpasses", label: "Outpasses", icon: Home },
    { href: "/warden/attendance", label: "Attendance", icon: Users },
    { href: "/warden/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/warden/notifications", label: "Notifications", icon: Bell },
    { href: "/warden/profile", label: "Profile", icon: Users },
    { href: "/warden/settings", label: "Settings", icon: Users },
  ],
};

export function DashboardShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const { user, college, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = user ? NAV_ITEMS[user.role] || [] : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold">{college?.name || "CampusOS"}</span>
        <div className="ml-auto">
          <NotificationBadge />
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 h-full w-72 bg-background p-4 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-tenant">CampusOS</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </motion.aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-background lg:block lg:sticky lg:top-0 lg:h-screen">
          <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href={user ? getRoleDashboardPath(user.role) : "/"} className="font-bold text-tenant">
              {college?.name || "CampusOS"}
            </Link>
          </div>
          <div className="flex-1 p-4">
            <NavLinks items={items} pathname={pathname} />
          </div>
          <div className="mt-auto border-t p-4">
            <div className="mb-3 text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-muted-foreground capitalize">{user?.role.replace("_", " ")}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" className="flex-1" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <div className="hidden lg:flex">
              <NotificationBadge />
            </div>
          </div>
          {children}
        </main>
      </div>
      <AiAssistant />
    </div>
  );
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-tenant/10 text-tenant"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
