"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {  MoreHorizontal,  CheckCheck, Download, Copy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Message } from "@/types/notification"
import { User } from "@/types"



interface Reaction {
  id: number
  message: number
  user: User
  reaction_type: "LIKE" | "HEART" | "SMILE" | "SAD"
  created_at: string
}


interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
  showAvatar: boolean
  isLastInGroup: boolean
 
}



export default function MessageItem({
  message,
  isCurrentUser,
  showAvatar,
  isLastInGroup,
}: MessageItemProps) {


 

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  const groupedReactions = message.reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.reaction_type]) {
        acc[reaction.reaction_type] = []
      }
      acc[reaction.reaction_type].push(reaction)
      return acc
    },
    {} as Record<string, Reaction[]>,
  )

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return date.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      } else {
        return formatDistanceToNow(date, {
          addSuffix: true,
          locale: ar,
        })
      }
    } catch {
      return "الآن"
    }
  }

  return (
    <div className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""} group`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.sender.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
              {message.sender.first_name.charAt(0)}
              {message.sender.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      <div className={`flex-1 max-w-xs lg:max-w-md ${isCurrentUser ? "text-right" : ""}`}>
        {/* Sender Name (only for first message in group and not current user) */}
        {showAvatar && !isCurrentUser && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
            {message.sender.first_name} {message.sender.last_name}
          </p>
        )}

        {/* Message Bubble */}
        <div className="relative group/message">
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm relative ${
              isCurrentUser
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            } ${!isLastInGroup ? (isCurrentUser ? "rounded-br-md" : "rounded-bl-md") : ""}`}
          >
            {/* Message Content */}
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

            {/* File Attachment */}
            {message.file_url && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isCurrentUser
                      ? "text-white hover:bg-white/20"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => window.open(message.file_url!, "_blank")}
                >
                  <Download className="w-4 h-4" />
                  تحميل الملف
                </Button>
              </div>
            )}

            {/* Message Actions */}
            <div className="absolute top-1 left-1 opacity-0 group-hover/message:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 ${
                      isCurrentUser
                        ? "text-white/70 hover:text-white hover:bg-white/20"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 ml-2" />
                    نسخ النص
                  </DropdownMenuItem>
               
                
                  {/* <DropdownMenuItem onClick={() => setShowReactions(!showReactions)}>
                    <Smile className="w-4 h-4 ml-2" />
                    إضافة رد فعل
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick Reactions */}
          {/* {showReactions && (
            <div
              className={`absolute top-0 ${isCurrentUser ? "right-full mr-2" : "left-full ml-2"} bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 p-1 flex gap-1 z-10`}
            >
              {Object.entries(reactionEmojis).map(([type, emoji]) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  onClick={() => handleReaction(type as "LIKE" | "HEART" | "SMILE" | "SAD")}
                >
                  <span className="text-lg">{emoji}</span>
                </Button>
              ))}
            </div>
          )} */}
        </div>

        {/* Reactions */}
        {/* {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-2 ${isCurrentUser ? "justify-end" : ""}`}>
            {Object.entries(groupedReactions).map(([type, reactions]) => (
              <Badge
                key={type}
                variant="secondary"
                className="flex items-center gap-1 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                onClick={() => handleReaction(type as "LIKE" | "HEART" | "SMILE" | "SAD")}
              >
                <span>{reactionEmojis[type as keyof typeof reactionEmojis]}</span>
                <span>{reactions.length}</span>
              </Badge>
            ))}
          </div>
        )} */}

        {/* Timestamp and Status */}
        {isLastInGroup && (
          <div
            className={`flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 ${isCurrentUser ? "justify-end" : ""}`}
          >
            <span>{formatTime(message.timestamp)}</span>
            {message.is_edited && <span className="text-gray-400">• تم التعديل</span>}
            {message.is_read && isCurrentUser && <CheckCheck className="w-3 h-3 text-blue-500" />}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
    
    </div>
  )
}
