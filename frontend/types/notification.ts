import { User } from "./api"

export interface Reaction {
  id: number
  message: number
  user: User
  reaction_type: "LIKE" | "HEART" | "SMILE" | "SAD"
  created_at: string
}

export interface ChatRoom {
  id: number
  name: string
  room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
  participants: User[]
  created_at: string
  is_active: boolean
}

export interface Message {
  id: number
  room: number
  sender: User
  content: string
  file_url: string | null
  timestamp: string
  is_read: boolean
  is_edited: boolean
  edited_at: string | null
  reactions: Reaction[]
}

export interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  priority: "low" | "medium" | "high" | "urgent"
  is_read: boolean
  created_at: string
  time_since: string
  action_url: string | null
  action_text: string | null
  content_object: Message | ChatRoom | null
}