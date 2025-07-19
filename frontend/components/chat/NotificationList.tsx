/* eslint-disable */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import NotificationItem from './NotificationItem';
import LoadingSpinner from './LoadingSpinner';
import { Search, CheckCheck, Trash2 } from 'lucide-react';

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

interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (notificationId: string) => Promise<any>;
  onDelete: (notificationId: string) => Promise<any>;
  onMarkAllRead: () => Promise<any>;
  onClearAll: () => Promise<any>;
}

export default function NotificationList({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onDelete,
  onMarkAllRead,
  onClearAll,
}: NotificationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRead = 
      filterRead === 'all' ||
      (filterRead === 'read' && notification.is_read) ||
      (filterRead === 'unread' && !notification.is_read);
    
    const matchesType = 
      filterType === 'all' || notification.notification_type === filterType;
    
    const matchesPriority = 
      filterPriority === 'all' || notification.priority === filterPriority;

    return matchesSearch && matchesRead && matchesType && matchesPriority;
  });

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'منخفضة';
      case 'medium':
        return 'متوسطة';
      case 'high':
        return 'عالية';
      case 'urgent':
        return 'عاجلة';
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            الإشعارات
            {unreadCount > 0 && (
              <Badge className="mr-2 bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </h2>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              تمييز الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              مسح المقروءة
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث في الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Select value={filterRead} onValueChange={(value) => setFilterRead(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإشعارات</SelectItem>
              <SelectItem value="unread">غير مقروءة</SelectItem>
              <SelectItem value="read">مقروءة</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="نوع الإشعار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="message">رسالة</SelectItem>
              <SelectItem value="mention">إشارة</SelectItem>
              <SelectItem value="system">نظام</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأولويات</SelectItem>
              <SelectItem value="urgent">عاجلة</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm || filterRead !== 'all' || filterType !== 'all' || filterPriority !== 'all'
              ? 'لا توجد إشعارات مطابقة للفلاتر'
              : 'لا توجد إشعارات'
            }
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
