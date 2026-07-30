"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Notification } from "../api";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  type: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
  event_metadata?: Record<string, any>;
}

interface UnreadCountResponse {
  unread_count: number;
}

export function useNotifications(options?: {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const { notifications: liveNotifications } = useWebSocket();

  // Fetch notifications from API
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationResponse[]>({
    queryKey: ["notifications", options?.unreadOnly, options?.type, options?.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.unreadOnly) params.append("unread_only", "true");
      if (options?.type) params.append("notification_type", options.type);
      if (options?.limit) params.append("limit", options.limit.toString());

      const query = params.toString();
      return api.get<NotificationResponse[]>(
        `/api/v1/notifications${query ? `?${query}` : ""}`
      );
    },
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  // Fetch unread count
  const { data: unreadData } = useQuery<UnreadCountResponse>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get<UnreadCountResponse>("/api/v1/notifications/unread/count"),
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.post(`/api/v1/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as read: ${error.message}`);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.post("/api/v1/notifications/mark-all-read", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark all as read: ${error.message}`);
    },
  });

  // Delete notification mutation (admin only)
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      api.delete(`/api/v1/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete notification: ${error.message}`);
    },
  });

  // Refetch when new live notifications arrive
  useEffect(() => {
    if (liveNotifications.length > 0) {
      // Refetch to get the latest from server
      refetch();
    }
  }, [liveNotifications.length, refetch]);

  return {
    notifications,
    unreadCount: unreadData?.unread_count ?? 0,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}

// Hook specifically for unread notifications
export function useUnreadNotifications() {
  return useNotifications({ unreadOnly: true });
}

// Hook for notification count badge
export function useNotificationCount() {
  const { data: unreadData, isLoading } = useQuery<UnreadCountResponse>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get<UnreadCountResponse>("/api/v1/notifications/unread/count"),
    refetchInterval: 30000,
  });

  const { notifications: liveNotifications } = useWebSocket();

  // Combine API count with live notifications
  const baseCount = unreadData?.unread_count ?? 0;
  const liveCount = liveNotifications.length;
  const totalCount = baseCount + liveCount;

  return {
    count: totalCount,
    isLoading,
  };
}

// Hook for creating/broadcasting notifications (admin only)
export function useCreateNotification() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      body: string;
      type?: string;
      priority?: string;
      target_scope?: string;
      role?: string;
      department?: string;
      action_url?: string;
      event_metadata?: Record<string, any>;
    }) => api.post("/api/v1/notifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send notification: ${error.message}`);
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: (data: {
      title: string;
      body: string;
      type?: string;
      priority?: string;
      target_scope?: string;
      target_roles?: string[];
      college_id?: string;
      action_url?: string;
      event_metadata?: Record<string, any>;
    }) => api.post("/api/v1/notifications/broadcast", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Broadcast sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send broadcast: ${error.message}`);
    },
  });

  return {
    createNotification: createMutation.mutate,
    broadcastNotification: broadcastMutation.mutate,
    isCreating: createMutation.isPending,
    isBroadcasting: broadcastMutation.isPending,
  };
}
