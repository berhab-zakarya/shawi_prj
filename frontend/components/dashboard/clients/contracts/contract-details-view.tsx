"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Contract } from "@/types/contracts"
import { FileText, Download, PenTool, Eye, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ContractDetailsViewProps {
  contract: Contract
  onBack: () => void
  onGenerateText: (id: number) => Promise<{ full_text: string; text_version: string } | null> // Corrected return type
  onSign: (id: number) => Promise<boolean> 
  onExport: (id: number, format: "pdf" | "docx") => Promise<boolean>
  loading: boolean
}

export function ContractDetailsView({
  contract,
  onBack,
  onGenerateText,
  onSign,
  onExport,
  loading,
}: ContractDetailsViewProps) {
  const [showFullText, setShowFullText] = useState(false)

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
    <div className="mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل العقد #{contract.id}</h1>
            <p className="text-muted-foreground">
              تم الإنشاء في {new Date(contract.created_at).toLocaleDateString("ar-SA")}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات العقد</CardTitle>
          <CardDescription>نظرة عامة على تفاصيل العقد الأساسية.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">نوع العقد</h4>
              <p>{contract.contract_type}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">حالة المراجعة</h4>
              <p>{contract.needs_review ? "يحتاج مراجعة" : "لا يحتاج مراجعة"}</p>
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
                    className="bg-muted p-4 rounded-lg w-full overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: contract.full_text }}
                  />
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
           <Button onClick={() => onGenerateText(contract.id)} disabled={loading}>
                <FileText className="w-4 h-4 mr-2" />
                توليد نص العقد
              </Button>

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
        </CardContent>
      </Card>
    </div>
  )
}
