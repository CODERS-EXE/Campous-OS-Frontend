"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  ChevronDown,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampusLogo } from "@/components/shared/CampusLogo";
import { cn, getRoleDashboardPath } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { NotificationBadge } from "@/components/shared/NotificationBadge";
import { AiAssistant } from "@/components/shared/AiAssistant";
import { GlobalSearch } from "@/components/shared/GlobalSearch";

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
    { href: "/college-admin/students", label: "Students", icon: Users },
    { href: "/college-admin/faculty", label: "Faculty", icon: BookOpen },
    { href: "/college-admin/parents", label: "Parents", icon: Users },
    { href: "/college-admin/wardens", label: "Wardens", icon: Home },
    { href: "/college-admin/attendance", label: "Attendance", icon: Users },
    { href: "/college-admin/timetable", label: "Timetable", icon: CalendarDays },
    { href: "/college-admin/exams", label: "Exams", icon: BookOpen },
    { href: "/college-admin/exam-schedule", label: "Exam Schedule", icon: CalendarDays },
    { href: "/college-admin/exam-results", label: "Results", icon: BookOpenCheck },
    { href: "/college-admin/fees", label: "Fees Management", icon: CreditCard },
    { href: "/college-admin/library", label: "Library", icon: BookOpenCheck },
    { href: "/college-admin/hostel/dashboard", label: "Hostel Overview", icon: Home },
    { href: "/college-admin/hostel/buildings", label: "Hostel Buildings", icon: GraduationCap },
    { href: "/college-admin/hostel/rooms", label: "Hostel Rooms", icon: Home },
    { href: "/college-admin/hostel/allocations", label: "Room Allocations", icon: Users },
    { href: "/college-admin/hostel/requests", label: "Hostel Requests", icon: Bell },
    { href: "/college-admin/placements", label: "Placements", icon: GraduationCap },
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

function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

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
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(profileRef, () => setProfileOpen(false));

  const items = user ? NAV_ITEMS[user.role] || [] : [];

  // Generate breadcrumb path
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    // Format segment text nicely
    const formattedSegment = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    
    return {
      label: formattedSegment,
      href,
      isLast
    };
  });

  // Get user avatar initials
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute left-0 top-0 h-full w-72 bg-card border-r shadow-2xl flex flex-col"
            >
              <div className="h-16 border-b px-6 flex items-center justify-between shrink-0">
                <Link href={user ? getRoleDashboardPath(user.role) : "/"} className="flex items-center gap-3">
                  <CampusLogo variant="icon" className="h-8 w-8" />
                  <span className="font-heading font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    CampusOS
                  </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        
        {/* ── Desktop Sidebar ── */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 80 : 280 }}
          className={cn(
            "hidden lg:flex shrink-0 flex-col border-r bg-card/50 backdrop-blur-xl relative z-40",
            "transition-[width] duration-300 ease-in-out"
          )}
        >
          {/* Collapse Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-4 top-5 h-8 w-8 rounded-full border shadow-sm z-50 bg-background"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          <div className="flex h-16 shrink-0 items-center border-b px-6 overflow-hidden">
            <Link href={user ? getRoleDashboardPath(user.role) : "/"} className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <CampusLogo variant="icon" className="h-8 w-8 shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex flex-col whitespace-nowrap overflow-hidden"
                  >
                    <span className="font-heading font-bold text-[15px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                      CampusOS
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[150px]">
                      {college?.name}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <NavLinks items={items} pathname={pathname} collapsed={collapsed} />
          </div>
        </motion.aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
          
          {/* ── Top Navbar ── */}
          <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-8 transition-colors">
            
            {/* Left: Mobile Menu & Breadcrumb */}
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="lg:hidden shrink-0 rounded-full">
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden md:flex items-center text-sm text-muted-foreground">
                <Link href={user ? getRoleDashboardPath(user.role) : "/"} className="hover:text-foreground transition-colors flex items-center">
                  <Home className="h-4 w-4" />
                </Link>
                {breadcrumb.length > 0 && <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />}
                {breadcrumb.map((crumb, idx) => (
                  <div key={crumb.href} className="flex items-center truncate">
                    {crumb.isLast ? (
                      <span className="font-medium text-foreground truncate">{title || crumb.label}</span>
                    ) : (
                      <>
                        <Link href={crumb.href} className="hover:text-foreground transition-colors truncate">
                          {crumb.label}
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Global Search (Hidden on small) */}
            <div className="hidden lg:flex max-w-md w-full">
              <GlobalSearch />
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className="hidden sm:block">
                <NotificationBadge />
              </div>
              
              {/* Profile Menu Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full p-1 pr-2 md:pr-3 hover:bg-muted transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-xs md:text-sm shadow-sm">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start text-left max-w-[120px]">
                    <span className="text-sm font-medium truncate w-full">{user?.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize truncate w-full">{user?.role.replace("_", " ")}</span>
                  </div>
                  <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground opacity-50" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 rounded-xl border bg-card p-2 shadow-xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3 mb-2 border-b bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold shadow-sm shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <p className="text-sm font-medium truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link href={user ? `/${user.role.replace("_", "-")}/profile` : "#"} onClick={() => setProfileOpen(false)}>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors cursor-pointer">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span>My Profile</span>
                          </div>
                        </Link>
                        
                        <div className="flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                          <div className="flex items-center gap-2">
                            {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                            <span>Theme</span>
                          </div>
                          <div className="flex items-center bg-muted/50 rounded-full p-0.5 border">
                            <button
                              onClick={(e) => { e.stopPropagation(); setTheme("light"); }}
                              className={cn("p-1 rounded-full transition-colors", theme === "light" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                            >
                              <Sun className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setTheme("dark"); }}
                              className={cn("p-1 rounded-full transition-colors", theme === "dark" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                            >
                              <Moon className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setTheme("system"); }}
                              className={cn("p-1 rounded-full transition-colors", theme === "system" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                            >
                              <Monitor className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-border my-1" />
                        
                        <button
                          onClick={() => { setProfileOpen(false); logout(); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* ── Page Content ── */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {/* Title is mainly displayed in breadcrumb now, but keeping for mobile / emphasis if needed. We can hide it since we have breadcrumbs, or keep it standard. */}
            <div className="md:hidden mb-6 flex items-center justify-between">
              <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
              <NotificationBadge />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
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
  collapsed = false,
  onNavigate,
}: {
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1.5 pb-20 lg:pb-0">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
              collapsed ? "justify-center" : "",
              isActive
                ? "bg-primary/10 text-primary dark:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {/* Active Indicator Line */}
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <Icon className={cn(
              "shrink-0 transition-transform duration-200",
              collapsed ? "h-5 w-5" : "h-4.5 w-4.5",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            
            {!collapsed && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
