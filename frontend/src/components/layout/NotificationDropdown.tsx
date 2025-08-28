import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  X,
  Clock,
  AlertCircle,
  User,
  Handshake,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    isMarkingAllAsRead,
    isDeleting,
    isClearing
  } = useNotifications();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string, actionType: string) => {
    if (actionType === 'lead_created') return <User className="h-4 w-4 text-blue-500" />;
    if (actionType === 'deal_created') return <Handshake className="h-4 w-4 text-green-500" />;
    if (actionType === 'whatsapp_message') return <MessageSquare className="h-4 w-4 text-green-600" />;
    
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 arabic-text">
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="text-base flex items-center gap-2">
            الإشعارات
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DropdownMenuLabel>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAllAsRead()}
                className="text-xs"
                disabled={isMarkingAllAsRead}
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                تحديد الكل كمقروء
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => clearAll()}
              className="text-xs text-red-500 hover:text-red-600"
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              مسح الكل
            </Button>
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">لا توجد إشعارات</p>
              <p className="text-xs mt-1">ستظهر الإشعارات الجديدة هنا</p>
            </div>
          ) : (
            notifications.map((notification: any) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  !notification.is_read ? 'bg-accent/20 border-r-2 border-r-blue-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                      {notification.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          عاجل
                        </Badge>
                      )}
                      {notification.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs px-1 py-0 animate-pulse">
                          عاجل جداً
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button 
              variant="ghost" 
              className="w-full text-sm hover:bg-accent/50"
              onClick={() => navigate('/notifications')}
            >
              عرض جميع الإشعارات ({notifications.length})
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown; 