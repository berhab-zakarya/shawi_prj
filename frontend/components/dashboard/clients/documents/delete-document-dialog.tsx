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
import type { Document } from "@/types/documents"

interface DeleteDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  onConfirm: () => Promise<void>
  loading: boolean
}

export function DeleteDocumentDialog({ open, onOpenChange, document, onConfirm, loading }: DeleteDocumentDialogProps) {
  if (!document) return null

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
          <AlertDialogTitle>تأكيد حذف المستند</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف المستند "{document.title}"؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات
            والتحليلات المرتبطة بهذا المستند.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? "جاري الحذف..." : "حذف المستند"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
