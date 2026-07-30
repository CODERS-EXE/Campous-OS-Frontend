"use client";

import { useRouter } from "next/navigation";
import { X, ExternalLink } from "lucide-react";
import type { Notification } from "@/lib/api";

// Type icons map
const TYPE_ICONS: Record<string, string> = {
  assignment: "📝",
  attendance: "✅",
  results: "📊",
  fee_reminder: "💰",
  outpass: "🎫",
  hostel_room: "🏠",
  announcement: "📢",
  broadcast: "📣",
  placement: "💼",
  exam_schedule: "📅",
  timetable: "🕐",
  leave: "🏖️",
  event: "🎉",
  deadline: "⏰",
  system: "⚙️",
  general: "📬",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "border-l-4 border-red-500 bg-red-50 dark:bg-red-950",
  high: "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950",
  normal: "border-l-4 border-blue-500 bg-white dark:bg-gray-900",
  low: "border-l-4 border-gray-300 bg-white dark:bg-gray-900",
};

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
  const icon = TYPE_ICONS[notification.type] ?? "📬";
  const priorityStyle = PRIORITY_STYLES[notification.priority] ?? PRIORITY_STYLES.normal;

  const handleClick = () => {
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    onDismiss(toastId);
  };

  return (
    <div
      className={`
        ${visible ? "animate-in slide-in-from-right-full" : "animate-out slide-out-to-right-full"}
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black/5
        transition-all duration-300 ${priorityStyle}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0" aria-hidden>
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {notification.body}
            </p>
            {notification.action_url && (
              <button
                onClick={handleClick}
                className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View details
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss(toastId)}
            className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
