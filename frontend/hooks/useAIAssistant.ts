"use client"

import { useState, useCallback, useEffect } from "react"
import { useAIWebSocket } from "@/hooks/websockets/useAIWebSocket"

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

interface UseAIAssistantReturn {
  responses: AIResponse[]
  currentResponse: AIResponse | null
  loading: boolean
  error: string
  wsConnected: boolean
  processingStatus: string
  contextDocuments: Document[]
  askQuestion: (question: string, useContext?: boolean) => Promise<void>
  analyzeDocument: (documentId: number) => Promise<void>
  getResponses: () => void
  getResponse: (responseId: number) => void
  rateResponse: (responseId: number, rating: number) => Promise<void>
  getHistory: () => void
  connectWebSocket: () => void
  disconnectWebSocket: () => void
  clearError: () => void
  sendTyping: (isTyping: boolean) => void
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [processingStatus, setProcessingStatus] = useState("")
  const [contextDocuments, setContextDocuments] = useState<Document[]>([])

  const {
    wsConnected,
    error: wsError,
    connect: connectWs,
    disconnect: disconnectWs,
    askQuestion: askQuestionWs,
    analyzeDocument: analyzeDocumentWs,
    rateResponse: rateResponseWs,
    getHistory: getHistoryWs,
    sendTyping: sendTypingWs,
    onProcessingStatus,
    onResponseReceived,
    onHistoryReceived,
  } = useAIWebSocket()

  // Update error state from WebSocket hook
  useEffect(() => {
    if (wsError) {
      setError(wsError)
    }
  }, [wsError])

  const connectWebSocket = useCallback(() => {
    connectWs()
  }, [connectWs])

  const disconnectWebSocket = useCallback(() => {
    disconnectWs()
  }, [disconnectWs])

  const askQuestion = useCallback(
    async (question: string, useContext = false) => {
      setLoading(true)
      setProcessingStatus("")
      setContextDocuments([])
      try {
        await askQuestionWs(question, useContext)
      } finally {
        setLoading(false)
      }
    },
    [askQuestionWs],
  )

  const analyzeDocument = useCallback(
    async (documentId: number) => {
      setLoading(true)
      setProcessingStatus("")
      setContextDocuments([])
      try {
        await analyzeDocumentWs(documentId)
      } finally {
        setLoading(false)
      }
    },
    [analyzeDocumentWs],
  )

  const rateResponse = useCallback(
    async (responseId: number, rating: number) => {
      try {
        await rateResponseWs(responseId, rating)
        // Optimistically update the rating in the local state
        setResponses((prevResponses) =>
          prevResponses.map((response) => (response.id === responseId ? { ...response, rating } : response)),
        )
        setCurrentResponse((prev) => (prev?.id === responseId ? { ...prev, rating } : prev))
      } catch (err) {
        console.error("Failed to rate response:", err)
        setError("Failed to rate response")
      }
    },
    [rateResponseWs],
  )
  const getHistory = useCallback(async () => {
    setLoading(true)
    try {
      const history = await getHistoryWs()
      setResponses(history)
    } finally {
      setLoading(false)
    }
  }, [getHistoryWs])
  const getResponses = useCallback(() => {
    // This function seems to be intended to fetch all responses,
    // but the current implementation only fetches history.
    // Consider implementing a separate endpoint for fetching all responses if needed.
    getHistory()
  }, [getHistory])

  const getResponse = useCallback((responseId: number) => {
    // Implementation for fetching a single response is missing.
    // If needed, implement a WebSocket message type and handler for fetching a single response by ID.
    console.warn("Fetching a single response by ID is not implemented.")
  }, [])



  const clearError = useCallback(() => {
    setError("")
  }, [])

  useEffect(() => {
    const unsubscribeProcessingStatus = onProcessingStatus((message: string, documents?: Document[]) => {
      setProcessingStatus(message)
      if (documents) {
        setContextDocuments(documents)
      } else {
        setContextDocuments([])
      }
    })

    const unsubscribeResponseReceived = onResponseReceived((response: AIResponse) => {
      setCurrentResponse(response)
      setResponses((prevResponses) => [...prevResponses, response])
    })

    const unsubscribeHistoryReceived = onHistoryReceived((responses: AIResponse[], count: number, offset: number) => {
      setResponses(responses)
    })

    return () => {
      unsubscribeProcessingStatus()
      unsubscribeResponseReceived()
      unsubscribeHistoryReceived()
    }
  }, [onProcessingStatus, onResponseReceived, onHistoryReceived])

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      sendTypingWs(isTyping)
    },
    [sendTypingWs],
  )

  return {
    responses,
    currentResponse,
    loading,
    error,
    wsConnected,
    processingStatus,
    contextDocuments,
    askQuestion,
    analyzeDocument,
    getResponses,
    getResponse,
    rateResponse,
    getHistory,
    connectWebSocket,
    disconnectWebSocket,
    clearError,
    sendTyping,
  }
}
