"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MessageItem from "./MessageItem"
import LoadingSpinner from "./LoadingSpinner"
import {   Users, Smile } from "lucide-react"
import { Message } from "@/types/notification"
import { User } from "@/types"



interface TypingStatus {
  [userId: number]: {
    user: User
    isTyping: boolean
  }
}

interface UserStatus {
  [userId: number]: {
    user: User
    status: "online" | "offline"
  }
}

interface ChatWindowProps {
  roomName: string
  messages: Message[]
  typingStatus: TypingStatus
  userStatus: UserStatus
  loading: boolean
  onSendMessage: (content: string, fileUrl?: string) => Promise<void>
  onTyping: (isTyping: boolean) => void
  CURRENT_USER_ID:string|number;
}



export default function ChatWindow({
  roomName,
  messages,
  typingStatus,
  userStatus,
  loading,
  onSendMessage,
  onTyping,
  CURRENT_USER_ID,
}: ChatWindowProps) {
  const [messageContent, setMessageContent] = useState("")
  // const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageContent.trim()) return

    try {
      await onSendMessage(messageContent.trim())
      setMessageContent("")
      onTyping(false)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(e.target.value)

    // Handle typing indicator
    onTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 1000)
  }



  const getTypingUsers = () => {
    return Object.values(typingStatus).filter((status) => status.isTyping && status.user.id !== CURRENT_USER_ID)
  }

  const getOnlineUsers = () => {
    return Object.values(userStatus).filter((status) => status.status === "online")
  }

  const typingUsers = getTypingUsers()
  const onlineUsers = getOnlineUsers()

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {roomName.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>

          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{roomName}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{onlineUsers.length} متصل</span>
              {/* {typingUsers.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {typingUsers.map((u) => u.user.first_name).join(", ")} يكتب...
                  </span>
                </>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Online Users Avatars */}
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 5).map(({ user }) => (
              <div key={user.id} className="relative">
                <Avatar className="w-8 h-8 border-2 border-white dark:border-gray-800 shadow-md">
                  <AvatarImage src={user.avatar || "/profile.png"} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                    {user.first_name.charAt(0)}
                    {user.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                +{onlineUsers.length - 5}
              </div>
            )}
          </div>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Users className="w-4 h-4 ml-2" />
                عرض الأعضاء
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Paperclip className="w-4 h-4 ml-2" />
                الملفات المشتركة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">جاري تحميل الرسائل...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ابدأ المحادثة</h3>
              <p className="text-gray-500 dark:text-gray-400">أرسل أول رسالة لبدء المحادثة</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.sender.id === CURRENT_USER_ID
              const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id
              const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender.id !== message.sender.id

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                  isLastInGroup={isLastInGroup}
                  
      
                />
              )
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-3 px-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={typingUsers[0].user.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {typingUsers[0].user.first_name.charAt(0)}
                    {typingUsers[0].user.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Enhanced Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={messageContent}
                onChange={handleInputChange}
                placeholder="اكتب رسالتك هنا..."
                className="min-h-[44px] max-h-32 resize-none text-right pr-12 rounded-2xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>

     
          </div>
        </form>
      </div>
    </div>
  )
}
