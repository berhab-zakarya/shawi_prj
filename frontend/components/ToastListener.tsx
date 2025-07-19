// components/ToastListener.tsx
"use client"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function ToastListener() {
  const { toasts } = useToast()

  useEffect(() => {
    console.log("🎯 [TOAST LISTENER] mounted, toasts:", toasts.length)
  }, [toasts])

  return null
}
