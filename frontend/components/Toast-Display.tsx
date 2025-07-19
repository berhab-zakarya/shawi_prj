"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose
} from "@/components/ui/toast"

export function ToastDisplay() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open={toast.open}
          onOpenChange={toast.onOpenChange}
        >
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          <ToastClose />
        </Toast>
      ))}
    </>
  )
}
