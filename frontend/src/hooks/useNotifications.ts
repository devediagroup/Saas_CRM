import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Fetch notifications
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications({ page: 1, pageSize: 10 }),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Fetch unread count
  const unreadCountQuery = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => api.getUnreadCount(),
    refetchInterval: 30000,
    staleTime: 10000
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث الإشعار');
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث الإشعارات');
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => api.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('تم حذف الإشعار');
    },
    onError: () => {
      toast.error('حدث خطأ في حذف الإشعار');
    }
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: () => api.clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('تم حذف جميع الإشعارات');
    },
    onError: () => {
      toast.error('حدث خطأ في حذف الإشعارات');
    }
  });

  // Real-time updates using polling (can be enhanced with WebSockets later)
  useEffect(() => {
    const interval = setInterval(() => {
      // Refetch notifications if user is active
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [queryClient]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refetch when user returns to page
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  return {
    notifications: notificationsQuery.data?.data?.data || [],
    unreadCount: unreadCountQuery.data?.data?.count || 0,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    isError: notificationsQuery.isError || unreadCountQuery.isError,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearAll: clearAllMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isClearing: clearAllMutation.isPending,
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    }
  };
}; 