/* eslint-disable */

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface WebSocketContextType {
  isConnected: boolean
  sendMessage: (message: any) => void
  subscribe: (event: string, handler: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
  userId?: string
  userRole?: string
}

export function WebSocketProvider({ children, userId, userRole }: WebSocketProviderProps) {
  const { toast } = useToast()
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [eventHandlers, setEventHandlers] = useState<Map<string, ((data: any) => void)[]>>(new Map())

  useEffect(() => {
    if (!userId) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "wss://eilflawyers.com"}/ws/dashboard/?user_id=${userId}&role=${userRole}`
    const websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      setWs(websocket)
    }

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleMessage(message)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    websocket.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
      setWs(null)
    }

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    return () => {
      websocket.close()
    }
  }, [userId, userRole])

  const handleMessage = (message: any) => {
    const handlers = eventHandlers.get(message.type) || []
    handlers.forEach((handler) => {
      try {
        handler(message)
      } catch (error) {
        console.error("Error in WebSocket handler:", error)
      }
    })

    // Handle common message types
    switch (message.type) {
      case "NEW_NOTIFICATION":
        toast({
          title: message.notification.title,
          description: message.notification.message,
        })
        break
      case "case_updated":
        toast({
          title: "تحديث القضية",
          description: "تم تحديث إحدى قضاياك",
        })
        break
      case "document_uploaded":
        toast({
          title: "مستند جديد",
          description: "تم رفع مستند جديد",
        })
        break
    }
  }

  const sendMessage = (message: any) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message))
    }
  }

  const subscribe = (event: string, handler: (data: any) => void) => {
    setEventHandlers((prev) => {
      const newMap = new Map(prev)
      const handlers = newMap.get(event) || []
      newMap.set(event, [...handlers, handler])
      return newMap
    })

    return () => {
      setEventHandlers((prev) => {
        const newMap = new Map(prev)
        const handlers = newMap.get(event) || []
        const filteredHandlers = handlers.filter((h) => h !== handler)
        if (filteredHandlers.length === 0) {
          newMap.delete(event)
        } else {
          newMap.set(event, filteredHandlers)
        }
        return newMap
      })
    }
  }

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>{children}</WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
