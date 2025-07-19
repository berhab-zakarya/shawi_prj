export type User = {
id: number
email: string
first_name: string
last_name: string
fullname: string
role: "Admin" | "Lawyer" | "Client"
avatar: string | null
is_active: boolean
}

export type ChatRoom = {
id: number
name: string
room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
participants: User[]
created_at: string
is_active: boolean
}

export type Message = {
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

export type Reaction = {
id: number
message: number
user: User
reaction_type: "LIKE" | "HEART" | "SMILE" | "SAD"
created_at: string
}

export type CreateRoomRequest = {
name: string
room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
participants: string[] // Email addresses
}

export type WebSocketMessage = {
type: "message"
message_id: number
message: string
sender: User
file_url: string | null
timestamp: string
is_edited: boolean
edited_at: string | null
reactions: Reaction[]
}

export type WebSocketReaction = {
type: "reaction"
message_id: number
user: User
reaction_type: "LIKE" | "HEART" | "SMILE" | "SAD"
}

export type WebSocketPresence = {
type: "status"
user: User
status: "online" | "offline"
}

export type WebSocketTyping = {
type: "typing"
user: User
is_typing: boolean
}

export type WebSocketNotification = {
type: "NEW_NOTIFICATION"
notification: {
  id: string
  title: string
  message: string
  notification_type: "message_received" | "reaction_added" | "user_status" | "document_uploaded"
  priority: "low" | "medium" | "high"
  is_read: boolean
  created_at: string
  time_since: string
  action_url: string
  action_text: string
  content_object: ChatRoom | Message
}
unread_count: number
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected"

export interface UseChatConfig {
autoConnectWebSocket?: boolean
autoFetchRooms?: boolean
websocketConfig?: {
  baseUrl?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}
}

export interface ChatState {
activeRoom: string | null
isTyping: boolean
typingUsers: User[]
}
