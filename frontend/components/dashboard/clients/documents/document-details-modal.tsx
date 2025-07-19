"use client"

import { useEffect, } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Document, } from "@/types/documents"
import { FileText, Download, Brain, Calendar, User,  Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  onAnalyze: (documentId: number) => Promise<void>
  onDownload: (document: Document) => Promise<void>
  loading: boolean
  error: string | null
}

export function DocumentDetailsModal({
  open,
  onOpenChange,
  document,
  onAnalyze,
  onDownload,
  loading,
  error,
}: DocumentDetailsModalProps) {

  if (!document) return null

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      PDF: "📄",
      DOCX: "📝",
      TXT: "📃",
    }
    return icons[type as keyof typeof icons] || "📄"
  }
    const { toast } = useToast()
  
  useEffect(() => {
        if (error) {
          toast({
            title: "خطأ",
            description: error,
            variant: "destructive",
          })
        }
      }, [error, toast])

  const getDocumentTypeBadge = (type: string) => {
    const colors = {
      PDF: "bg-red-100 text-red-800 border-red-200",
      DOCX: "bg-blue-100 text-blue-800 border-blue-200",
      TXT: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getDocumentTypeIcon(document.document_type)}</span>
            {document.title}
          </DialogTitle>
          <DialogDescription>تفاصيل المستند وتحليل الذكاء الاصطناعي</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات المستند</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">التفاصيل الأساسية</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">العنوان:</span>
                      <span>{document.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">النوع:</span>
                      <Badge variant="outline" className={getDocumentTypeBadge(document.document_type)}>
                        {getDocumentTypeIcon(document.document_type)} {document.document_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">رفعه:</span>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{document.uploaded_by}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">معلومات الرفع</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        تاريخ الرفع: {new Date(document.uploaded_at).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">الرقم التعريفي: #{document.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* AI Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  تحليل الذكاء الاصطناعي ({document.analyses.length})
                </div>
                <Button onClick={() => onAnalyze(document.id)} disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      {document.analyses.length > 0 ? "تحليل جديد" : "تحليل المستند"}
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {document.analyses.length > 0 ? (
                <div className="space-y-4">
                  {document.analyses.map((analysis, index) => (
                    <div key={analysis.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">التحليل #{index + 1}</span>
                          <span className={`font-bold ${getConfidenceColor(analysis.confidence_score)}`}>
                            {(analysis.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Badge variant="outline">{analysis.analysis_type}</Badge>
                      </div>
                      <p className="text-sm mb-2 line-clamp-3">{analysis.analysis_text}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2" />
                  <p>لم يتم تحليل هذا المستند بعد</p>
                  <p className="text-sm">اضغط على "تحليل المستند" لبدء التحليل بالذكاء الاصطناعي</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={() => onDownload(document)} disabled={loading} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تحميل المستند
            </Button>
            {document.analyses.length === 0 && (
              <Button onClick={() => onAnalyze(document.id)} disabled={loading} variant="outline">
                <Brain className="h-4 w-4 mr-2" />
                إعادة التحليل
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
