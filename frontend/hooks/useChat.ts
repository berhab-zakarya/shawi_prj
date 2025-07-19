"use client"

import { getToken } from "@/lib/jwtService"
import { useState, useEffect, useCallback, useRef } from "react"
import {
User,
ChatRoom,
Message,
Reaction,
CreateRoomRequest,
WebSocketMessage,
WebSocketReaction,
WebSocketPresence,
WebSocketTyping,
WebSocketNotification,
ConnectionStatus,
UseChatConfig,
ChatState,
} from "@/types/chat"

export function useChat(config: UseChatConfig = {}) {
const {
  autoConnectWebSocket = true,
  autoFetchRooms = true,
  websocketConfig = {},
} = config
const {
  baseUrl = "ws://localhost:8001",
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
} = websocketConfig

const [rooms, setRooms] = useState<ChatRoom[]>([])
const [messages, setMessages] = useState<Message[]>([])
const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
const [connectionStatus, setConnectionStatus] =
  useState<ConnectionStatus>("disconnected")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [onlineUsers, setOnlineUsers] = useState<User[]>([])
const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
const [chatState, setChatState] = useState<ChatState>({
  activeRoom: null,
  isTyping: false,
  typingUsers: [],
})

const wsChat = useRef<WebSocket | null>(null)
const wsPresence = useRef<WebSocket | null>(null)
const wsNotifications = useRef<WebSocket | null>(null)
const reconnectAttempts = useRef(0)
const token = useRef<string | null>(null)

// Initialize token on mount
useEffect(() => {
  token.current = getToken() // Fetch JWT/DRF token
}, [])

const connectWebSocket = useCallback(() => {
  if (!token.current) {
    setError("Authentication token not found.")
    return
  }
  setConnectionStatus("connecting")

  // Connect to chat, presence, and notification WebSockets
  // Ensure activeRoom.name is available for chat WebSocket
  const chatWsUrl = activeRoom?.name
    ? `${baseUrl}/ws/chat/${activeRoom.name}/?token=${token.current}`
    : null
  const presenceWsUrl = `${baseUrl}/ws/presence/?token=${token.current}`
  const notificationsWsUrl = `${baseUrl}/ws/notifications/?token=${token.current}`

  if (chatWsUrl) {
    wsChat.current = new WebSocket(chatWsUrl)
  }
  wsPresence.current = new WebSocket(presenceWsUrl)
  wsNotifications.current = new WebSocket(notificationsWsUrl)

  const handleOpen = (type: string) => {
    console.log(`${type} WebSocket connected`)
    setConnectionStatus("connected")
    reconnectAttempts.current = 0
  }

  const handleClose = (type: string) => {
    console.log(`${type} WebSocket disconnected`)
    setConnectionStatus("disconnected")
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      console.log(
        `Attempting to reconnect ${type} in ${reconnectInterval / 1000}s...`
      )
      setTimeout(connectWebSocket, reconnectInterval)
    } else {
      setError(`Max reconnect attempts reached for ${type} WebSocket.`)
    }
  }

  const handleError = (type: string, err: Event) => {
    console.error(`${type} WebSocket error:`, err)
    setError(`${type} WebSocket connection error.`)
  }

  // Chat WebSocket
  if (wsChat.current) {
    wsChat.current.onopen = () => handleOpen("Chat")
    wsChat.current.onclose = () => handleClose("Chat")
    wsChat.current.onerror = (err) => handleError("Chat", err)
    wsChat.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage | WebSocketReaction | WebSocketTyping =
          JSON.parse(event.data)
        if (data.type === "message") {
          // Transform WebSocketMessage to Message
          const message: Message = {
            id: data.message_id,
            room: activeRoom?.id || 0, // Fallback, ideally fetched from context
            sender: data.sender,
            content: data.message,
            file_url: data.file_url,
            timestamp: data.timestamp,
            is_read: false, // Assume new messages are unread
            is_edited: data.is_edited,
            edited_at: data.edited_at,
            reactions: data.reactions || [],
          }
          setMessages((prev) => [...prev, message])
        } else if (data.type === "reaction") {
          // Transform WebSocketReaction to Reaction
          const reaction: Reaction = {
            id: Math.random(), // Temporary ID, as backend may not send one
            message: data.message_id,
            user: data.user,
            reaction_type: data.reaction_type,
            created_at: new Date().toISOString(), // Temporary timestamp
          }
          setMessages((prev) =>
            prev.map((msg) =>
              Number(msg.id) === data.message_id
                ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
                : msg
            )
          )
        } else if (data.type === "typing") {
          setChatState((prev) => ({
            ...prev,
            typingUsers: data.is_typing
              ? [...prev.typingUsers.filter((u) => u.id !== data.user.id), data.user]
              : prev.typingUsers.filter((u) => u.id !== data.user.id),
          }))
        }
      } catch (e) {
        console.error("Error parsing chat WebSocket message", e)
      }
    }
  }

  // Presence WebSocket
  if (wsPresence.current) {
    wsPresence.current.onopen = () => handleOpen("Presence")
    wsPresence.current.onclose = () => handleClose("Presence")
    wsPresence.current.onerror = (err) => handleError("Presence", err)
    wsPresence.current.onmessage = (event) => {
      try {
        const data: WebSocketPresence = JSON.parse(event.data)
        
        if (data.type === "status") {
          if (data.status === "online") {
            setOnlineUsers((prev) =>
              prev.some((u) => u.id === data.user.id) ? prev : [...prev, data.user]
            )
          } else if (data.status === "offline") {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== data.user.id))
          }
        }
      } catch (e) {
        console.error("Error parsing presence WebSocket message", e)
      }
    }
  }

  // Notification WebSocket
  if (wsNotifications.current) {
    wsNotifications.current.onopen = () => handleOpen("Notifications")
    wsNotifications.current.onclose = () => handleClose("Notifications")
    wsNotifications.current.onerror = (err) => handleError("Notifications", err)
    wsNotifications.current.onmessage = (event) => {
      try {
        const data: WebSocketNotification = JSON.parse(event.data)
        if (data.type === "NEW_NOTIFICATION") {
          setUnreadNotificationCount(data.unread_count)
        }
      } catch (e) {
        console.error("Error parsing notification WebSocket message", e)
      }
    }
  }
}, [baseUrl, maxReconnectAttempts, reconnectInterval, activeRoom])

const disconnectWebSocket = useCallback(() => {
  wsChat.current?.close()
  wsPresence.current?.close()
  wsNotifications.current?.close()
  setConnectionStatus("disconnected")
}, [])

useEffect(() => {
  if (autoConnectWebSocket && activeRoom && token.current) {
    // Disconnect existing WebSockets before connecting to a new room
    disconnectWebSocket()
    connectWebSocket()
  } else if (autoConnectWebSocket && !activeRoom && token.current) {
    // If no active room, but autoConnect is true, connect presence and notifications
    // This handles the initial connection before a room is selected
    disconnectWebSocket() // Ensure clean slate
    const presenceWsUrl = `${baseUrl}/ws/presence/?token=${token.current}`
    const notificationsWsUrl = `${baseUrl}/ws/notifications/?token=${token.current}`

    wsPresence.current = new WebSocket(presenceWsUrl)
    wsNotifications.current = new WebSocket(notificationsWsUrl)

    const handleOpen = (type: string) => {
      console.log(`${type} WebSocket connected`)
      setConnectionStatus("connected")
      reconnectAttempts.current = 0
    }
    const handleClose = (type: string) => {
      console.log(`${type} WebSocket disconnected`)
      setConnectionStatus("disconnected")
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++
        console.log(
          `Attempting to reconnect ${type} in ${reconnectInterval / 1000}s...`
        )
        setTimeout(connectWebSocket, reconnectInterval)
      } else {
        setError(`Max reconnect attempts reached for ${type} WebSocket.`)
      }
    }
    const handleError = (type: string, err: Event) => {
      console.error(`${type} WebSocket error:`, err)
      setError(`${type} WebSocket connection error.`)
    }

    if (wsPresence.current) {
      wsPresence.current.onopen = () => handleOpen("Presence")
      wsPresence.current.onclose = () => handleClose("Presence")
      wsPresence.current.onerror = (err) => handleError("Presence", err)
      wsPresence.current.onmessage = (event) => {
        try {
          const data: WebSocketPresence = JSON.parse(event.data)
          if (data.type === "status") {
            if (data.status === "online") {
              setOnlineUsers((prev) =>
                prev.some((u) => u.id === data.user.id) ? prev : [...prev, data.user]
              )
            } else if (data.status === "offline") {
              setOnlineUsers((prev) => prev.filter((u) => u.id !== data.user.id))
            }
          }
        } catch (e) {
          console.error("Error parsing presence WebSocket message", e)
        }
      }
    }

    if (wsNotifications.current) {
      wsNotifications.current.onopen = () => handleOpen("Notifications")
      wsNotifications.current.onclose = () => handleClose("Notifications")
      wsNotifications.current.onerror = (err) => handleError("Notifications", err)
      wsNotifications.current.onmessage = (event) => {
        try {
          const data: WebSocketNotification = JSON.parse(event.data)
          if (data.type === "NEW_NOTIFICATION") {
            setUnreadNotificationCount(data.unread_count)
          }
        } catch (e) {
          console.error("Error parsing notification WebSocket message", e)
        }
      }
    }
  }

  return () => disconnectWebSocket()
}, [autoConnectWebSocket, connectWebSocket, disconnectWebSocket, activeRoom, baseUrl]) // Added baseUrl to dependencies

const fetchRooms = useCallback(async () => {
  if (!token.current) {
    setError("Authentication token not found.")
    return
  }
  setIsLoading(true)
  try {
    const response = await fetch("http://localhost:8000/api/v1/rooms/user/", {
      headers: {
        Authorization: `Bearer ${token.current}`,
      },
    })
    if (!response.ok) throw new Error("Failed to fetch rooms.")
    const data = await response.json()
    setRooms(data)
  } catch (err: any) {
    setError(err.message || "Failed to fetch rooms.")
  } finally {
    setIsLoading(false)
  }
}, [])

const fetchMessageHistory = useCallback(
  async (roomName: string, page: number = 1) => {
    if (!token.current) {
      setError("Authentication token not found.")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/messages/history/${roomName}/?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token.current}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to fetch message history.")
      const data = await response.json()
      setMessages(data.results)
    } catch (err: any) {
      setError(err.message || "Failed to fetch message history.")
    } finally {
      setIsLoading(false)
    }
  },
  []
)

useEffect(() => {
  if (autoFetchRooms) {
    fetchRooms()
  }
}, [autoFetchRooms, fetchRooms])

const sendMessage = async (content: string, file?: File): Promise<boolean> => {
  if (!activeRoom || !token.current) {
    setError("No active room or token.")
    return false
  }
  try {
    let file_url: string | null = null
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("room_name", activeRoom.name)
      const uploadResponse = await fetch("http://localhost:8000/api/v1/upload/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token.current}` },
        body: formData,
      })
      if (!uploadResponse.ok) throw new Error("Failed to upload file.")
      const uploadData = await uploadResponse.json()
      file_url = uploadData.file_url
    }

    if (wsChat.current?.readyState === WebSocket.OPEN) {
      wsChat.current.send(
        JSON.stringify({
          type: "message",
          message: content,
          file_url,
        })
      )
      return true
    } else {
      throw new Error("WebSocket not connected.")
    }
  } catch (err: any) {
    setError(err.message || "Failed to send message.")
    return false
  }
}

const addReaction = async (
  messageId: number,
  reactionType: Reaction["reaction_type"]
): Promise<boolean> => {
  if (!token.current) {
    setError("Authentication token not found.")
    return false
  }
  try {
    const response = await fetch("http://localhost:8000/api/v1/reaction/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.current}`,
      },
      body: JSON.stringify({ message_id: messageId, reaction_type: reactionType }),
    })
    if (!response.ok) throw new Error("Failed to add reaction.")
    return true
  } catch (err: any) {
    setError(err.message || "Failed to add reaction.")
    return false
  }
}

const editMessage = async (
  messageId: number,
  newContent: string
): Promise<boolean> => {
  if (!token.current) {
    setError("Authentication token not found.")
    return false
  }
  try {
    const response = await fetch("http://localhost:8000/api/v1/message/edit/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.current}`,
      },
      body: JSON.stringify({ message_id: messageId, new_content: newContent }),
    })
    if (!response.ok) throw new Error("Failed to edit message.")
    return true
  } catch (err: any) {
    setError(err.message || "Failed to edit message.")
    return false
  }
}

const markMessageAsRead = async (messageId: number): Promise<boolean> => {
  if (!token.current) {
    setError("Authentication token not found.")
    return false
  }
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/message/read/${messageId}/`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token.current}` },
      }
    )
    if (!response.ok) throw new Error("Failed to mark message as read.")
    return true
  } catch (err: any) {
    setError(err.message || "Failed to mark message as read.")
    return false
  }
}

const joinRoom = (roomName: string) => {
  const room = rooms.find((r) => r.name === roomName)
  if (room) {
    setActiveRoom(room)
    setMessages([]) // Clear messages when joining a new room
    fetchMessageHistory(roomName)
    setChatState((prev) => ({ ...prev, activeRoom: roomName }))
  } else {
    setError("Room not found.")
  }
}

const createAndJoinRoom = async (roomData: CreateRoomRequest) => {
  if (!token.current) {
    setError("Authentication token not found.")
    return
  }
  try {
    const response = await fetch("http://localhost:8000/api/v1/rooms/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.current}`,
      },
      body: JSON.stringify(roomData),
    })
    if (!response.ok) throw new Error("Failed to create room.")
    const newRoom = await response.json()
    setRooms((prev) => [...prev, newRoom])
    joinRoom(newRoom.name)
  } catch (err: any) {
    setError(err.message || "Failed to create room.")
  }
}

const setTyping = (isTyping: boolean) => {
  if (wsChat.current?.readyState === WebSocket.OPEN) {
    wsChat.current.send(
      JSON.stringify({
        type: "typing",
        is_typing: isTyping,
      })
    )
    setChatState((prev) => ({ ...prev, isTyping }))
  }
}

const fetchUnreadNotificationCount = async () => {
  if (!token.current) {
    setError("Authentication token not found.")
    return
  }
  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/notifications/unread-count/",
      {
        headers: { Authorization: `Bearer ${token.current}` },
      }
    )
    if (!response.ok) throw new Error("Failed to fetch unread notification count.")
    const data = await response.json()
    setUnreadNotificationCount(data.count)
  } catch (err: any) {
    setError(err.message || "Failed to fetch unread notification count.")
  }
}

useEffect(() => {
  if (token.current) {
    fetchUnreadNotificationCount()
  }
}, [])

return {
  rooms,
  messages,
  activeRoom,
  activeRoomName: activeRoom?.name || null,
  connectionStatus,
  isLoading,
  error,
  onlineUsers,
  unreadNotificationCount,
  chatState,
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
}
}
