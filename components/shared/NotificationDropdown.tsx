"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  X,
  ExternalLink,
  Loader2,
  Search,
  FileText,
  CheckCircle2,
  BarChart3,
  CreditCard,
  Ticket,
  Building2,
  Megaphone,
  Radio,
  Briefcase,
  CalendarDays,
  Clock,
  Palmtree,
  PartyPopper,
  AlertTriangle,
  Settings,
  Mail,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/hooks/useNotifications";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function getNotificationTypeIcon(type: string) {
  const iconProps = { className: "h-4 w-4" };
  switch (type) {
    case "assignment":
      return { icon: <FileText {...iconProps} />, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
    case "attendance":
      return { icon: <CheckCircle2 {...iconProps} />, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    case "results":
      return { icon: <BarChart3 {...iconProps} />, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
    case "fee_reminder":
      return { icon: <CreditCard {...iconProps} />, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    case "outpass":
      return { icon: <Ticket {...iconProps} />, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
    case "hostel_room":
      return { icon: <Building2 {...iconProps} />, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" };
    case "announcement":
      return { icon: <Megaphone {...iconProps} />, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    case "broadcast":
      return { icon: <Radio {...iconProps} />, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" };
    case "placement":
      return { icon: <Briefcase {...iconProps} />, color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" };
    case "exam_schedule":
      return { icon: <CalendarDays {...iconProps} />, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    case "timetable":
      return { icon: <Clock {...iconProps} />, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" };
    case "leave":
      return { icon: <Palmtree {...iconProps} />, color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" };
    case "event":
      return { icon: <PartyPopper {...iconProps} />, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" };
    case "deadline":
      return { icon: <AlertTriangle {...iconProps} />, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    case "system":
      return { icon: <Settings {...iconProps} />, color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
    default:
      return { icon: <Mail {...iconProps} />, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
  }
}

export function getPriorityBadgeStyle(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
    case "high":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "normal":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "low":
    default:
      return "bg-muted text-muted-foreground border-border/50";
  }
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "urgent">("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications({ limit: 20 });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab Filter
      if (activeTab === "unread" && item.is_read) return false;
      if (activeTab === "urgent" && item.priority !== "urgent" && item.priority !== "high") return false;

      // Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.body.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, activeTab, searchTerm]);

  const handleNotificationClick = (notification: { id: string; is_read: boolean; action_url?: string }) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-border/70 bg-card/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] z-50 text-card-foreground"
    >
      {/* Top Gradient Highlight */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

      {/* ── Header ── */}
      <div className="p-4 pb-3 border-b border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl px-2.5"
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    Read All
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search updates..."
            className="w-full h-8 rounded-xl border border-border/60 bg-background/60 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 pt-1">
          {(["all", "unread", "urgent"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab === "unread" ? `Unread (${unreadCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification List ── */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium">Fetching notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-muted-foreground">
            <Inbox className="h-10 w-10 text-muted-foreground/40 stroke-[1.5]" />
            <p className="text-sm font-semibold text-foreground">No notifications found</p>
            <p className="text-xs">
              {searchTerm ? "Try searching for a different term." : "You have no notifications in this tab."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const { icon, color } = getNotificationTypeIcon(notification.type);
            const priorityBadge = getPriorityBadgeStyle(notification.priority);

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-3.5 transition-all duration-200 cursor-pointer hover:bg-muted/50 ${
                  !notification.is_read ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                {/* Unread Accent Bar */}
                {!notification.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}

                <div className="flex items-start gap-3">
                  {/* Type Icon Badge */}
                  <div className={`h-9 w-9 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${color}`}>
                    {icon}
                  </div>

                  {/* Content Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse mt-1" />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.body}
                    </p>

                    {/* Footer Row */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        {notification.priority !== "normal" && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${priorityBadge}`}>
                            {notification.priority}
                          </span>
                        )}

                        {/* Action Link Indicator */}
                        {notification.action_url && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary group-hover:underline">
                            Details <ExternalLink className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      {notifications.length > 0 && (
        <div className="p-2.5 border-t border-border/60 bg-muted/20 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push("/college-admin/notifications");
              onClose();
            }}
            className="w-full h-8 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl"
          >
            View All Notifications Hub →
          </Button>
        </div>
      )}
    </motion.div>
  );
}
