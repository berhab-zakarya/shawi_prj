/* eslint-disable */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import CreateRoomModal from "./CreateRoomModal"
import LoadingSpinner from "./LoadingSpinner"
import { Search, Plus, Users, Headphones, MessageCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { User } from "@/types"
import { ChatRoom } from "@/types/notification"
import { UserStatus } from "@/hooks/websockets/use-websocket-chat"





interface RoomListProps {
  rooms: ChatRoom[]
  userStatus: UserStatus
  loading: boolean
  onSelectRoom: (roomName: string) => void
  onCreateRoom: (data: any) => Promise<any>
  onGetActiveUsers: (search?: string) => Promise<User[]>
  activeRoom: string | null
}

const getRoomTypeLabel = (type: string) => {
  switch (type) {
    case "ONE_TO_ONE":
      return "واحد لواحد"
    case "GROUP":
      return "مجموعة"
    case "SUPPORT":
      return "دعم"
    default:
      return type
  }
}

const getRoomTypeIcon = (type: string) => {
  switch (type) {
    case "ONE_TO_ONE":
      return <MessageCircle className="w-4 h-4" />
    case "GROUP":
      return <Users className="w-4 h-4" />
    case "SUPPORT":
      return <Headphones className="w-4 h-4" />
    default:
      return <Users className="w-4 h-4" />
  }
}

const getRoomTypeColor = (type: string) => {
  switch (type) {
    case "ONE_TO_ONE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "GROUP":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "SUPPORT":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export default function RoomList({
  rooms,
  userStatus,
  loading,
  onSelectRoom,
  onCreateRoom,
  onGetActiveUsers,
  activeRoom,
}: RoomListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getOnlineParticipants = (participants: User[]) => {
    return participants.filter((participant) => userStatus[Number(participant.id)]?.status === "online").length
  }

  const getLastActiveTime = (room: ChatRoom) => {
    try {
      return formatDistanceToNow(new Date(room.created_at), {
        addSuffix: true,
        locale: ar,
      })
    } catch {
      return "منذ وقت قريب"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4" />
            إنشاء غرفة جديدة
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="البحث عن غرفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">{searchTerm ? "لا توجد غرف مطابقة للبحث" : "لا توجد غرف دردشة"}</p>
            <p className="text-sm">ابدأ محادثة جديدة بإنشاء غرفة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                  activeRoom === room.name
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-md"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => onSelectRoom(room.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Room Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {room.name.charAt(0)}
                      </div>
                      {room.is_active && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Room Name and Type */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">{room.name}</h3>
                        <Badge className={`text-xs px-2 py-1 ${getRoomTypeColor(room.room_type)}`}>
                          {getRoomTypeIcon(room.room_type)}
                          <span className="mr-1">{getRoomTypeLabel(room.room_type)}</span>
                        </Badge>
                      </div>

                      {/* Participants Preview */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex -space-x-2">
                          {room.participants.slice(0, 4).map((participant) => (
                            <div key={participant.id} className="relative">
                              <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-800">
                                <AvatarImage src={participant.avatar || undefined} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                                  {participant.first_name.charAt(0)}
                                  {participant.last_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {userStatus[Number(participant.id)]?.status === "online" && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
                              )}
                            </div>
                          ))}
                          {room.participants.length > 4 && (
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                              +{room.participants.length - 4}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{getOnlineParticipants(room.participants)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>آخر نشاط {getLastActiveTime(room)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateRoom={onCreateRoom}
        onGetActiveUsers={onGetActiveUsers}
      />
    </div>
  )
}
