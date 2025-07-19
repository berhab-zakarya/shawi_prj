"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Contract } from "@/types/contracts"
import { FileText, Download, PenTool, Eye } from "lucide-react"

interface ContractDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract: Contract | null
  onGenerateText: (id: number) => Promise<void>
  onSign: (id: number) => Promise<void>
  onExport: (id: number, format: "pdf" | "docx") => Promise<void>
  loading: boolean
}

export function ContractDetailsModal({
  open,
  onOpenChange,
  contract,
  onGenerateText,
  onSign,
  onExport,
  loading,
}: ContractDetailsModalProps) {
  const [showFullText, setShowFullText] = useState(false)

  if (!contract) return null

  const getStatusBadge = () => {
    if (contract.is_locked) {
      return <Badge variant="secondary">مكتمل</Badge>
    }
    if (contract.needs_review) {
      return <Badge variant="outline">في المراجعة</Badge>
    }
    return <Badge variant="default">نشط</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            تفاصيل العقد #{contract.id}
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            تم الإنشاء في {new Date(contract.created_at).toLocaleDateString("ar-SA")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">نوع العقد</h4>
              <p>{contract.contract_type}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">حالة المراجعة</h4>
              <p>{contract.needs_review ? "يحتاج مراجعة" : "لا يحتاج م��اجعة"}</p>
            </div>
          </div>

          <Separator />

          {/* Contract Data */}
          <div>
            <h4 className="font-semibold mb-2">بيانات العقد</h4>
            <div className="bg-muted p-4 rounded-lg">
              {Object.entries(contract.data).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Text */}
          {contract.full_text && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">نص العقد</h4>
                  <Button variant="outline" size="sm" onClick={() => setShowFullText(!showFullText)}>
                    <Eye className="w-4 h-4 mr-2" />
                    {showFullText ? "إخفاء" : "عرض"}
                  </Button>
                </div>
                {showFullText && (
                  <div
                    className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: contract.full_text }}
                  />
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!contract.full_text && (
              <Button onClick={() => onGenerateText(contract.id)} disabled={loading}>
                <FileText className="w-4 h-4 mr-2" />
                توليد نص العقد
              </Button>
            )}

            {!contract.is_locked && contract.full_text && (
              <Button onClick={() => onSign(contract.id)} disabled={loading} variant="outline">
                <PenTool className="w-4 h-4 mr-2" />
                توقيع العقد
              </Button>
            )}

            {contract.full_text && (
              <>
                <Button onClick={() => onExport(contract.id, "pdf")} disabled={loading} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  تحميل PDF
                </Button>
                <Button onClick={() => onExport(contract.id, "docx")} disabled={loading} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  تحميل Word
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
