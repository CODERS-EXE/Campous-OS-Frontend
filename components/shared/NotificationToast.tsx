"use client";

import { useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";
import type { Notification } from "@/lib/api";
import { getNotificationTypeIcon, getPriorityBadgeStyle } from "./NotificationDropdown";

interface NotificationToastProps {
  notification: Pick<Notification, "id" | "title" | "body" | "type" | "priority" | "action_url">;
  toastId: string;
  onDismiss: (toastId: string) => void;
  visible: boolean;
}

export function NotificationToast({
  notification,
  toastId,
  onDismiss,
  visible,
}: NotificationToastProps) {
  const router = useRouter();
  const { icon, color } = getNotificationTypeIcon(notification.type);
  const priorityBadgeStyle = getPriorityBadgeStyle(notification.priority);

  const handleClick = () => {
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    onDismiss(toastId);
  };

  return (
    <div
      className={`
        ${visible ? "animate-in slide-in-from-right-full fade-in-50" : "animate-out slide-out-to-right-full fade-out-50"}
        relative max-w-sm w-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl pointer-events-auto
        transition-all duration-300 hover:shadow-3xl text-card-foreground
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Priority Top Highlight Bar */}
      <div
        className={`h-1 w-full ${
          notification.priority === "urgent"
            ? "bg-rose-500"
            : notification.priority === "high"
            ? "bg-amber-500"
            : "bg-gradient-to-r from-indigo-500 to-purple-500"
        }`}
      />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Type Icon Avatar */}
          <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${color}`}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-foreground line-clamp-1">
                {notification.title}
              </h4>
              {notification.priority !== "normal" && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase border ${priorityBadgeStyle}`}>
                  {notification.priority}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {notification.body}
            </p>

            {notification.action_url && (
              <button
                onClick={handleClick}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>View Details</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => onDismiss(toastId)}
            className="flex-shrink-0 p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
