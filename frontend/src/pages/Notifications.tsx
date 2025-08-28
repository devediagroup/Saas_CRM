import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Check, 
  X, 
  Archive, 
  Trash2, 
  Filter, 
  Search, 
  RefreshCw,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  MessageCircle,
  Settings,
  Eye,
  EyeOff,
  MoreVertical,
  CheckCheck,
  Trash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  is_archived: boolean;
  link?: string;
  action_type: string;
  sent_at: string;
  read_at?: string;
  archived_at?: string;
  createdAt: string;
}

const Notifications = () => {
  const { t } = useTranslation();
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', currentPage, pageSize, typeFilter, priorityFilter, statusFilter, searchTerm],
    queryFn: () => api.getNotifications({
      page: currentPage,
      pageSize,
      ...(typeFilter !== 'all' && { type: typeFilter }),
      ...(priorityFilter !== 'all' && { priority: priorityFilter }),
      ...(statusFilter === 'read' && { is_read: true }),
      ...(statusFilter === 'unread' && { is_read: false }),
      ...(statusFilter === 'archived' && { is_archived: true }),
      ...(searchTerm && { search: searchTerm })
    }),
    refetchInterval: 30000,
    staleTime: 10000
  });

  // Get notifications stats
  const { data: statsData } = useQuery({
    queryKey: ['notifications-stats'],
    queryFn: async () => {
      const [unreadCount, totalCount] = await Promise.all([
        api.getUnreadCount(),
        api.getNotifications({ pageSize: 1 })
      ]);
      return {
        unread: unreadCount.data?.count || 0,
        total: totalCount.data?.meta?.pagination?.total || 0,
        read: (totalCount.data?.meta?.pagination?.total || 0) - (unreadCount.data?.count || 0)
      };
    },
    refetchInterval: 30000
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success(t('notifications.actions.markReadSuccess'));
    },
    onError: () => {
      toast.error(t('notifications.actions.error'));
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success(t('notifications.actions.markAllRead'));
    },
    onError: () => {
      toast.error(t('notifications.actions.error'));
    }
  });

  // Archive notification mutation
  const archiveNotificationMutation = useMutation({
    mutationFn: (id: number) => api.archiveNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success(t('notifications.actions.archiveNotification'));
    },
    onError: () => {
      toast.error(t('notifications.actions.error'));
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => api.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success(t('notifications.actions.deleteNotification'));
    },
    onError: () => {
      toast.error(t('notifications.actions.error'));
    }
  });

  // Clear all notifications mutation
  const clearAllNotificationsMutation = useMutation({
    mutationFn: () => api.clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      setSelectedNotifications([]);
      toast.success(t('notifications.actions.deleteAllSuccess'));
    },
    onError: () => {
      toast.error(t('notifications.actions.error'));
    }
  });

  const notifications = notificationsData?.data?.data || [];
  const pagination = notificationsData?.data?.meta?.pagination;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      normal: 'outline',
      high: 'default',
      urgent: 'destructive'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {t(`notifications.priorities.${priority}`)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      info: 'secondary',
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      reminder: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {t(`notifications.types.${type}`)}
      </Badge>
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, id]);
    } else {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedNotifications.length === 0) {
      toast.error(t('notifications.bulk.noSelection'));
      return;
    }

    switch (action) {
      case 'markRead':
        selectedNotifications.forEach(id => markAsReadMutation.mutate(id));
        break;
      case 'archive':
        selectedNotifications.forEach(id => archiveNotificationMutation.mutate(id));
        break;
      case 'delete':
        selectedNotifications.forEach(id => deleteNotificationMutation.mutate(id));
        break;
    }
    setSelectedNotifications([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadPercentage = () => {
    if (!statsData) return 0;
    return statsData.total > 0 ? (statsData.read / statsData.total) * 100 : 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground arabic-text">{t('notifications.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('notifications.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="gap-2 arabic-text"
            >
              <RefreshCw className="h-4 w-4" />
              {t('notifications.refresh')}
            </Button>
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || !statsData?.unread}
              size="sm"
              className="gap-2 arabic-text"
            >
              <CheckCheck className="h-4 w-4" />
              {t('notifications.markAllRead')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Bell className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{statsData?.total || 0}</p>
                  <p className="text-sm text-muted-foreground arabic-text">{t('notifications.stats.totalNotifications')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <EyeOff className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-500">{statsData?.unread || 0}</p>
                  <p className="text-sm text-muted-foreground arabic-text">{t('notifications.stats.unread')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">{statsData?.read || 0}</p>
                  <p className="text-sm text-muted-foreground arabic-text">{t('notifications.stats.read')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium arabic-text">{t('notifications.stats.readRate')}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(getReadPercentage())}%</p>
                </div>
                <Progress value={getReadPercentage()} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('notifications.filters.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 arabic-text"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="arabic-text">
                  <SelectValue placeholder={t('notifications.filters.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.filters.allTypes')}</SelectItem>
                  <SelectItem value="info">{t('notifications.types.info')}</SelectItem>
                  <SelectItem value="success">{t('notifications.types.success')}</SelectItem>
                  <SelectItem value="warning">{t('notifications.types.warning')}</SelectItem>
                  <SelectItem value="error">{t('notifications.types.error')}</SelectItem>
                  <SelectItem value="reminder">{t('notifications.types.reminder')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="arabic-text">
                  <SelectValue placeholder={t('notifications.filters.priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.filters.allPriorities')}</SelectItem>
                  <SelectItem value="urgent">{t('notifications.priorities.urgent')}</SelectItem>
                  <SelectItem value="high">{t('notifications.priorities.high')}</SelectItem>
                  <SelectItem value="normal">{t('notifications.priorities.normal')}</SelectItem>
                  <SelectItem value="low">{t('notifications.priorities.low')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="arabic-text">
                  <SelectValue placeholder={t('notifications.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('notifications.filters.allStatuses')}</SelectItem>
                  <SelectItem value="unread">{t('notifications.filters.unread')}</SelectItem>
                  <SelectItem value="read">{t('notifications.filters.read')}</SelectItem>
                  <SelectItem value="archived">{t('notifications.filters.archived')}</SelectItem>
                </SelectContent>
              </Select>

              {selectedNotifications.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 arabic-text">
                      {t('notifications.filters.selectedCount', { count: selectedNotifications.length })}
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="arabic-text">
                    <DropdownMenuItem onClick={() => handleBulkAction('markRead')}>
                      <Check className="h-4 w-4 ml-2" />
                      {t('notifications.actions.markRead')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                      <Archive className="h-4 w-4 ml-2" />
                      {t('notifications.actions.archive')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      {t('notifications.actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 arabic-text">
              <Bell className="h-5 w-5" />
              {t('notifications.table.notification')} {t('notifications.empty.notifications')}
              {pagination && (
                <Badge variant="secondary" className="mr-2">
                  {pagination.total} {t('notifications.empty.notifications')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium arabic-text">{t('notifications.empty.title')}</p>
                <p className="text-muted-foreground arabic-text">{t('notifications.empty.description')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    checked={selectedNotifications.length === notifications.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <div className="flex-1 grid grid-cols-6 gap-4 text-sm font-medium arabic-text">
                    <div>{t('notifications.table.notification')}</div>
                    <div>{t('notifications.table.type')}</div>
                    <div>{t('notifications.table.priority')}</div>
                    <div>{t('notifications.table.status')}</div>
                    <div>{t('notifications.table.date')}</div>
                    <div>{t('notifications.table.actions')}</div>
                  </div>
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {notifications.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                          !notification.is_read ? 'bg-accent/20 border-accent' : 'bg-background'
                        } ${notification.is_archived ? 'opacity-60' : ''}`}
                      >
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) => handleSelectNotification(notification.id, !!checked)}
                        />
                        
                        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                          {/* Notification Content */}
                          <div 
                            className="flex items-start gap-3 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {getNotificationIcon(notification.type)}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium arabic-text truncate">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground arabic-text line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>

                          {/* Type */}
                          <div>
                            {getTypeBadge(notification.type)}
                          </div>

                          {/* Priority */}
                          <div>
                            {getPriorityBadge(notification.priority)}
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            {notification.is_archived && (
                              <Archive className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm arabic-text">
                              {notification.is_archived ? t('notifications.statuses.archived') : notification.is_read ? t('notifications.statuses.read') : t('notifications.statuses.unread')}
                            </span>
                          </div>

                          {/* Date */}
                          <div className="text-sm text-muted-foreground">
                            {formatDate(notification.sent_at)}
                          </div>

                          {/* Actions */}
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="arabic-text">
                                {!notification.is_read && (
                                  <DropdownMenuItem onClick={() => markAsReadMutation.mutate(notification.id)}>
                                    <Check className="h-4 w-4 ml-2" />
                                    {t('notifications.actions.markRead')}
                                  </DropdownMenuItem>
                                )}
                                {!notification.is_archived && (
                                  <DropdownMenuItem onClick={() => archiveNotificationMutation.mutate(notification.id)}>
                                    <Archive className="h-4 w-4 ml-2" />
                                    {t('notifications.actions.archive')}
                                  </DropdownMenuItem>
                                )}
                                {notification.link && (
                                  <DropdownMenuItem onClick={() => navigate(notification.link!)}>
                                    <Eye className="h-4 w-4 ml-2" />
                                    {t('notifications.actions.viewDetails')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  {t('notifications.actions.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Pagination */}
                {pagination && pagination.pageCount > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground arabic-text">
                      {t('notifications.pagination.showing', {
                        from: ((currentPage - 1) * pageSize) + 1,
                        to: Math.min(currentPage * pageSize, pagination.total),
                        total: pagination.total
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {t('notifications.pagination.previous')}
                      </Button>
                      <span className="text-sm">
                        {currentPage} {t('notifications.pagination.of')} {pagination.pageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pageCount}
                      >
                        {t('notifications.pagination.next')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {statsData && statsData.total > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive arabic-text">
                <AlertTriangle className="h-5 w-5" />
                {t('notifications.dangerZone.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium arabic-text">{t('notifications.dangerZone.deleteAll')}</p>
                  <p className="text-sm text-muted-foreground arabic-text">
                    {t('notifications.dangerZone.deleteAllDesc')}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => clearAllNotificationsMutation.mutate()}
                  disabled={clearAllNotificationsMutation.isPending}
                  className="gap-2 arabic-text"
                >
                  <Trash className="h-4 w-4" />
                  {t('notifications.dangerZone.deleteAllButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications; 