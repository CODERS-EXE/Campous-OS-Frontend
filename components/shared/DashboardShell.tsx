"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  BookOpenCheck,
  Bus,
  CalendarDays,
  CreditCard,
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
import { CampusLogo } from "@/components/shared/CampusLogo";
import { cn, getRoleDashboardPath } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { NotificationBadge } from "@/components/shared/NotificationBadge";
import { AiAssistant } from "@/components/shared/AiAssistant";

const NAV_ITEMS: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  super_admin: [
    { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/super-admin/colleges", label: "Colleges", icon: GraduationCap },
    { href: "/super-admin/exam-analytics", label: "Exam Analytics", icon: BookOpen },
    { href: "/super-admin/fees", label: "Fees Collection", icon: CreditCard },
    { href: "/super-admin/library", label: "Library", icon: BookOpenCheck },
    { href: "/super-admin/analytics", label: "Analytics", icon: LayoutDashboard },
    { href: "/super-admin/ai-assistant", label: "AI Assistant", icon: Sparkles },
    { href: "/super-admin/notifications", label: "Notifications", icon: Bell },
    { href: "/super-admin/profile", label: "Profile", icon: Users },
    { href: "/super-admin/settings", label: "Settings", icon: Users },
  ],
  college_admin: [
    { href: "/college-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/college-admin/exams", label: "Exams", icon: BookOpen },
    { href: "/college-admin/exam-schedule", label: "Exam Schedule", icon: CalendarDays },
    { href: "/college-admin/exam-results", label: "Results", icon: BookOpenCheck },
    { href: "/college-admin/fees", label: "Fees Management", icon: CreditCard },
    { href: "/college-admin/library", label: "Library", icon: BookOpenCheck },
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
    { href: "/faculty/exams", label: "My Exams", icon: BookOpen },
    { href: "/faculty/marks-entry", label: "Marks Entry", icon: BookOpenCheck },
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
    { href: "/student/hall-ticket", label: "Hall Ticket", icon: BookOpenCheck },
    { href: "/student/exam-results", label: "Exam Results", icon: BookOpen },
    { href: "/student/fees", label: "My Fees", icon: CreditCard },
    { href: "/student/library", label: "Library", icon: BookOpenCheck },
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
    { href: "/parent/exam-results", label: "Exam Results", icon: BookOpen },
    { href: "/parent/fees", label: "Child Fees", icon: CreditCard },
    { href: "/parent/library", label: "Library", icon: BookOpenCheck },
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
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 lg:hidden shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <CampusLogo variant="icon" className="h-8 w-8" />
        <span className="font-heading font-semibold text-lg">{college?.name || "CampusOS"}</span>
        <div className="ml-auto">
          <NotificationBadge />
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 30 }}
            className="absolute left-0 top-0 h-full w-72 bg-card border-r shadow-2xl flex flex-col"
          >
            <div className="h-16 border-b px-6 flex items-center justify-between">
              <CampusLogo />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t p-4 bg-muted/30">
              <div className="mb-3 rounded-lg bg-card p-3">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role.replace("_", " ")}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="shrink-0"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="outline" className="flex-1" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden min-h-screen w-72 shrink-0 border-r bg-card lg:block lg:sticky lg:top-0 lg:h-screen">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <Link href={user ? getRoleDashboardPath(user.role) : "/"} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                <CampusLogo variant="icon" className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-sm gradient-text">CampusOS</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">{college?.name}</span>
                </div>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavLinks items={items} pathname={pathname} />
            </div>
            <div className="border-t p-4 bg-muted/30">
              <div className="mb-3 rounded-lg bg-gradient-primary/10 border border-primary/20 p-3">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role.replace("_", " ")}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="shrink-0"
                >
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
        <main className="flex-1 overflow-x-hidden">
          <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
              <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
              <div className="hidden lg:flex">
                <NotificationBadge />
              </div>
            </div>
          </div>
          <div className="p-4 md:p-8">
            {children}
          </div>
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
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-primary text-white shadow-brand"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-transform duration-200",
              isActive ? "scale-110" : "group-hover:scale-105"
            )} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
