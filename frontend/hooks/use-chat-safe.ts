"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { get, post, put, del } from "../lib/api"
import { API_BASE_URL } from "../lib/apiConstants"
import { extractErrorMessages } from "../lib/errorHandler"
import { clearTokens, getToken } from "../lib/jwtService"
import {Notification,ChatRoom,Message,Reaction} from "@/types/notification"
import { User } from "@/types"
// Type definitions based on backend serializers and models



interface ErrorState {
  message: string
  type: "network" | "validation" | "authentication" | "not_found" | "server" | "websocket" | "duplicate_reaction" | null
}

interface CreateRoomInput {
  name: string
  room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
  participants: string[]
}

interface SendMessageInput {
  room_name: string
  content: string
  file_url?: string
}

interface EditMessageInput {
  message_id: number
  new_content: string
}

interface ReactionInput {
  message_id: number
  reaction_type: "LIKE" | "HEART" | "SMILE" | "SAD"
}

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

export function useChat() {
  // State management
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<{ [roomName: string]: Message[] }>({})
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({})
  const [userStatus, setUserStatus] = useState<UserStatus>({})
  // Add users to loading state
  const [loading, setLoading] = useState({
    rooms: false,
    messages: false,
    notifications: false,
    fileUpload: false,
    reaction: false,
    websocket: false,
    users: false,
  })
  const [error, setError] = useState<ErrorState>({ message: "", type: null })

  // WebSocket ha
  const chatSocketRef = useRef<WebSocket | null>(null)
  const presenceSocketRef = useRef<WebSocket | null>(null)
  const notificationSocketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeRoomRef = useRef<string | null>(null)

  // Reset error state
  const resetError = useCallback(() => {
    setError({ message: "", type: null })
  }, [])

  // Handle API and WebSocket errors
const handleError = useCallback(
  (error: any, operation: string, isWebSocket = false): ErrorState => {
    let errorType: ErrorState["type"] = isWebSocket ? "websocket" : "server";
    let message = "An error occurred";

    // Extract HTTP status
    const statusCode = error.response?.status;

    // Handle specific HTTP status codes
    if (statusCode === 401) {
      errorType = "authentication";
      
      //clearTokens();
      errorType ="network"
    } else if (statusCode === 404) {
      errorType = "not_found";
    } else if (statusCode === 400) {
      errorType = "validation";

      // Check for known error
      const raw = error.response?.data;

      if (raw?.error === "Reaction already exists for this message") {
        errorType = "duplicate_reaction";
        message = raw.error;
      } else if (raw?.detail) {
        message = raw.detail;
      } else if (raw?.non_field_errors) {
        message = raw.non_field_errors.join(", ");
      } else {
        // Field-specific validation errors
        const fieldErrors = Object.entries(raw || {})
          .filter(([key, val]) => Array.isArray(val))
          .map(([key, val]) => `${key}: ${(val as string[]).join(", ")}`);
        if (fieldErrors.length > 0) {
          message = fieldErrors.join(" | ");
        }
      }
    } else if (
      error.message?.includes("Network Error") ||
      (isWebSocket && error instanceof Event)
    ) {
      errorType = "network";
      message = "Network connection failed";
    } else {
      // Fallback: general server error or string message
      message =
        error.response?.data?.error ||
        error.message ||
        `Failed to ${operation}`;
    }

    setError({ message, type: errorType });
    return { message, type: errorType };
  },
  []
);



  // WebSocket connection management
  const connectWebSocket = useCallback(
    (url: string, type: "chat" | "presence" | "notification") => {
      const token = getToken()
      if (!token) {
        setError({ message: "No authentication token available", type: "authentication" })
        return null
      }

      const socket = new WebSocket(`${url}?token=${token}`)

      socket.onopen = () => {
        setLoading((prev) => ({ ...prev, websocket: false }))
        resetError()
      }

      socket.onerror = (error) => {
        handleError(error, `connect to ${type} WebSocket`, true)
        setLoading((prev) => ({ ...prev, websocket: false }))
      }

      socket.onclose = (event) => {
        setLoading((prev) => ({ ...prev, websocket: false }))
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (type === "chat" && activeRoomRef.current) {
              chatSocketRef.current = connectWebSocket(`ws://localhost:8001/ws/chat/${activeRoomRef.current}/`, "chat")
            } else if (type === "presence") {
              presenceSocketRef.current = connectWebSocket(`ws://localhost:8001/ws/presence/`, "presence")
            } else if (type === "notification") {
              notificationSocketRef.current = connectWebSocket(`ws://localhost:8001/ws/notifications/`, "notification")
            }
          }, 5000)
        }
      }

      return socket
    },
    [handleError, resetError],
  )

  // Initialize WebSocket connections
  const initializeWebSockets = useCallback(
    (roomName?: string) => {
      if (roomName) {
        activeRoomRef.current = roomName
        chatSocketRef.current = connectWebSocket(`ws://localhost:8001/ws/chat/${roomName}/`, "chat")
        if (chatSocketRef.current) {
          chatSocketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            switch (data.type) {
              case "message":
                setMessages((prev) => ({
                  ...prev,
                  [roomName]: [
                    ...(prev[roomName] || []),
                    {
                      id: Number.parseInt(data.message_id),
                      room: Number.parseInt(data.room),
                      sender: data.sender,
                      content: data.message,
                      file_url: null,
                      timestamp: data.timestamp,
                      is_read: false,
                      is_edited: data.is_edited,
                      edited_at: data.edited_at,
                      reactions: data.reactions,
                    },
                  ],
                }))
                break
              case "reaction":
                setMessages((prev) => ({
                  ...prev,
                  [roomName]: prev[roomName]?.map((msg) =>
                    msg.id === Number.parseInt(data.message_id)
                      ? {
                        ...msg,
                        reactions: [
                          ...msg.reactions,
                          {
                            id: Date.now(),
                            message: msg.id,
                            user: data.user,
                            reaction_type: data.reaction_type,
                            created_at: new Date().toISOString(),
                          },
                        ],
                      }
                      : msg,
                  ),
                }))
                break
              case "typing":
                setTypingStatus((prev) => ({
                  ...prev,
                  [data.user.id]: { user: data.user, isTyping: data.is_typing },
                }))
                break
              case "status":
                setUserStatus((prev) => ({
                  ...prev,
                  [data.user.id]: { user: data.user, status: data.status },
                }))
                break
            }
          }
        }
      }

      if (!presenceSocketRef.current) {
        presenceSocketRef.current = connectWebSocket(`ws://localhost:8001/ws/presence/`, "presence")
        if (presenceSocketRef.current) {
          presenceSocketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === "status") {
              setUserStatus((prev) => ({
                ...prev,
                [data.user.id]: { user: data.user, status: data.status },
              }))
            }
          }
        }
      }

      if (!notificationSocketRef.current) {
        notificationSocketRef.current = connectWebSocket(`ws://localhost:8001/ws/notifications/`, "notification")
        if (notificationSocketRef.current) {
          notificationSocketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log("WEBSOCKET NOTIFICATION FROM CHATSAFE")
            console.log(data)
            // Update notification WebSocket handling
            if (data.type === "NEW_NOTIFICATION") {
              setNotifications((prev) => [...prev, data.notification])
              setUnreadCount(data.unread_count)
              
            }
          }
        }
      }
    },
    [handleError, resetError],
  )

  // Close WebSocket connections
  const closeWebSockets = useCallback(() => {
    if (chatSocketRef.current) {
      chatSocketRef.current.close(1000)
      chatSocketRef.current = null
    }
    if (presenceSocketRef.current) {
      presenceSocketRef.current.close(1000)
      presenceSocketRef.current = null
    }
    if (notificationSocketRef.current) {
      notificationSocketRef.current.close(1000)
      notificationSocketRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    activeRoomRef.current = null
  }, [])

  // Send typing status
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (chatSocketRef.current && chatSocketRef.current.readyState === WebSocket.OPEN) {
      chatSocketRef.current.send(
        JSON.stringify({
          type: "typing",
          is_typing: isTyping,
        }),
      )
    }
  }, [])

  // Add getActiveUsers method before getRooms
  const getActiveUsers = useCallback(
    async (search?: string) => {
      try {
        setLoading((prev) => ({ ...prev, users: true }))
        resetError()
        const url = search
          ? `${API_BASE_URL}users/active/?search=${encodeURIComponent(search)}`
          : `${API_BASE_URL}users/active/`
        const response = await get<User[]>(url, { isPrivate: true })
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "fetch active users")
      } finally {
        setLoading((prev) => ({ ...prev, users: false }))
      }
    },
    [handleError, resetError],
  )

  // Get all chat rooms
  const getRooms = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, rooms: true }))
      resetError()
      const response = await get<ChatRoom[]>(`${API_BASE_URL}rooms/`, { isPrivate: true })
      setRooms(response.data)
      return response.data
    } catch (error) {
      console.log(error)
      throw handleError(error, "fetch rooms")
    } finally {
      setLoading((prev) => ({ ...prev, rooms: false }))
    }
  }, [handleError, resetError])

  // Create a new chat room
  const createRoom = useCallback(
    async (data: CreateRoomInput) => {
      try {
        setLoading((prev) => ({ ...prev, rooms: true }))
        resetError()
        const response = await post<ChatRoom, CreateRoomInput>(`${API_BASE_URL}rooms/`, data, { isPrivate: true })
        setRooms((prev) => [...prev, response.data])
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "create room")
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }))
      }
    },
    [handleError, resetError],
  )

  // Get message history for a room
  const getMessageHistory = useCallback(
    async (roomName: string) => {
      try {
        setLoading((prev) => ({ ...prev, messages: true }))
        resetError()
        const response = await get<Message[]>(`${API_BASE_URL}messages/history/${roomName}/`, {
          isPrivate: true,
        })
        setMessages((prev) => ({ ...prev, [roomName]: response.data }))
        initializeWebSockets(roomName)
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "fetch message history")
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }))
      }
    },
    [handleError, resetError, initializeWebSockets],
  )

  // Update sendMessage to use WebSocket only
  const sendMessage = useCallback(
    async (data: SendMessageInput) => {
      try {
        setLoading((prev) => ({ ...prev, messages: true }))
        resetError()
        if (!chatSocketRef.current || chatSocketRef.current.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket connection is not open")
        }
        chatSocketRef.current.send(
          JSON.stringify({
            type: "message",
            message: data.content,
          }),
        )
        return { message: "Message sent via WebSocket" }
      } catch (error) {
        console.log(error)
        throw handleError(error, "send message", true)
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }))
      }
    },
    [handleError, resetError],
  )

  // Edit a message
  const editMessage = useCallback(
    async (data: EditMessageInput) => {
      try {
        setLoading((prev) => ({ ...prev, messages: true }))
        resetError()
        const response = await put<Message, EditMessageInput>(`${API_BASE_URL}message/edit/`, data, {
          isPrivate: true,
        })
        setMessages((prev) => {
          const roomMessages = Object.entries(prev).reduce(
            (acc, [roomName, messages]) => {
              acc[roomName] = messages.map((msg) => (msg.id === data.message_id ? response.data : msg))
              return acc
            },
            {} as { [roomName: string]: Message[] },
          )
          return roomMessages
        })
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "edit message")
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }))
      }
    },
    [handleError, resetError],
  )

  // Mark message as read
  const markMessageRead = useCallback(
    async (messageId: number) => {
      try {
        setLoading((prev) => ({ ...prev, messages: true }))
        resetError()
        const response = await post<{ status: string }, {}>(
          `${API_BASE_URL}message/read/${messageId}/`,
          {},
          { isPrivate: true },
        )
        setMessages((prev) => {
          const roomMessages = Object.entries(prev).reduce(
            (acc, [roomName, messages]) => {
              acc[roomName] = messages.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
              return acc
            },
            {} as { [roomName: string]: Message[] },
          )
          return roomMessages
        })
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "mark message as read")
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }))
      }
    },
    [handleError, resetError],
  )

  // Add reaction
  const addReaction = useCallback(
    async (data: ReactionInput) => {
      try {
        setLoading((prev) => ({ ...prev, reaction: true }))
        resetError()
        if (chatSocketRef.current && chatSocketRef.current.readyState === WebSocket.OPEN) {
          chatSocketRef.current.send(
            JSON.stringify({
              type: "reaction",
              message_id: data.message_id,
              reaction_type: data.reaction_type,
            }),
          )
        }
        const response = await post<Reaction, ReactionInput>(`${API_BASE_URL}reaction/add/`, data, {
          isPrivate: true,
        })
        setMessages((prev) => {
          const roomMessages = Object.entries(prev).reduce(
            (acc, [roomName, messages]) => {
              acc[roomName] = messages.map((msg) =>
                msg.id === data.message_id ? { ...msg, reactions: [...msg.reactions, response.data] } : msg,
              )
              return acc
            },
            {} as { [roomName: string]: Message[] },
          )
          return roomMessages
        })
        return response.data
      } catch (error: any) {
        console.log(error)
        const err = handleError(error, "add reaction")
        if (err.type === "duplicate_reaction") {
          throw new Error("رد فعل موجود بالفعل لهذه الرسالة")
        }
        throw error
      } finally {
        setLoading((prev) => ({ ...prev, reaction: false }))
      }
    },
    [handleError, resetError],
  )

  // Upload file
  const uploadFile = useCallback(
    async (file: File, roomName: string) => {
      try {
        setLoading((prev) => ({ ...prev, fileUpload: true }))
        resetError()
        const formData = new FormData()
        formData.append("file", file)
        formData.append("room_name", roomName)

        const response = await post<{ file_url: string }, FormData>(`${API_BASE_URL}upload/`, formData, {
          isPrivate: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "upload file")
      } finally {
        setLoading((prev) => ({ ...prev, fileUpload: false }))
      }
    },
    [handleError, resetError],
  )

  // Get notifications
  const getNotifications = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, notifications: true }))
      resetError()
      const response = await get<Notification[]>(`${API_BASE_URL}notifications/`, {
        isPrivate: true,
      })
      setNotifications(response.data)
      return response.data
    } catch (error) {
      console.log(error)
      throw handleError(error, "fetch notifications")
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }))
    }
  }, [handleError, resetError])

  // Get unread notification count
  const getUnreadNotificationCount = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, notifications: true }))
      resetError()
      const response = await get<{ count: number }>(`${API_BASE_URL}notifications/unread-count/`, {
        isPrivate: true,
      })
      setUnreadCount(response.data.count)
      return response.data.count
    } catch (error) {
      console.log(error)
      throw handleError(error, "fetch unread notification count")
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }))
    }
  }, [handleError, resetError])

  // Mark notification as read
  const markNotificationRead = useCallback(
    async (notificationId: string) => {
      try {
        setLoading((prev) => ({ ...prev, notifications: true }))
        resetError()
        const response = await post<{ status: string }, {}>(
          `${API_BASE_URL}notifications/${notificationId}/mark-read/`,
          {},
          { isPrivate: true },
        )
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => prev - 1)
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "mark notification as read")
      } finally {
        setLoading((prev) => ({ ...prev, notifications: false }))
      }
    },
    [handleError, resetError],
  )

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, notifications: true }))
      resetError()
      const response = await post<{ marked_read: number }, {}>(
        `${API_BASE_URL}notifications/mark-all-read/`,
        {},
        { isPrivate: true },
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
      return response.data
    } catch (error) {
      console.log(error)
      throw handleError(error, "mark all notifications as read")
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }))
    }
  }, [handleError, resetError])

  // Clear all read notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, notifications: true }))
      resetError()
      const response = await post<{ deleted: number }, {}>(
        `${API_BASE_URL}notifications/clear-all/`,
        {},
        { isPrivate: true },
      )
      setNotifications((prev) => prev.filter((n) => !n.is_read))
      return response.data
    } catch (error) {
      console.log(error)
      throw handleError(error, "clear notifications")
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }))
    }
  }, [handleError, resetError])

  // Delete single notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        setLoading((prev) => ({ ...prev, notifications: true }))
        resetError()
        const response = await del<{}>(`${API_BASE_URL}notifications/${notificationId}/`, {
          isPrivate: true,
        })
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        setUnreadCount((prev) => prev - (prev > 0 ? 1 : 0))
        return response.data
      } catch (error) {
        console.log(error)
        throw handleError(error, "delete notification")
      } finally {
        setLoading((prev) => ({ ...prev, notifications: false }))
      }
    },
    [handleError, resetError],
  )

  // Initialize WebSocket connections on mount
  useEffect(() => {
    initializeWebSockets()
    getRooms()
    getNotifications()
    getUnreadNotificationCount()

    return () => {
      closeWebSockets()
    }
  }, [getRooms, getNotifications, getUnreadNotificationCount, initializeWebSockets, closeWebSockets])

  // Add getActiveUsers to return statement
  return {
    // State
    rooms,
    messages,
    notifications,
    unreadCount,
    typingStatus,
    userStatus,
    loading,
    error,

    // Methods
    getActiveUsers,
    getRooms,
    createRoom,
    getMessageHistory,
    sendMessage,
    editMessage,
    markMessageRead,
    addReaction,
    uploadFile,
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    deleteNotification,
    sendTypingStatus,
    resetError,
    initializeWebSockets,
    closeWebSockets,
  }
}
