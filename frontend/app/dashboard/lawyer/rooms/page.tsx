"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import RoomList from "@/components/chat/RoomList"
import NotificationList from "@/components/chat/NotificationList"
import LoadingSpinner from "@/components/chat/LoadingSpinner"
import { MessageCircle, Bell } from "lucide-react"
import { useChatAPI } from "@/hooks/useChatApi"
import { useNotification } from "@/hooks/useNotifications"

export default function ClientsRoomPage() {
    const { getActiveUsers, createRoom, rooms, loading, error } = useChatAPI()
    const { 
        unreadCount, 
        notifications, 
        loading: loadingNotification, 
        markNotificationRead, 
        deleteNotification, 
        markAllNotificationsRead, 
        clearAllNotifications 
    } = useNotification()
    
    const [view, setView] = useState<"rooms" | "notifications">("rooms")
   

    const handleSelectRoom = (roomName: string) => {
        window.location.href = `/dashboard/client/rooms/${roomName}`
    }

    if (error.type === "authentication") {
        return (
            <div dir="rtl" className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">يرجى تسجيل الدخول</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">تحتاج إلى تسجيل الدخول للوصول إلى الدردشة</p>
                    <Button onClick={() => (window.location.href = "/login")}>تسجيل الدخول</Button>
                </div>
            </div>
        )
    }

    return (
        <main dir="rtl" className="flex h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 bg-white dark:bg-gray-800">
                <Tabs
                    value={view}
                    onValueChange={(value) => setView(value as "rooms" | "notifications")}
                    className="h-full"
                >
                    <TabsList className="grid w-full grid-cols-2 m-2">
                        <TabsTrigger value="rooms" className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            غرف الدردشة
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            الإشعارات
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-1">{unreadCount}</span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="rooms" className="h-[calc(100%-4rem)] m-0">
                        <RoomList
                            rooms={rooms}
                            userStatus={{}} 
                            loading={loading.rooms}
                            onSelectRoom={handleSelectRoom}
                            onCreateRoom={createRoom}
                            onGetActiveUsers={getActiveUsers}
                            activeRoom={null} 
                        />
                    </TabsContent>

                    <TabsContent value="notifications" className="h-[calc(100%-4rem)] m-0">
                        <NotificationList
                            notifications={notifications}
                            unreadCount={unreadCount}
                            loading={loadingNotification.notifications}
                            onMarkRead={markNotificationRead}
                            onDelete={deleteNotification}
                            onMarkAllRead={markAllNotificationsRead}
                            onClearAll={clearAllNotifications}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {(loading.rooms || loadingNotification.notifications || loadingNotification.websocket) && <LoadingSpinner />}
        </main>
    )
}