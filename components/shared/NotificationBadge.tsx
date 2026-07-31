"use client";

import { useState } from "react";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationCount } from "@/lib/hooks/useNotifications";
import { useWebSocket } from "@/lib/contexts/WebSocketContext";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBadge() {
  const { count } = useNotificationCount();
  const { isConnected } = useWebSocket();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formattedCount = count > 99 ? "99+" : count;

  return (
    <div className="relative inline-block">
      {/* Bell Button */}
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 ${
          isDropdownOpen
            ? "border-primary/50 bg-primary/10 text-primary shadow-md scale-105 ring-2 ring-primary/20"
            : "border-border/60 bg-card/70 backdrop-blur-md text-foreground/80 hover:text-foreground hover:bg-muted/80 hover:scale-105 hover:shadow-md active:scale-95"
        }`}
        aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ""}`}
        title={isConnected ? "Realtime Notifications Live" : "Offline"}
      >
        <Bell className={`h-5 w-5 transition-transform duration-300 ${count > 0 ? "animate-pulse text-primary" : ""}`} />

        {/* Unread Count Badge */}
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center">
            {/* Pulsing Outer Ring */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            {/* Badge Pill */}
            <span className="relative flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 px-1.5 text-[10px] font-extrabold text-white shadow-lg ring-2 ring-background">
              {formattedCount}
            </span>
          </span>
        )}

        {/* Connection Status Dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background flex items-center justify-center transition-colors ${
            isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500"
          }`}
          title={isConnected ? "Connected to WebSocket" : "Reconnecting..."}
        >
          {isConnected ? (
            <span className="h-1 w-1 rounded-full bg-white animate-ping" />
          ) : (
            <span className="h-1 w-1 rounded-full bg-white" />
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <NotificationDropdown onClose={() => setIsDropdownOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
