"use client"

import { useState } from "react"
import type { Notification } from "@/types/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Bell,
  RefreshCw,
  Mail,
  MailOpen,
  AlertTriangle,
  Info,
  CheckCircle,
  User,
  Calendar,
  Filter,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NotificationsListProps {
  notifications: Notification[]
  loading: boolean
  onMarkAsRead: (id: number) => Promise<void>
  onRefresh: () => Promise<void>
  onBack: () => void
}

export default function NotificationsList({
  notifications,
  loading,
  onMarkAsRead,
  onRefresh,
  onBack,
}: NotificationsListProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all")

  const filteredNotifications = notifications.filter((notification) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "read" && notification.read) ||
      (statusFilter === "unread" && !notification.read)

    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter

    return matchesStatus && matchesPriority
  })

  const handleMarkAsRead = async (id: number) => {
    try {
      await onMarkAsRead(id)
    } catch (error) {
      console.error("خطأ في تمييز الإشعار كمقروء:", error)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "MEDIUM":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "LOW":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "border-red-200 bg-red-50"
      case "MEDIUM":
        return "border-yellow-200 bg-yellow-50"
      case "LOW":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            الإشعارات ({filteredNotifications.length})
            {unreadCount > 0 && (
              <Badge variant="destructive" className="mr-2">
                {unreadCount} غير مقروء
              </Badge>
            )}
          </h2>
        </div>
        <Button onClick={onRefresh} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            التصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الإشعارات</SelectItem>
                <SelectItem value="unread">غير مقروءة</SelectItem>
                <SelectItem value="read">مقروءة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    عالية
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-yellow-500" />
                    متوسطة
                  </div>
                </SelectItem>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    منخفضة
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="mr-2 text-gray-600">جاري التحميل...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">لا توجد إشعارات مطابقة للتصفية</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${!notification.read ? "border-blue-200 bg-blue-50/30" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(notification.priority)}
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          جديد
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{notification.message}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>إلى: {notification.user_email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>من: {notification.created_by_email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(notification.created_at).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center gap-1"
                      >
                        <MailOpen className="h-3 w-3" />
                        تمييز كمقروء
                      </Button>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {notification.read ? (
                        <>
                          <MailOpen className="h-3 w-3" />
                          مقروء
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3" />
                          غير مقروء
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
