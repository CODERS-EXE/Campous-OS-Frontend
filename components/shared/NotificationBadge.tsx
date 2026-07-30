"use client";

import { Bell } from "lucide-react";
import { useNotificationCount } from "@/lib/hooks/useNotifications";
import { useWebSocket } from "@/lib/contexts/WebSocketContext";
import { useState } from "react";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBadge() {
  const { count, isLoading } = useNotificationCount();
  const { isConnected } = useWebSocket();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread count badge */}
        {count > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {count > 99 ? "99+" : count}
          </span>
        )}
        
        {/* Connection status indicator */}
        {isConnected && (
          <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <NotificationDropdown onClose={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
}
