"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoomList from "@/components/chat/RoomList"
import ChatWindow from "@/components/chat/ChatWindow"
import NotificationList from "@/components/chat/NotificationList"
import LoadingSpinner from "@/components/chat/LoadingSpinner"
import { MessageCircle, Bell, ArrowRight } from "lucide-react"
import { usePathname } from "next/navigation"
import { useChatAPI } from "@/hooks/useChatApi"
import { useWebSocketChat } from "@/hooks/websockets/use-websocket-chat"
import { useNotification } from "@/hooks/useNotifications"
import { useProfile } from "@/hooks/use-profile"

export default function ChatPage() {

    const pathname = usePathname();
    // const {
    //     rooms,
    //     messages,
    //     notifications,
    //     unreadCount,
    //     typingStatus,
    //     userStatus,
    //     loading,
    //     error,
    //     getActiveUsers,
    //     getRooms,
    //     createRoom,
    //     getMessageHistory,
    //     sendMessage,
    //     editMessage,
    //     markMessageRead,
    //     addReaction,
    //     uploadFile,
    //     markNotificationRead,
    //     deleteNotification,
    //     markAllNotificationsRead,
    //     clearAllNotifications,
    //     sendTypingStatus,
    //     initializeWebSockets,
    //     closeWebSockets,
    //     resetError,
    // } = useChat()

    const { getMessageHistory, getActiveUsers,  createRoom, rooms, messages, error, loading } = useChatAPI();
    const { sendMessage, connectToRoom, sendTypingStatus, userStatus, typingStatus } = useWebSocketChat();
    const { unreadCount, notifications, loading: loadingNotification, markNotificationRead, clearAllNotifications, deleteNotification, markAllNotificationsRead, } = useNotification()
    const [errorRoom, setErrorRoom] = useState("");
    const [activeRoom, setActiveRoom] = useState<string | null>(null)
    const { user } = useProfile();
    useEffect(() => {
        const roomName = pathname.split('/').pop()
        if (roomName) {
            setActiveRoom(roomName)
            getHistory(roomName)
        }
    }, [pathname, getMessageHistory])
    const getHistory = (roomName: string) => {
        getMessageHistory(roomName).then((data) => {
            if (data) {
                connectToRoom(roomName)
                console.log("Message history fetched for room:", roomName)
            } else {
                setErrorRoom("لا توجد أي غرفة بهذا الإسم")
                console.error("Failed to fetch message history for room:", roomName)
            }
        }).catch((e) => {
            if (e.type == "validation")
                setErrorRoom("لا توجد أي غرفة بهذا الإسم")
            console.log(e)
        })
    }
    useEffect(() => {
        if (activeRoom) {
            getHistory(activeRoom)
        }
    }, [sendMessage,getHistory])

    
    const [view, setView] = useState<"rooms" | "notifications">("rooms")
    const [isMobile, setIsMobile] = useState(false)
    const [mobileView, setMobileView] = useState<"list" | "chat">("list")

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }

        checkMobile()
        window.addEventListener("resize", checkMobile)

        return () => window.removeEventListener("resize", checkMobile)
    }, [])



    const handleSelectRoom = (roomName: string) => {
        window.location.href = `/dashboard/client/rooms/${roomName}`
    }

    const handleSendMessage = async (content: string) => {
        if (!activeRoom) return
        try {
            sendMessage(content);
        } catch (err) {
            console.error("Failed to send message:", err)
        }
    }

    const handleBackToList = () => {
        setMobileView("list")
        setActiveRoom(null)
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
            {/* <ErrorToast error={error} resetError={resetError} /> */}


            {/* Desktop Layout */}
            {!isMobile && (
                <>
                    {/* Sidebar */}
                    <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                                    userStatus={userStatus}
                                    loading={loading.rooms}
                                    onSelectRoom={handleSelectRoom}
                                    onCreateRoom={createRoom}
                                    onGetActiveUsers={getActiveUsers}
                                    activeRoom={activeRoom}
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

                    {/* Chat Area */}
                    <div className="flex-1">
                        {(activeRoom && user) ? (
                            <ChatWindow
                                roomName={activeRoom}
                                messages={messages[activeRoom] || []}
                                typingStatus={typingStatus}
                                userStatus={userStatus}
                                loading={false}
                                onSendMessage={handleSendMessage}
                                onTyping={sendTypingStatus}
                                CURRENT_USER_ID={user.user_id || ""}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center min-h-[60vh] flex justify-center items-center">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg text-red-700">{errorRoom}    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Mobile Layout */}
            {isMobile && (
                <div className="flex-1">
                    {mobileView === "list" ? (
                        <div className="h-full bg-white dark:bg-gray-800">
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
                                        userStatus={userStatus}
                                        loading={loading.rooms}
                                        onSelectRoom={handleSelectRoom}
                                        onCreateRoom={createRoom}
                                        onGetActiveUsers={getActiveUsers}
                                        activeRoom={activeRoom}
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
                    ) : (
                        <div className="h-full">
                            <div className="flex items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <Button variant="ghost" size="sm" onClick={handleBackToList} className="ml-2">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                                <h2 className="font-semibold text-gray-900 dark:text-white">{activeRoom}</h2>
                            </div>
                            {(activeRoom && user) ? (
                                <ChatWindow
                                    roomName={activeRoom}
                                    messages={messages[activeRoom] || []}
                                    typingStatus={typingStatus}
                                    userStatus={userStatus}
                                    loading={false}
                                    onSendMessage={handleSendMessage}
                                    onTyping={sendTypingStatus}
                                    CURRENT_USER_ID={user?.user_id || ""} />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <div className="text-center flex justify-center items-center">
                                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">{errorRoom}    </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {(loading.rooms || loadingNotification.notifications || loadingNotification.websocket) && <LoadingSpinner />}
        </main>
    )
}
