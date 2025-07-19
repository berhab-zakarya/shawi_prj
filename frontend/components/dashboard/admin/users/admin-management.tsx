"use client"

import { useState } from "react"
import { useAdminManagement } from "@/hooks/useAdminManagement"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Bell, UserPlus, Settings } from "lucide-react"
import UsersList from "./users-list"
import UserDetails from "./user-details"
import CreateNotification from "./create-notification"
import NotificationsList from "./notifications-list"

type ActiveView = "users" | "user-details" | "create-notification" | "notifications"

export default function AdminManagement() {
  const [activeView, setActiveView] = useState<ActiveView>("users")

  const {
    users,
    selectedUser,
    notifications,
    loading,
    errorMessage,
    getUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    toggleUserActive,
    createNotification,
    getNotifications,
    markNotificationRead,
  } = useAdminManagement()

  const handleViewUser = async (userId: number) => {
    try {
      await getUserDetails(userId)
      setActiveView("user-details")
    } catch (error) {
      console.error("خطأ في جلب تفاصيل المستخدم:", error)
    }
  }

  const handleBackToUsers = () => {
    setActiveView("users")
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "users":
        return (
          <UsersList
            users={users}
            loading={loading}
            onViewUser={handleViewUser}
            onToggleActive={toggleUserActive}
            onDeleteUser={deleteUser}
            onRefresh={getUsers}
          />
        )
      case "user-details":
        return selectedUser ? (
          <UserDetails user={selectedUser} loading={loading} onUpdateUser={updateUser} onBack={handleBackToUsers} />
        ) : null
      case "create-notification":
        return (
          <CreateNotification
            users={users}
            loading={loading}
            onCreateNotification={createNotification}
            onBack={() => setActiveView("users")}
          />
        )
      case "notifications":
        return (
          <NotificationsList
            notifications={notifications}
            loading={loading}
            onMarkAsRead={markNotificationRead}
            onRefresh={getNotifications}
            onBack={() => setActiveView("users")}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة إدارة المستخدمين</h1>
        <p className="text-gray-600">إدارة المستخدمين والإشعارات في النظام</p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            التنقل السريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeView === "users" ? "default" : "outline"}
              onClick={() => setActiveView("users")}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              قائمة المستخدمين
            </Button>
            <Button
              variant={activeView === "create-notification" ? "default" : "outline"}
              onClick={() => setActiveView("create-notification")}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              إنشاء إشعار
            </Button>
            <Button
              variant={activeView === "notifications" ? "default" : "outline"}
              onClick={() => setActiveView("notifications")}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              الإشعارات ({notifications.filter((n) => !n.read).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="min-h-[600px]">{renderActiveView()}</div>
    </div>
  )
}
