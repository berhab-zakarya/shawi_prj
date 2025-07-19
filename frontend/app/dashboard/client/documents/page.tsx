"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { ApiError, Document } from "@/types/documents"
import {
  Loader2,
  AlertCircle,
  Search,
  FileText,
  Plus,
  Eye,
  Trash2,
  Upload,
  Brain,
  Download,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { DocumentUploadModal } from "@/components/dashboard/clients/documents/document-upload-modal"
import { DocumentDetailsModal } from "@/components/dashboard/clients/documents/document-details-modal"
import { DeleteDocumentDialog } from "@/components/dashboard/clients/documents/delete-document-dialog"
import { useDocumentsAPI } from "@/hooks/useDocumentsAPI"
import { downloadFile } from "@/lib/utils"


export default function ClientDocuments() {
  const { documents, loading, errors,errorGlobal, uploadDocument, analyzeDocument, deleteDocument, getDocument, } = useDocumentsAPI()

  const [searchTerm, setSearchTerm] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const { toast } = useToast()

  const filteredDocuments = documents.filter(
    (document) =>
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      PDF: "📄",
      DOCX: "📝",
      TXT: "📃",
    }
    return icons[type as keyof typeof icons] || "📄"
  }

  const getDocumentTypeBadge = (type: string) => {
    const colors = {
      PDF: "bg-red-100 text-red-800 border-red-200",
      DOCX: "bg-blue-100 text-blue-800 border-blue-200",
      TXT: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getErrorMessage = (error: ApiError | null): string => {
    if (!error) return ""
    if (error.error) return error.error
    if (error.detail) return error.detail
    if (error.non_field_errors) return error.non_field_errors.join(", ")
    return "حدث خطأ غير متوقع"
  }

  const getDocumentStats = () => {
    const totalDocuments = documents.length
    const pdfCount = documents.filter((d) => d.document_type === "PDF").length
    const docxCount = documents.filter((d) => d.document_type === "DOCX").length
    const txtCount = documents.filter((d) => d.document_type === "TXT").length
    const analyzedCount = documents.filter((d) => d.analyses.length > 0).length

    return { totalDocuments, pdfCount, docxCount, txtCount, analyzedCount }
  }

  const stats = getDocumentStats()

  
  
  const handleUploadFile = async (title: string, file: File, type: "PDF" | "DOCX" | "TXT") => {
    const result = await uploadDocument({
      title,
      file,
      document_type: type,
    })
    if (result) {
      toast({
        title: "تم رفع المستند بنجاح",
        description: `تم رفع المستند "${result.title}" بنجاح`,
      })
      setShowUploadModal(false)
    } else {
      toast({
        title: "فشل في رفع المستند",
        description: errors,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
      if (errors) {
        toast({
          title: "خطأ",
          description: errors,
          variant: "destructive",
        })
      }
    }, [errors, toast])

  const handleUploadUrl = async (title: string, url: string, type: "PDF" | "DOCX" | "TXT") => {
    const result = await uploadDocument({
      title,
      file_url: url,
      document_type: type,
    })
    if (result) {
      toast({
        title: "تم رفع المستند بنجاح",
        description: `تم رفع المستند "${result.title}" من الرابط بنجاح`,
      })
      setShowUploadModal(false)
    } else {
      toast({
        title: "فشل في رفع المستند",
        description: errors,
        variant: "destructive",
      })
    }
  }

  const handleUploadPath = async (title: string, path: string, type: "PDF" | "DOCX" | "TXT") => {
    const result = await uploadDocument({
      title,
      file_path: path,
      document_type: type,
    })
    if (result) {
      toast({
        title: "تم رفع المستند بنجاح",
        description: `تم رفع المستند "${result.title}" من المسار المحلي بنجاح`,
      })
      setShowUploadModal(false)
    } else {
      toast({
        title: "فشل في رفع المستند",
        description: errors,
        variant: "destructive",
      })
    }
  }

  const handleViewDocument = async (document: Document) => {

    window.open(`/dashboard/client/documents/${document.id}`)
  
  }

   const handleAnalyzeDocument = async (documentId: number) => {
    const result = await analyzeDocument(documentId)
    if (result) {
      toast({
        title: "تم تحليل المستند بنجاح",
        description: `تم تحليل المستند بالذكاء الاصطناعي بدرجة ثقة ${(result.confidence_score * 100).toFixed(1)}%`,
      })
      // Refresh the current document if it's being viewed
      if (selectedDocument && selectedDocument.id === documentId) {
        const updatedDocument = await getDocument(documentId)
        if (updatedDocument) {
          setSelectedDocument(updatedDocument)
        }
      }
    } else {
      toast({
        title: "فشل في تحليل المستند",
        description: errors,
        variant: "destructive",
      })
    }
  }
  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedDocument) {
      const success = await deleteDocument(selectedDocument.id)
      if (success) {
        toast({
          title: "تم حذف المستند",
          description: `تم حذف المستند "${selectedDocument.title}" بنجاح`,
        })
      }
    }
  }

  const handleDownloadDocument = async (document: Document) => {
    console.log("Downloading document:", document)
     await downloadFile(document.file)
    toast({
      title: "تم تحميل المستند",
      description: `تم تحميل المستند "${document.title}" بنجاح`,
    })
  }

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">المستندات المرفوعة</h1>
            <p className="text-muted-foreground">إدارة وتحليل المستندات بالذكاء الاصطناعي</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل المستندات...</p>
          </div>
        </div>
      </div>
    )
  }

  if (errorGlobal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">المستندات المرفوعة</h1>
            <p className="text-muted-foreground">إدارة وتحليل المستندات بالذكاء الاصطناعي</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">حدث خطأ في تحميل المستندات</p>
              <p className="text-sm">{getErrorMessage(errorGlobal)}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المستندات المرفوعة</h1>
          <p className="text-muted-foreground">إدارة وتحليل المستندات القانونية بالذكاء الاصطناعي</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          رفع مستند جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستندات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملفات PDF</CardTitle>
            <span className="text-lg">📄</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pdfCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مستندات Word</CardTitle>
            <span className="text-lg">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.docxCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملفات نصية</CardTitle>
            <span className="text-lg">📃</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.txtCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مستندات محللة</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analyzedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في المستندات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            إدارة المستندات
          </CardTitle>
          <CardDescription>جميع المستندات المرفوعة مع إمكانية التحليل بالذكاء الاصطناعي</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مستندات مرفوعة"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "جرب البحث بكلمات مختلفة" : "ابدأ برفع مستند جديد"}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  رفع مستند جديد
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">المستند</TableHead>
                  <TableHead className="text-start">النوع</TableHead>
                  <TableHead className="text-start">رفعه</TableHead>
                  <TableHead className="text-start">تاريخ الرفع</TableHead>
                  <TableHead className="text-start">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getDocumentTypeIcon(document.document_type)}</span>
                        <div>
                          <div className="font-medium">{document.title}</div>
                          <div className="text-sm text-muted-foreground">
                            #{document.id} • {document.analyses.length} تحليل
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDocumentTypeBadge(document.document_type)}>
                        {document.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{document.uploaded_by}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(document.uploaded_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDocument(document)}>
                            <Eye className="h-4 w-4 mr-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAnalyzeDocument(document.id)}>
                            <Brain className="h-4 w-4 mr-2" />
                            تحليل بالذكاء الاصطناعي
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadDocument(document)}>
                            <Download className="h-4 w-4 mr-2" />
                            تحميل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDocument(document)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {documents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                عرض {filteredDocuments.length} من أصل {documents.length} مستند
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
         onUploadFile={handleUploadFile}
         onUploadUrl={handleUploadUrl}
         onUploadPath={handleUploadPath}
        loading={false}
      />

      {/* Document Details Modal */}
      <DocumentDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        document={selectedDocument}
        onAnalyze={handleAnalyzeDocument}
        onDownload={handleDownloadDocument}
        loading={loading}
        error={errors}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        document={selectedDocument}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  )
}

// Download file from URL


