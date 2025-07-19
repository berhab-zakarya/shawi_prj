import { get, post } from "@/lib/api"
import { API_BASE_URL } from "@/lib/apiConstants"
import { clearTokens } from "@/lib/jwtService"
import { User } from "@/types"
import { ChatRoom, Message } from "@/types/notification"
import { useCallback, useEffect, useState } from "react"
interface ErrorState {
    message: string
    type: "network" | "validation" | "authentication" | "not_found" | "server" | "websocket" | "duplicate_reaction" | null
}

interface CreateRoomInput {
    name: string
    room_type: "ONE_TO_ONE" | "GROUP" | "SUPPORT"
    participants: string[]
}

export function useChatAPI() {
    const [loading, setLoading] = useState({
        rooms: false,

    })
    const [rooms, setRooms] = useState<ChatRoom[]>([])
    const [messages, setMessages] = useState<{ [roomName: string]: Message[] }>({})
    const [error, setError] = useState<ErrorState>({ message: "", type: null })
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
                // clearTokens();
                errorType = "network"
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

    const createRoom = useCallback(
        async (data: CreateRoomInput) => {
            try {
                setLoading((prev) => ({ ...prev, rooms: true }))
                resetError()
                const response = await post<ChatRoom, CreateRoomInput>(`${API_BASE_URL}rooms/`, data, { isPrivate: true })
                getRooms();
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
                return response.data
            } catch (error) {
                console.log(error)
                throw handleError(error, "fetch message history")
            } finally {
                setLoading((prev) => ({ ...prev, messages: false }))
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

    useEffect(() => {
        getActiveUsers
        getRooms()
    }, [getRooms,getActiveUsers])

    return {
        createRoom,
        getMessageHistory,
        getRooms,
        getActiveUsers,
        rooms,
        messages,
        loading,
        error,
        resetError,
    }
}