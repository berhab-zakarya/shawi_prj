"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useWebSocket } from "@/components/websocket-provider"
import { AI_WEBSOCKET_ENDPOINT } from "@/lib/apiConstants"

// Types
interface Document {
  id: number
  title: string
}

interface AIResponse {
  id: number
  question: string
  answer: string
  rating?: number
  created_at: string
  context_documents: Document[]
  pdf_export?: string
}

interface WebSocketMessage {
  type: string
  message?: string
  error?: string
  response?: AIResponse
  document?: Document
  documents?: Document[]
  responses?: AIResponse[]
  count?: number
  offset?: number
  response_id?: number
  is_typing?: boolean
  user_id?: number
}

interface AskQuestionRequest {
  type: "ask_question"
  question: string
  use_context?: boolean
}

interface AnalyzeDocumentRequest {
  type: "analyze_document"
  document_id: number
}

interface RateResponseRequest {
  type: "rate_response"
  response_id: number
  rating: number
}

interface GetHistoryRequest {
  type: "get_history"
  limit?: number
  offset?: number
}

interface TypingRequest {
  type: "typing"
  is_typing: boolean
}

interface UseAIWebSocketReturn {
  wsConnected: boolean
  error: string
  connect: () => void
  disconnect: () => void
  askQuestion: (question: string, useContext?: boolean) => Promise<number | null>
  analyzeDocument: (documentId: number) => Promise<number | null>
  rateResponse: (responseId: number, rating: number) => Promise<void>
  getHistory: (limit?: number, offset?: number) => Promise<AIResponse[]>
  sendTyping: (isTyping: boolean) => void
  onProcessingStatus: (handler: (message: string, documents?: Document[]) => void) => () => void
  onResponseReceived: (handler: (response: AIResponse) => void) => () => void
  onHistoryReceived: (handler: (responses: AIResponse[], count: number, offset: number) => void) => () => void
}

export function useAIWebSocket(): UseAIWebSocketReturn {
  const [error, setError] = useState("")
  const currentResponseIdRef = useRef<number | null>(null)
  const wsConnectionId = "ai-assistant"
  const processingStatusHandlers = useRef<Set<(message: string, documents?: Document[]) => void>>(new Set())
  const responseReceivedHandlers = useRef<Set<(response: AIResponse) => void>>(new Set())
  const historyReceivedHandlers = useRef<Set<(responses: AIResponse[], count: number, offset: number) => void>>(new Set())

  const {
    connect: wsConnect,
    disconnect: wsDisconnect,
    send,
    isConnected,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = useWebSocket()

  const wsConnected = isConnected(wsConnectionId)

  // Handle WebSocket messages
  useEffect(() => {
    const unsubscribeMessage = onMessage(wsConnectionId, (data: WebSocketMessage) => {
      if (data.error) {
        setError(data.error)
        currentResponseIdRef.current = null
        return
      }

      switch (data.type) {
        case "processing_started":
        case "processing_status":
        case "context_found":
        case "no_context":
        case "context_error":
          processingStatusHandlers.current.forEach(handler =>
            handler(data.message || "", data.documents)
          )
          break

        case "question_answered":
        case "document_analyzed":
          if (data.response) {
            currentResponseIdRef.current = data.response.id
            responseReceivedHandlers.current.forEach(handler => handler(data.response!))
          }
          break

        case "rating_saved":
          if (data.response_id) {
            currentResponseIdRef.current = data.response_id
          }
          break

        case "history_retrieved":
          if (data.responses && data.count !== undefined && data.offset !== undefined) {
            historyReceivedHandlers.current.forEach(handler =>
              handler(data.responses!, data.count!, data.offset!)
            )
          }
          break

        case "typing_status":
          console.log(`Typing status: User ${data.user_id} is ${data.is_typing ? "typing" : "not typing"}`)
          break

        case "connection_established":
          console.log("Connection established:", data.message)
          break

        default:
          console.log("Unknown message type:", data)
      }
    })

    return unsubscribeMessage
  }, [onMessage, wsConnectionId])

  // Handle connection events
  useEffect(() => {
    const unsubscribeConnect = onConnect(wsConnectionId, () => {
      setError("")
      console.log("AI WebSocket connected")
    })

    const unsubscribeDisconnect = onDisconnect(wsConnectionId, () => {
      console.log("AI WebSocket disconnected")
    })

    const unsubscribeError = onError(wsConnectionId, (error) => {
      console.error("AI WebSocket error:", error)
      setError("WebSocket connection error")
    })

    return () => {
      unsubscribeConnect()
      unsubscribeDisconnect()
      unsubscribeError()
    }
  }, [onConnect, onDisconnect, onError, wsConnectionId])

  const connect = useCallback(() => {
    wsConnect(wsConnectionId, {
      url: AI_WEBSOCKET_ENDPOINT,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
    }).catch((error) => {
      console.error("Failed to connect to AI WebSocket:", error)
      setError("Failed to connect to AI assistant")
    })
  }, [wsConnect, wsConnectionId])

  const disconnect = useCallback(() => {
    wsDisconnect(wsConnectionId)
  }, [wsDisconnect, wsConnectionId])

  const askQuestion = useCallback(
    async (question: string, useContext = false): Promise<number | null> => {
      if (!question.trim()) {
        setError("Question is required")
        return null
      }

      if (!wsConnected) {
        setError("WebSocket not connected")
        return null
      }

      try {
        setError("")
        currentResponseIdRef.current = null

        const message: AskQuestionRequest = {
          type: "ask_question",
          question,
          use_context: useContext,
        }

        send(wsConnectionId, message)

        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            setError("Request timed out")
            resolve(null)
          }, 30000)

          const checkCompletion = () => {
            if (currentResponseIdRef.current !== null) {
              clearTimeout(timeout)
              resolve(currentResponseIdRef.current)
            } else {
              setTimeout(checkCompletion, 300)
            }
          }

          setTimeout(checkCompletion, 100)
        })
      } catch (sendError) {
        console.error("Error sending question:", sendError)
        setError("Failed to send question")
        return null
      }
    },
    [wsConnected, send, wsConnectionId]
  )

  const analyzeDocument = useCallback(
    async (documentId: number): Promise<number | null> => {
      if (!wsConnected) {
        setError("WebSocket not connected")
        return null
      }

      try {
        setError("")
        currentResponseIdRef.current = null

        const message: AnalyzeDocumentRequest = {
          type: "analyze_document",
          document_id: documentId,
        }

        send(wsConnectionId, message)

        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            setError("Document analysis timed out")
            resolve(null)
          }, 30000)

          const checkCompletion = () => {
            if (currentResponseIdRef.current !== null) {
              clearTimeout(timeout)
              resolve(currentResponseIdRef.current)
            } else {
              setTimeout(checkCompletion, 300)
            }
          }

          setTimeout(checkCompletion, 100)
        })
      } catch (sendError) {
        console.error("Error sending document analysis request:", sendError)
        setError("Failed to send document analysis request")
        return null
      }
    },
    [wsConnected, send, wsConnectionId]
  )

  const rateResponse = useCallback(
    async (responseId: number, rating: number): Promise<void> => {
      if (!wsConnected) {
        setError("WebSocket not connected")
        return
      }

      if (rating < 1 || rating > 5) {
        setError("Rating must be between 1 and 5")
        return
      }

      try {
        setError("")
        currentResponseIdRef.current = null

        const message: RateResponseRequest = {
          type: "rate_response",
          response_id: responseId,
          rating,
        }

        send(wsConnectionId, message)
      } catch (sendError) {
        console.error("Error sending rating:", sendError)
        setError("Failed to send rating")
      }
    },
    [wsConnected, send, wsConnectionId]
  )

  const getHistory = useCallback(
    async (limit = 10, offset = 0): Promise<AIResponse[]> => {
      if (!wsConnected) {
        setError("WebSocket not connected")
        return []
      }

      try {
        setError("")

        const message: GetHistoryRequest = {
          type: "get_history",
          limit,
          offset,
        }

        send(wsConnectionId, message)

        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            setError("History retrieval timed out")
            resolve([])
          }, 30000)

          const handler = (responses: AIResponse[], count: number, offset: number) => {
            clearTimeout(timeout)
            historyReceivedHandlers.current.delete(handler)
            resolve(responses || [])
          }

          historyReceivedHandlers.current.add(handler)
        })
      } catch (sendError) {
        console.error("Error sending history request:", sendError)
        setError("Failed to send history request")
        return []
      }
    },
    [wsConnected, send, wsConnectionId]
  )

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!wsConnected) {
        return
      }

      try {
        const message: TypingRequest = {
          type: "typing",
          is_typing: isTyping,
        }
        send(wsConnectionId, message)
      } catch (sendError) {
        console.error("Error sending typing indicator:", sendError)
      }
    },
    [wsConnected, send, wsConnectionId]
  )

  const onProcessingStatus = useCallback(
    (handler: (message: string, documents?: Document[]) => void) => {
      processingStatusHandlers.current.add(handler)
      return () => processingStatusHandlers.current.delete(handler)
    },
    []
  )

  const onResponseReceived = useCallback(
    (handler: (response: AIResponse) => void) => {
      responseReceivedHandlers.current.add(handler)
      return () => responseReceivedHandlers.current.delete(handler)
    },
    []
  )

  const onHistoryReceived = useCallback(
    (handler: (responses: AIResponse[], count: number, offset: number) => void) => {
      historyReceivedHandlers.current.add(handler)
      return () => historyReceivedHandlers.current.delete(handler)
    },
    []
  )

  return {
    wsConnected,
    error,
    connect,
    disconnect,
    askQuestion,
    analyzeDocument,
    rateResponse,
    getHistory,
    sendTyping,
    onProcessingStatus,
    onResponseReceived,
    onHistoryReceived,
  }
}