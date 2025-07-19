/* eslint-disable */

"use client"

import { getToken } from "@/lib/jwtService"
import type React from "react"
import { createContext, useContext, useRef, useCallback, useState, useEffect } from "react"

// Generic WebSocket message type
interface WebSocketMessage {
  type: string
  [key: string]: any
}

// WebSocket connection configuration
interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnectAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
}

// WebSocket connection state
interface WebSocketConnection {
  socket: WebSocket | null
  isConnected: boolean
  reconnectCount: number
  config: WebSocketConfig
  reconnectTimeout?: NodeJS.Timeout
  heartbeatInterval?: NodeJS.Timeout
  lastHeartbeat?: number
  isReconnecting: boolean
}

// Data storage by message type
interface WebSocketData {
  [messageType: string]: any[]
}

// Context value type
interface WebSocketContextValue {
  // Connection management
  connect: (id: string, config: WebSocketConfig) => Promise<void>
  disconnect: (id: string) => void
  send: (id: string, message: any) => void

  // Data access
  getData: <T = any>(connectionId: string, messageType?: string) => T[]

  // Connection status
  isConnected: (id: string) => boolean
  getConnectionState: (id: string) => 'connected' | 'connecting' | 'disconnected' | 'error'

  // Event handlers
  onMessage: (id: string, handler: (data: any) => void) => () => void
  onConnect: (id: string, handler: () => void) => () => void
  onDisconnect: (id: string, handler: () => void) => () => void
  onError: (id: string, handler: (error: Event) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const connectionsRef = useRef<Map<string, WebSocketConnection>>(new Map())
  const dataRef = useRef<Map<string, WebSocketData>>(new Map())
  const eventHandlersRef = useRef<
    Map<
      string,
      {
        message: Set<(data: any) => void>
        connect: Set<() => void>
        disconnect: Set<() => void>
        error: Set<(error: Event) => void>
      }
    >
  >(new Map())

  // Force re-render when connections change
  const [connectionStates, setConnectionStates] = useState<Map<string, 'connected' | 'connecting' | 'disconnected' | 'error'>>(new Map())

  // Get authentication token
  const getAuthToken = useCallback(() => {
    return getToken();
  }, [])

  // Initialize event handlers for a connection
  const initializeEventHandlers = useCallback((id: string) => {
    if (!eventHandlersRef.current.has(id)) {
      eventHandlersRef.current.set(id, {
        message: new Set(),
        connect: new Set(),
        disconnect: new Set(),
        error: new Set(),
      })
    }
  }, [])

  // Update connection state and trigger re-render
  const updateConnectionState = useCallback((id: string, state: 'connected' | 'connecting' | 'disconnected' | 'error') => {
    setConnectionStates(prev => {
      const newStates = new Map(prev)
      newStates.set(id, state)
      return newStates
    })
  }, [])

  // Cleanup connection resources
  const cleanupConnection = useCallback((id: string) => {
    const connection = connectionsRef.current.get(id)
    if (connection) {
      if (connection.reconnectTimeout) {
        clearTimeout(connection.reconnectTimeout)
      }
      if (connection.heartbeatInterval) {
        clearInterval(connection.heartbeatInterval)
      }
      if (connection.socket) {
        // Remove all event listeners before closing
        connection.socket.onopen = null
        connection.socket.onmessage = null
        connection.socket.onclose = null
        connection.socket.onerror = null
        
        if (connection.socket.readyState === WebSocket.OPEN) {
          connection.socket.close(1000, 'Client disconnecting')
        }
      }
    }
  }, [])

  // Setup heartbeat mechanism
  const setupHeartbeat = useCallback((id: string, connection: WebSocketConnection) => {
    if (connection.heartbeatInterval) {
      clearInterval(connection.heartbeatInterval)
    }

    const heartbeatInterval = connection.config.heartbeatInterval || 30000 // 30 seconds
    connection.heartbeatInterval = setInterval(() => {
      if (connection.socket?.readyState === WebSocket.OPEN) {
        try {
          connection.socket.send(JSON.stringify({ type: 'ping' }))
          connection.lastHeartbeat = Date.now()
        } catch (error) {
          console.error(`Error sending heartbeat to ${id}:`, error)
        }
      }
    }, heartbeatInterval)
  }, [])

  // Create WebSocket connection
  const connect = useCallback(
    async (id: string, config: WebSocketConfig): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingConnection = connectionsRef.current.get(id)
        
        // If already connected, resolve immediately
        if (existingConnection?.socket?.readyState === WebSocket.OPEN && existingConnection.isConnected) {
          console.log(`Already connected to ${id}`)
          resolve()
          return
        }

        // If currently reconnecting, don't start another connection
        if (existingConnection?.isReconnecting) {
          console.log(`Already reconnecting to ${id}`)
          resolve()
          return
        }

        // Clean up existing connection
        cleanupConnection(id)

        initializeEventHandlers(id)
        updateConnectionState(id, 'connecting')

        const token = getAuthToken()
        if (!token) {
          reject(new Error('No authentication token available'))
          return
        }

        const urlWithAuth = config.url.includes("?") 
          ? `${config.url}&token=${token}` 
          : `${config.url}?token=${token}`

        console.log(`Connecting to ${id} at ${urlWithAuth}`)

        try {
          const socket = new WebSocket(urlWithAuth, config.protocols)

          const connection: WebSocketConnection = {
            socket,
            isConnected: false,
            reconnectCount: 0,
            config,
            isReconnecting: false,
          }

          connectionsRef.current.set(id, connection)

          if (!dataRef.current.has(id)) {
            dataRef.current.set(id, {})
          }

          // Set up event handlers
          socket.onopen = () => {
            console.log(`WebSocket connected: ${id}`)
            connection.isConnected = true
            connection.reconnectCount = 0
            connection.isReconnecting = false
            updateConnectionState(id, 'connected')
            
            // Setup heartbeat
            setupHeartbeat(id, connection)

            const handlers = eventHandlersRef.current.get(id)
            handlers?.connect.forEach((handler) => {
              try {
                handler()
              } catch (error) {
                console.error(`Error in connect handler for ${id}:`, error)
              }
            })

            resolve()
          }

          socket.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data)
              const { type, ...data } = message

              // Handle pong messages for heartbeat
              if (type === 'pong') {
                connection.lastHeartbeat = Date.now()
                return
              }

              // Store data by message type
              const connectionData = dataRef.current.get(id) || {}
              if (!connectionData[type]) {
                connectionData[type] = []
              }
              connectionData[type].push(data)
              dataRef.current.set(id, connectionData)

              // Call message handlers
              const handlers = eventHandlersRef.current.get(id)
              handlers?.message.forEach((handler) => {
                try {
                  handler(message)
                } catch (error) {
                  console.error(`Error in message handler for ${id}:`, error)
                }
              })
            } catch (error) {
              console.error(`Error parsing WebSocket message for ${id}:`, error)
            }
          }

          socket.onclose = (event) => {
            console.log(`WebSocket closed: ${id}, code: ${event.code}, reason: ${event.reason}`)
            connection.isConnected = false
            
            // Clear heartbeat
            if (connection.heartbeatInterval) {
              clearInterval(connection.heartbeatInterval)
            }

            const handlers = eventHandlersRef.current.get(id)
            handlers?.disconnect.forEach((handler) => {
              try {
                handler()
              } catch (error) {
                console.error(`Error in disconnect handler for ${id}:`, error)
              }
            })

            // Auto-reconnect logic (only for unexpected closures)
            const maxAttempts = config.reconnectAttempts || 5
            const shouldReconnect = event.code !== 1000 && // Not a normal closure
                                   event.code !== 1001 && // Not going away
                                   connection.reconnectCount < maxAttempts

            if (shouldReconnect) {
              connection.isReconnecting = true
              updateConnectionState(id, 'connecting')
              
              const delay = Math.min(
                (config.reconnectDelay || 1000) * Math.pow(2, connection.reconnectCount),
                30000 // Max delay of 30 seconds
              )
              
              connection.reconnectTimeout = setTimeout(() => {
                connection.reconnectCount++
                console.log(`Reconnecting to ${id} (attempt ${connection.reconnectCount}/${maxAttempts}) in ${delay}ms`)
                connect(id, config).catch((error) => {
                  console.error(`Reconnection failed for ${id}:`, error)
                  updateConnectionState(id, 'error')
                })
              }, delay)
            } else {
              connection.isReconnecting = false
              updateConnectionState(id, 'disconnected')
            }
          }

          socket.onerror = (error) => {
            console.error(`WebSocket error for ${id}:`, error)
            updateConnectionState(id, 'error')
            
            const handlers = eventHandlersRef.current.get(id)
            handlers?.error.forEach((handler) => {
              try {
                handler(error)
              } catch (handlerError) {
                console.error(`Error in error handler for ${id}:`, handlerError)
              }
            })
            
            // Only reject if this is the initial connection attempt
            if (connection.reconnectCount === 0) {
              reject(error)
            }
          }

        } catch (error) {
          console.error(`Failed to create WebSocket for ${id}:`, error)
          updateConnectionState(id, 'error')
          reject(error)
        }
      })
    },
    [getAuthToken, initializeEventHandlers, updateConnectionState, cleanupConnection, setupHeartbeat],
  )

  // Disconnect WebSocket
  const disconnect = useCallback((id: string) => {
    console.log(`Disconnecting from ${id}`)
    cleanupConnection(id)
    connectionsRef.current.delete(id)
    updateConnectionState(id, 'disconnected')
  }, [cleanupConnection, updateConnectionState])

  // Send message through WebSocket
  const send = useCallback((id: string, message: any) => {
    const connection = connectionsRef.current.get(id)
    if (connection?.socket?.readyState === WebSocket.OPEN) {
      try {
        connection.socket.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Error sending message to ${id}:`, error)
      }
    } else {
      console.warn(`WebSocket ${id} is not connected (state: ${connection?.socket?.readyState})`)
    }
  }, [])

  // Get data for a specific connection and message type
  const getData = useCallback(<T = any>(connectionId: string, messageType?: string): T[] => {
    const connectionData = dataRef.current.get(connectionId) || {};

    if (messageType) {
      return (connectionData[messageType] || []) as T[];
    }

    // Return all data if no specific type requested
    return Object.values(connectionData).flat() as T[];
  }, []);

  // Check if connection is active
  const isConnected = useCallback((id: string): boolean => {
    return connectionsRef.current.get(id)?.isConnected || false
  }, [])

  // Get connection state
  const getConnectionState = useCallback((id: string): 'connected' | 'connecting' | 'disconnected' | 'error' => {
    return connectionStates.get(id) || 'disconnected'
  }, [connectionStates])

  // Event handler registration
  const onMessage = useCallback(
    (id: string, handler: (data: any) => void) => {
      initializeEventHandlers(id)
      const handlers = eventHandlersRef.current.get(id)!
      handlers.message.add(handler)

      return () => handlers.message.delete(handler)
    },
    [initializeEventHandlers],
  )

  const onConnect = useCallback(
    (id: string, handler: () => void) => {
      initializeEventHandlers(id)
      const handlers = eventHandlersRef.current.get(id)!
      handlers.connect.add(handler)

      return () => handlers.connect.delete(handler)
    },
    [initializeEventHandlers],
  )

  const onDisconnect = useCallback(
    (id: string, handler: () => void) => {
      initializeEventHandlers(id)
      const handlers = eventHandlersRef.current.get(id)!
      handlers.disconnect.add(handler)

      return () => handlers.disconnect.delete(handler)
    },
    [initializeEventHandlers],
  )

  const onError = useCallback(
    (id: string, handler: (error: Event) => void) => {
      initializeEventHandlers(id)
      const handlers = eventHandlersRef.current.get(id)!
      handlers.error.add(handler)

      return () => handlers.error.delete(handler)
    },
    [initializeEventHandlers],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('WebSocketProvider unmounting, cleaning up all connections')
      connectionsRef.current.forEach((connection, id) => {
        cleanupConnection(id)
      })
      connectionsRef.current.clear()
      dataRef.current.clear()
      eventHandlersRef.current.clear()
    }
  }, [cleanupConnection])

  const value: WebSocketContextValue = {
    connect,
    disconnect,
    send,
    getData,
    isConnected,
    getConnectionState,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

// Custom hook to use WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

// Typed hook for specific message types
export function useWebSocketData<T = any>(connectionId: string, messageType?: string): T[] {
  const { getData } = useWebSocket()
  const [data, setData] = useState<T[]>([])

  useEffect(() => {
    const currentData = getData<T>(connectionId, messageType)
    setData(currentData)
  }, [getData, connectionId, messageType])

  return data
}