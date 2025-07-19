"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DOCUMENT_TYPES } from "@/types/documents"

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadFile: (title: string, file: File, type: "PDF" | "DOCX" | "TXT") => Promise<void>
  onUploadUrl: (title: string, url: string, type: "PDF" | "DOCX" | "TXT") => Promise<void>
  onUploadPath: (title: string, path: string, type: "PDF" | "DOCX" | "TXT") => Promise<void>
  loading: boolean
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  onUploadFile,
  onUploadUrl,
  onUploadPath,
  loading,
}: DocumentUploadModalProps) {
  const [title, setTitle] = useState("")
  const [documentType, setDocumentType] = useState<"PDF" | "DOCX" | "TXT">("PDF")
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [path, setPath] = useState("")
  const [activeTab, setActiveTab] = useState("file")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) return

    try {
      if (activeTab === "file" && file) {
        await onUploadFile(title, file, documentType)
      } else if (activeTab === "url" && url) {
        await onUploadUrl(title, url, documentType)
      } else if (activeTab === "path" && path) {
        await onUploadPath(title, path, documentType)
      }

      // Reset form
      setTitle("")
      setFile(null)
      setUrl("")
      setPath("")
      setDocumentType("PDF")
      onOpenChange(false)
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const isFormValid = () => {
    if (!title) return false
    if (activeTab === "file" && !file) return false
    if (activeTab === "url" && !url) return false
    if (activeTab === "path" && !path) return false
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>رفع مستند جديد</DialogTitle>
          <DialogDescription>اختر طريقة رفع المستند وأدخل التفاصيل المطلوبة</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المستند *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المستند"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-type">نوع المستند *</Label>
              <Select value={documentType} onValueChange={(value: "PDF" | "DOCX" | "TXT") => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="file" className="flex items-center gap-2">
                رفع ملف
              </TabsTrigger>
              {/* <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                رابط URL
              </TabsTrigger> */}
           
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">اختر الملف *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    الملف المحدد: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </TabsContent>
{/* 
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">رابط المستند *</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  required
                />
              </div>
            </TabsContent> */}

         
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || !isFormValid()}>
              {loading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
