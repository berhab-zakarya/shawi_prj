/* eslint-disable */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCheck, Trash2,  MoreHorizontal, Bell, MessageCircle,  Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  time_since: string;
  action_url: string | null;
  action_text: string | null;
  content_object: any;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (notificationId: string) => Promise<any>;
  onDelete: (notificationId: string) => Promise<any>;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="w-4 h-4" />;
    case 'mention':
      return <Bell className="w-4 h-4" />;
    case 'system':
      return <Info className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'عاجلة';
    case 'high':
      return 'عالية';
    case 'medium':
      return 'متوسطة';
    case 'low':
      return 'منخفضة';
    default:
      return priority;
  }
};

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const handleMarkRead = async () => {
    if (!notification.is_read) {
      try {
        await onMarkRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(notification.id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleAction = () => {
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
        !notification.is_read
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : ''
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.notification_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {notification.title}
                </h4>
                <Badge
                  className={`${getPriorityColor(notification.priority)} text-white text-xs`}
                >
                  {getPriorityLabel(notification.priority)}
                </Badge>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.time_since}
                </span>
                
                {/* {notification.action_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAction}
                    className="flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {notification.action_text || 'عرض'}
                  </Button>
                )} */}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.is_read && (
                <DropdownMenuItem onClick={handleMarkRead}>
                  <CheckCheck className="w-4 h-4 ml-2" />
                  تمييز كمقروء
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
