"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Service } from "@/types/marketplace"

interface DeleteServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  onConfirm: () => Promise<void>
  loading: boolean
}

export function DeleteServiceDialog({ open, onOpenChange, service, onConfirm, loading }: DeleteServiceDialogProps) {
  if (!service) return null

  const handleConfirm = async () => {
    await onConfirm()
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد حذف الخدمة</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف الخدمة "{service.title}"؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات
            المرتبطة بهذه الخدمة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? "جاري الحذف..." : "حذف الخدمة"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
