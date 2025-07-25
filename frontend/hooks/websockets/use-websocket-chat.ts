import { useCallback, useEffect, useState } from "react"
import { useWebSocket } from "@/components/websocket-provider"
import { User } from "@/types"

interface Message {
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

interface Reaction {
  id: number
  message: number
  user: User
  reaction_type: "LIKE" | "HEART" | "SMILE" | "SAD"
  created_at: string
}

interface Notification {
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
}

export interface TypingStatus {
  [userId: number]: {
    user: User
    isTyping: boolean
  }
}

export interface UserStatus {
  [userId: number]: {
    user: User
    status: "online" | "offline"
  }
}

export function useWebSocketChat() {
  const { connect, disconnect, send, onMessage, isConnected, getConnectionState, onConnect, onError } = useWebSocket()
  console.debug("[useWebSocketChat] Hook initialized")

  const [messages, setMessages] = useState<{ [roomName: string]: Message[] }>({})
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({})
  const [userStatus, setUserStatus] = useState<UserStatus>({})
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<{ [key: string]: string }>({})
  const [connectionRetries, setConnectionRetries] = useState<{ [key: string]: number }>({})

  // Connect to chat WebSocket for a specific room
  const connectToRoom = useCallback(
    async (roomName: string) => {
      console.debug(`[connectToRoom] Connecting to room: ${roomName}`)
      
      try {
        // If switching rooms, disconnect from the previous one
        if (currentRoom && currentRoom !== roomName) {
          console.debug(`[connectToRoom] Disconnecting from previous room: ${currentRoom}`)
          disconnect(`chat-${currentRoom}`)
        }

        setCurrentRoom(roomName)
        
        // Check if already connected
        if (isConnected(`chat-${roomName}`)) {
          console.debug(`[connectToRoom] Already connected to ${roomName}`)
          return
        }

        console.debug(`[connectToRoom] Establishing connection to chat-${roomName}`)
        await connect(`chat-${roomName}`, {
          url: `wss://elshawi-backend-49.westeurope.azurecontainer.io:8000/ws/chat/${roomName}/`,
          reconnectAttempts: 5,
          reconnectDelay: 1000,
          heartbeatInterval: 30000,
        })

        setConnectionErrors(prev => ({ ...prev, [`chat-${roomName}`]: "" }))
        setConnectionRetries(prev => ({ ...prev, [`chat-${roomName}`]: 0 }))
        console.debug(`[connectToRoom] Successfully connected to chat-${roomName}`)
        
      } catch (error) {
        console.error(`[connectToRoom] Failed to connect to room ${roomName}:`, error)
        setConnectionErrors(prev => ({
          ...prev,
          [`chat-${roomName}`]: `Failed to connect to room ${roomName}`,
        }))
      }
    },
    [connect, disconnect, currentRoom, isConnected],
  )

  // Connect to presence WebSocket
  const connectToPresence = useCallback(async () => {
    console.debug("[connectToPresence] Connecting to presence")
    
    try {
      if (isConnected("presence")) {
        console.debug("[connectToPresence] Already connected to presence")
        return
      }

      await connect("presence", {
        url: "wss://elshawi-backend-49.westeurope.azurecontainer.io:8000/ws/presence/",
        reconnectAttempts: 5,
        reconnectDelay: 1000,
        heartbeatInterval: 30000,
      })
      
      setConnectionErrors(prev => ({ ...prev, presence: "" }))
      setConnectionRetries(prev => ({ ...prev, presence: 0 }))
      console.debug("[connectToPresence] Successfully connected to presence")
      
    } catch (error) {
      console.error("[connectToPresence] Failed to connect to presence:", error)
      setConnectionErrors(prev => ({ ...prev, presence: "Failed to connect to presence" }))
    }
  }, [connect, isConnected])

  // Connect to notifications WebSocket
  const connectToNotifications = useCallback(async () => {
    console.debug("[connectToNotifications] Connecting to notifications")
    
    try {
      if (isConnected("notifications")) {
        console.debug("[connectToNotifications] Already connected to notifications")
        return
      }

      await connect("notifications", {
        url: "wss://elshawi-backend-49.westeurope.azurecontainer.io:8000/ws/notifications/",
        reconnectAttempts: 5,
        reconnectDelay: 1000,
        heartbeatInterval: 30000,
      })
      
      setConnectionErrors(prev => ({ ...prev, notifications: "" }))
      setConnectionRetries(prev => ({ ...prev, notifications: 0 }))
      console.debug("[connectToNotifications] Successfully connected to notifications")
      
    } catch (error) {
      console.error("[connectToNotifications] Failed to connect to notifications:", error)
      setConnectionErrors(prev => ({ ...prev, notifications: "Failed to connect to notifications" }))
    }
  }, [connect, isConnected])

  // Send message through WebSocket
  const sendMessage = useCallback(
    (content: string) => {
      console.debug(`[sendMessage] Sending message to room: ${currentRoom}`)
      
      if (!currentRoom) {
        console.warn("[sendMessage] No current room selected")
        return
      }

      const connectionState = getConnectionState(`chat-${currentRoom}`)
      if (connectionState !== 'connected') {
        console.warn(`[sendMessage] Cannot send message: connection state is ${connectionState}`)
        return
      }

      try {
        send(`chat-${currentRoom}`, {
          type: "message",
          message: content,
        })
        console.debug(`[sendMessage] Message sent successfully to chat-${currentRoom}`)
      } catch (error) {
        console.error(`[sendMessage] Error sending message:`, error)
      }
    },
    [send, currentRoom, getConnectionState],
  )

  // Send typing status
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!currentRoom) return
      
      const connectionState = getConnectionState(`chat-${currentRoom}`)
      if (connectionState !== 'connected') return

      try {
        send(`chat-${currentRoom}`, {
          type: "typing",
          is_typing: isTyping,
        })
        console.debug(`[sendTypingStatus] Typing status sent: ${isTyping}`)
      } catch (error) {
        console.error(`[sendTypingStatus] Error sending typing status:`, error)
      }
    },
    [send, currentRoom, getConnectionState],
  )

  // Send reaction
  const sendReaction = useCallback(
    (messageId: number, reactionType: string) => {
      if (!currentRoom) return
      
      const connectionState = getConnectionState(`chat-${currentRoom}`)
      if (connectionState !== 'connected') return

      try {
        send(`chat-${currentRoom}`, {
          type: "reaction",
          message_id: messageId,
          reaction_type: reactionType,
        })
        console.debug(`[sendReaction] Reaction sent: ${reactionType} for message ${messageId}`)
      } catch (error) {
        console.error(`[sendReaction] Error sending reaction:`, error)
      }
    },
    [send, currentRoom, getConnectionState],
  )

  // Handle chat messages
  useEffect(() => {
    if (!currentRoom) return

    console.debug(`[useEffect] Setting up message handler for chat-${currentRoom}`)
    
    const unsubscribe = onMessage(`chat-${currentRoom}`, (data) => {
      console.debug(`[onMessage] Received message on chat-${currentRoom}:`, data.type)
      
      switch (data.type) {
        case "message":
          setMessages(prev => ({
            ...prev,
            [currentRoom]: [
              ...(prev[currentRoom] || []),
              {
                id: Number.parseInt(data.message_id),
                room: Number.parseInt(data.room),
                sender: data.sender,
                content: data.message,
                file_url: null,
                timestamp: data.timestamp,
                is_read: false,
                is_edited: data.is_edited || false,
                edited_at: data.edited_at || null,
                reactions: data.reactions || [],
              },
            ],
          }))
          break

        case "reaction":
          setMessages(prev => ({
            ...prev,
            [currentRoom]:
              prev[currentRoom]?.map(msg =>
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
              ) || [],
          }))
          break

        case "typing":
          setTypingStatus(prev => ({
            ...prev,
            [data.user.id]: { user: data.user, isTyping: data.is_typing },
          }))
          break

        case "status":
          setUserStatus(prev => ({
            ...prev,
            [data.user.id]: { user: data.user, status: data.status },
          }))
          break

        case "pong":
          // Handle heartbeat pong
          console.debug(`[onMessage] Received pong from chat-${currentRoom}`)
          break

        default:
          console.debug(`[onMessage] Unhandled message type: ${data.type}`)
      }
    })

    return unsubscribe
  }, [currentRoom, onMessage])

  // Handle presence updates
  useEffect(() => {
    console.debug("[useEffect] Setting up presence message handler")
    
    const unsubscribe = onMessage("presence", (data) => {
      console.debug("[onMessage] Received presence message:", data.type)
      
      switch (data.type) {
        case "status":
          setUserStatus(prev => ({
            ...prev,
            [data.user.id]: { user: data.user, status: data.status },
          }))
          break

        case "pong":
          console.debug("[onMessage] Received pong from presence")
          break

        default:
          console.debug(`[onMessage] Unhandled presence message type: ${data.type}`)
      }
    })

    return unsubscribe
  }, [onMessage])

  // Handle notifications
  useEffect(() => {
    console.debug("[useEffect] Setting up notifications message handler")
    
    const unsubscribe = onMessage("notifications", (data) => {
      console.debug("[onMessage] Received notification message:", data.type)
      
      switch (data.type) {
        case "NEW_NOTIFICATION":
          setNotifications(prev => [...prev, data.notification])
          setUnreadCount(data.unread_count || 0)
          break

        case "pong":
          console.debug("[onMessage] Received pong from notifications")
          break

        default:
          console.debug(`[onMessage] Unhandled notification message type: ${data.type}`)
      }
    })

    return unsubscribe
  }, [onMessage])

  // Set up error handlers
  useEffect(() => {
    console.debug("[useEffect] Setting up error handlers")
    
    const connections = ["presence", "notifications"]
    if (currentRoom) {
      connections.push(`chat-${currentRoom}`)
    }

    const unsubscribes = connections.map(connectionId =>
      onError(connectionId, (error) => {
        console.error(`[onError] WebSocket error for ${connectionId}:`, error)
        
        setConnectionErrors(prev => ({
          ...prev,
          [connectionId]: `Connection error for ${connectionId}`,
        }))
        
        setConnectionRetries(prev => ({
          ...prev,
          [connectionId]: (prev[connectionId] || 0) + 1,
        }))
      }),
    )

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [onError, currentRoom])

  // Initialize connections on mount
  useEffect(() => {
    console.debug("[useEffect] Initializing WebSocket connections")
    
    const initializeConnections = async () => {
      try {
        await Promise.all([
          connectToPresence(),
          connectToNotifications(),
        ])
      } catch (error) {
        console.error("[useEffect] Error initializing connections:", error)
      }
    }

    initializeConnections()

    // Cleanup on unmount
    return () => {
      console.debug("[useEffect] Cleaning up WebSocket connections")
      disconnect("presence")
      disconnect("notifications")
      if (currentRoom) {
        disconnect(`chat-${currentRoom}`)
      }
    }
  }, []) // Empty dependency array for mount/unmount only

  // Separate effect for room-specific connections
  useEffect(() => {
    if (currentRoom) {
      console.debug(`[useEffect] Current room changed to: ${currentRoom}`)
    }
  }, [currentRoom])

  return {
    // State
    messages,
    notifications,
    unreadCount,
    typingStatus,
    userStatus,
    currentRoom,
    connectionErrors,

    // Connection status
    isChatConnected: currentRoom ? isConnected(`chat-${currentRoom}`) : false,
    isPresenceConnected: isConnected("presence"),
    isNotificationsConnected: isConnected("notifications"),

    // Methods
    connectToRoom,
    sendMessage,
    sendTypingStatus,
    sendReaction,

    // Cleanup
    disconnect: (roomName?: string) => {
      if (roomName) {
        disconnect(`chat-${roomName}`)
      } else if (currentRoom) {
        disconnect(`chat-${currentRoom}`)
        setCurrentRoom(null)
      }
    },
  }
}
