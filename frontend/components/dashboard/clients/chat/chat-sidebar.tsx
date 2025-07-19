/* eslint-disable */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search, MessageCircle, Users, UserIcon } from 'lucide-react'
import { ChatRoom, User } from "@/types/chat"
import { CreateRoomDialog } from "./create-room-dialog"

interface ChatSidebarProps {
rooms: ChatRoom[]
onlineUsers: User[]
activeRoom: ChatRoom | null
joinRoom: (roomName: string) => void
createAndJoinRoom: (roomData: {
  name: string
  room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
  participants: string[]
}) => void
isLoading: boolean
allUsers: User[] // All users for creating new rooms
}

export function ChatSidebar({
rooms,
onlineUsers,
activeRoom,
joinRoom,
createAndJoinRoom,
isLoading,
allUsers,
}: ChatSidebarProps) {
const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false)
const [searchTerm, setSearchTerm] = useState("")

const filteredRooms = rooms.filter((room) =>
  room.name.toLowerCase().includes(searchTerm.toLowerCase())
)

return (
  <div className="flex flex-col h-full border-l rtl:border-r rtl:border-l-0 bg-background">
    <CardHeader className="pb-4 text-right">
      <CardTitle className="flex items-center justify-between">
        <span>المحادثات</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreateRoomDialogOpen(true)}
          aria-label="إنشاء غرفة محادثة جديدة"
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </CardTitle>
      <div className="relative mt-2">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن محادثة..."
          className="w-full ps-9 text-right"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </CardHeader>
    <CardContent className="flex-1 overflow-hidden p-0">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-right">الغرف</h3>
          {filteredRooms.length === 0 ? (
            <p className="text-muted-foreground text-sm text-right">
              لا توجد غرف متاحة.
            </p>
          ) : (
            <div className="grid gap-2">
              {filteredRooms.map((room) => (
                <Button
                  key={room.id}
                  variant={activeRoom?.id === room.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto py-2 px-3 text-right"
                  onClick={() => joinRoom(room.name)}
                >
                  <div className="flex items-center gap-3">
                    {room.room_type === "ONE_TO_ONE" ? (
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Users className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{room.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {room.room_type === "ONE_TO_ONE"
                          ? "محادثة فردية"
                          : room.room_type === "GROUP"
                          ? "مجموعة"
                          : "دعم"}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t rtl:border-r-0 rtl:border-l border-border">
          <h3 className="mb-2 text-lg font-semibold text-right">المستخدمون المتصلون</h3>
          {onlineUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-right">
              لا يوجد مستخدمون متصلون حاليًا.
            </p>
          ) : (
            <div className="grid gap-2">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 text-right">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.fullname || user.email} />
                    <AvatarFallback>
                      {user.fullname
                        ? user.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : user.email[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.fullname || user.email}</span>
                  <span className="h-2 w-2 rounded-full bg-green-500 ms-auto rtl:me-auto rtl:ms-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>

    <CreateRoomDialog
      isOpen={isCreateRoomDialogOpen}
      onClose={() => setIsCreateRoomDialogOpen(false)}
      onCreate={createAndJoinRoom}
      allUsers={allUsers}
      isLoading={isLoading}
    />
  </div>
)
}
