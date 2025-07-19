"use client"

import * as React from "react"
import { Bell,  LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/hooks/use-profile"
import { useRouter } from "next/navigation"
import { logoutUser } from "@/lib/logOut"
import { useWebSocketChat } from "@/hooks/websockets/use-websocket-chat"
import { useNotification } from "@/hooks/useNotifications"
import { Notification as NT} from "@/types/notification"

export function Header() {
  const { user, } = useProfile()
  const { isPresenceConnected } = useWebSocketChat()
  const { unreadCount, notifications, markAllNotificationsRead } = useNotification()
  const getRoleLabel = () => {
    switch (user.role) {
      case "Client":
        return "عميل"
      case "Lawyer":
        return "محامي"
      case "Admin":
        return "مدير"
      default:
        return "مستخدم"
    }
  }

  const getRoleInitial = () => {
    switch (user.role) {
      case "Client":
        return "ع"
      case "Lawyer":
        return "م"
      case "Admin":
        return "إ"
      default:
        return "؟"
    }
  }
  const router = useRouter();


  const handleLogout = () => {
    logoutUser()
    router.push("/auth")
  }


  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-2">
        {/* <div className="relative max-w-md flex-1">
            <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="البحث في النظام..." className="pr-8" />
          </div> */}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications (commented) */}
       <DropdownMenu
  onOpenChange={(open) => {
    if (open) {
      setTimeout(() => {
        markAllNotificationsRead();
      }, 10000); // 10000ms = 10 seconds
    }
  }}
>

          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-black text-sm">لا توجد إشعارات</div>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                {notifications.map((notification: NT) => (
                  <div
                    key={notification.id}
                    className={`rounded-md p-2 border ${notification.is_read ? "bg-white" : "bg-gray-100"} shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-black">{notification.title}</span>
                      <span className={`text-xs ${notification.priority === "urgent" ? "text-red-600" : "text-gray-400"}`}>
                        {notification.time_since}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 mb-1">{notification.message}</div>
                    {notification.action_url && notification.action_text && (
                      <a
                        href={notification.action_url}
                        className="text-xs text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {notification.action_text}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 cursor-pointer">
              <span className="relative flex h-10 w-10">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || "/profile.png"} alt="Profile" className="h-10 w-10" />
                  <AvatarFallback>{getRoleInitial()}</AvatarFallback>
                </Avatar>
                {isPresenceConnected && (
                  <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getRoleLabel()}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/me/")}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

