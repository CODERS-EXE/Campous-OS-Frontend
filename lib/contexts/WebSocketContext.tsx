"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "../store/auth";
import { toast } from "react-hot-toast";

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  priority: string;
  created_at: string;
  action_url?: string;
  event_metadata?: Record<string, any>;
}

interface WebSocketMessage {
  type: "notification" | "connection" | "heartbeat" | "ack";
  status?: string;
  message?: string;
  data?: NotificationData;
}

interface WebSocketContextType {
  isConnected: boolean;
  notifications: NotificationData[];
  unreadCount: number;
  sendMessage: (message: string) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const RECONNECT_INTERVAL = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldConnectRef = useRef(false);
  
  const { user, accessToken, isAuthenticated } = useAuthStore();

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    clearTimers();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, [clearTimers]);

  const connect = useCallback(() => {
    // Don't connect if not authenticated or already connected
    if (!isAuthenticated || !user || !accessToken) {
      return;
    }

    // Don't connect if already connecting/connected
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    shouldConnectRef.current = true;

    try {
      const wsUrl = `${WS_URL}/ws/${user.id}?token=${accessToken}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          // Handle pong response
          if (event.data === "pong") {
            return;
          }

          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case "connection":
              console.log("[WebSocket] Connection confirmed:", message.message);
              break;
              
            case "notification":
              if (message.data) {
                console.log("[WebSocket] New notification:", message.data);
                
                // Add to notifications list
                setNotifications((prev) => [message.data!, ...prev]);
                setUnreadCount((prev) => prev + 1);
                
                // Show toast notification
                const priorityEmoji = {
                  urgent: "🚨",
                  high: "⚠️",
                  normal: "📬",
                  low: "📨",
                }[message.data.priority] || "📬";
                
                toast.custom(
                  (t) => (
                    <div
                      className={`${
                        t.visible ? "animate-enter" : "animate-leave"
                      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            <span className="text-2xl">{priorityEmoji}</span>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {message.data!.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {message.data!.body}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex border-l border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => toast.dismiss(t.id)}
                          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ),
                  {
                    duration: 5000,
                    position: "top-right",
                  }
                );
              }
              break;
              
            case "ack":
              // Acknowledgment received
              break;
              
            default:
              console.log("[WebSocket] Unknown message type:", message);
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      ws.onclose = (event) => {
        console.log("[WebSocket] Disconnected:", event.code, event.reason);
        setIsConnected(false);
        clearTimers();
        
        // Attempt reconnection if we should be connected
        if (shouldConnectRef.current && isAuthenticated) {
          console.log("[WebSocket] Reconnecting in", RECONNECT_INTERVAL / 1000, "seconds...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
      
      // Retry connection
      if (shouldConnectRef.current && isAuthenticated) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_INTERVAL);
      }
    }
  }, [isAuthenticated, user, accessToken, clearTimers]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      console.warn("[WebSocket] Cannot send message: not connected");
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Connect when user logs in
  useEffect(() => {
    if (isAuthenticated && user && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, accessToken, connect, disconnect]);

  const value: WebSocketContextType = {
    isConnected,
    notifications,
    unreadCount,
    sendMessage,
    markAsRead,
    clearNotifications,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
