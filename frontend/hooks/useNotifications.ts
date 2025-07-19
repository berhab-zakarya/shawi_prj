"use client"
import { del, get, post } from "@/lib/api";
import { API_BASE_URL } from "@/lib/apiConstants";
import { clearTokens } from "@/lib/jwtService";
import { useCallback, useEffect, useState } from "react"
import { Notification, ChatRoom, Message, Reaction } from "@/types/notification"
interface ErrorState {
  message: string
  type: "network" | "validation" | "authentication" | "not_found" | "server" | "websocket" | "duplicate_reaction" | null
}

export function useNotification() {

  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    getUnreadNotificationCount()
    getNotifications()
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
  const resetError = useCallback(() => {
    setError({ message: "", type: null })
  }, [])
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

  const [loading, setLoading] = useState({
    notifications: false,
    websocket: false,

  })
  const [error, setError] = useState<ErrorState>({ message: "", type: null })
  const [unreadCount, setUnreadCount] = useState<number>(0)

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

  return {
    notifications,
    loading,
    deleteNotification,
    clearAllNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    error,
    unreadCount,
    resetError,
  }
}