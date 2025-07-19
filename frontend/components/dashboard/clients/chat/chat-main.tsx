/* eslint-disable */

"use client"

import type React from "react"
import type { User, ChatRoom, Message, Reaction, ChatState, ConnectionStatus } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Smile, Edit, Check, X, ThumbsUp, Heart, SmileIcon, Frown, Wifi, WifiOff } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChatSidebar } from "./chat-sidebar"

interface ChatMainProps {
  rooms: ChatRoom[]
  messages: Message[]
  activeRoom: ChatRoom | null
  activeRoomName: string | null
  connectionStatus: ConnectionStatus
  isLoading: boolean
  error: string | null
  onlineUsers: User[]
  unreadNotificationCount: number
  chatState: ChatState
  typingUsers: User[]
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  sendMessage: (content: string, file?: File) => Promise<boolean>
  addReaction: (messageId: number, reactionType: Reaction["reaction_type"]) => Promise<boolean>
  editMessage: (messageId: number, newContent: string) => Promise<boolean>
  markMessageAsRead: (messageId: number) => Promise<boolean>
  joinRoom: (roomName: string) => void
  createAndJoinRoom: (roomData: {
    name: string
    room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
    participants: string[]
  }) => Promise<void>
  fetchRooms: () => Promise<void>
  fetchMessageHistory: (roomName: string, page?: number) => Promise<void>
  setTyping: (isTyping: boolean) => void
  fetchUnreadNotificationCount: () => Promise<void>
}

export function ChatMain({
  rooms,
  messages,
  activeRoom,
  activeRoomName,
  connectionStatus,
  isLoading,
  error,
  onlineUsers,
  unreadNotificationCount,
  chatState,
  typingUsers,
  connectWebSocket,
  disconnectWebSocket,
  sendMessage,
  addReaction,
  editMessage,
  markMessageAsRead,
  joinRoom,
  createAndJoinRoom,
  fetchRooms,
  fetchMessageHistory,
  setTyping,
  fetchUnreadNotificationCount,
}: ChatMainProps) {
  const [messageInput, setMessageInput] = useState("")
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock users for create room dialog
  const allUsers: User[] = [
    {
      id: 1,
      email: "user1@example.com",
      first_name: "أحمد",
      last_name: "محمد",
      fullname: "أحمد محمد",
      role: "Client",
      avatar: null,
      is_active: true,
    },
    {
      id: 2,
      email: "user2@example.com",
      first_name: "فاطمة",
      last_name: "علي",
      fullname: "فاطمة علي",
      role: "Lawyer",
      avatar: null,
      is_active: true,
    },
    {
      id: 3,
      email: "user3@example.com",
      first_name: "محمد",
      last_name: "أحمد",
      fullname: "محمد أحمد",
      role: "Admin",
      avatar: null,
      is_active: true,
    },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (messageInput.trim() && activeRoom) {
      await sendMessage(messageInput)
      setMessageInput("")
      setTyping(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      if (activeRoom) {
        await sendMessage("", file)
      }
    }
  }

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingMessageContent(message.content)
  }

  const handleSaveEdit = async (messageId: number) => {
    if (editingMessageContent.trim()) {
      await editMessage(messageId, editingMessageContent)
      setEditingMessageId(null)
      setEditingMessageContent("")
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingMessageContent("")
  }

  const handleReaction = async (messageId: number|string, reactionType: Reaction["reaction_type"]) => {
    await addReaction(Number(messageId), reactionType)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)
    setTyping(e.target.value.length > 0)
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />
      case "connecting":
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "متصل"
      case "connecting":
        return "جاري الاتصال..."
      default:
        return "غير متصل"
    }
  }

  return (
    <div dir="rtl" className="flex h-screen w-full bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-800">
        <ChatSidebar
          rooms={rooms || []}
          onlineUsers={onlineUsers || []}
          activeRoom={activeRoom}
          joinRoom={joinRoom}
          createAndJoinRoom={createAndJoinRoom}
          isLoading={isLoading}
          allUsers={allUsers}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        <Card className="flex-1 flex flex-col rounded-none border-0">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-right flex items-center justify-between">
              <span>{activeRoom ? activeRoom.name : "اختر غرفة محادثة"}</span>
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <span className="text-sm text-muted-foreground">{getConnectionText()}</span>
              </div>
            </CardTitle>
            {activeRoom && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                {onlineUsers?.some((u) => activeRoom.participants?.some((p) => p.id === u.id)) ? (
                  <span className="text-green-500">متصل</span>
                ) : (
                  <span className="text-red-500">غير متصل</span>
                )}
                {" | "}
                {typingUsers && typingUsers.length > 0 ? (
                  <span>{typingUsers.map((u) => u.fullname).join(", ")} يكتبون...</span>
                ) : (
                  <span>لا يوجد أحد يكتب</span>
                )}
              </div>
            )}
          </CardHeader>

          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-red-800 text-sm">{error}</span>
                <Button variant="outline" size="sm" onClick={connectWebSocket}>
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}

          <CardContent className="flex-1 p-4 overflow-y-auto">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {activeRoom ? (
                messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3 mb-4",
                        message.sender?.id === 1 ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender?.avatar || `/placeholder.svg?height=32&width=32`} />
                        <AvatarFallback>{message.sender?.first_name?.substring(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "rounded-lg p-3 max-w-[70%]",
                          message.sender?.id === 1
                            ? "bg-blue-500 text-white rounded-bl-none"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 rounded-br-none",
                        )}
                      >
                        <div className="font-medium text-sm text-right">{message.sender?.fullname}</div>
                        {editingMessageId === message.id ? (
                          <div className="flex flex-col gap-2">
                            <Textarea
                              value={editingMessageContent}
                              onChange={(e) => setEditingMessageContent(e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50"
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleSaveEdit(message.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-right">{message.content}</p>
                            {message.file_url && (
                              <a
                                href={message.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-200 underline text-right"
                              >
                                عرض الملف
                              </a>
                            )}
                            <div className="flex justify-between items-center mt-1 text-xs text-gray-300 dark:text-gray-400">
                              <span className="text-right">
                                {format(new Date(message.timestamp), "HH:mm")}
                                {message.is_edited && " (معدل)"}
                              </span>
                              <div className="flex gap-1">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-gray-300 hover:text-white"
                                    >
                                      <Smile className="w-4 h-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-1 flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleReaction(message.id, "LIKE")}
                                    >
                                      <ThumbsUp className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleReaction(message.id, "HEART")}
                                    >
                                      <Heart className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleReaction(message.id, "SMILE")}
                                    >
                                      <SmileIcon className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleReaction(message.id, "SAD")}
                                    >
                                      <Frown className="w-5 h-5" />
                                    </Button>
                                  </PopoverContent>
                                </Popover>
                                {message.sender?.id === 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-300 hover:text-white"
                                    onClick={() => handleEditMessage(message)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex gap-1 mt-2 justify-end">
                                {message.reactions.map((reaction, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded-full"
                                  >
                                    {reaction.reaction_type === "LIKE" && "👍"}
                                    {reaction.reaction_type === "HEART" && "❤️"}
                                    {reaction.reaction_type === "SMILE" && "😊"}
                                    {reaction.reaction_type === "SAD" && "😞"}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    {isLoading ? "جاري تحميل الرسائل..." : "لا توجد رسائل في هذه الغرفة."}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  الرجاء اختيار غرفة محادثة للبدء
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2">
              <Input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-5 h-5" />
              </Button>
              <Textarea
                placeholder="اكتب رسالتك..."
                value={messageInput}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1 resize-none"
                dir="rtl"
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim() || !activeRoom}>
                <Send className="w-5 h-5" />
                <span className="sr-only">إرسال</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
