"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Download, Send, Edit, FileText, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Invoice } from "@/types/invoices"

interface InvoiceViewProps {
  invoiceNumber: string
  onBack: () => void
  onEdit: () => void
  getInvoiceDetails: (invoiceNumber: string) => Promise<Invoice | null>
  downloadInvoicePDF: (invoiceNumber: string) => Promise<boolean>
  sendInvoiceReminder: (invoiceNumber: string) => Promise<boolean>
  updateInvoiceStatus: (invoiceNumber: string, status: string) => Promise<boolean>
  loading: boolean
  errorMessage: string
}

export function InvoiceView({
  invoiceNumber,
  onBack,
  onEdit,
  getInvoiceDetails,
  downloadInvoicePDF,
  sendInvoiceReminder,
  updateInvoiceStatus,
  loading,
  errorMessage,
}: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      const invoiceData = await getInvoiceDetails(invoiceNumber)
      setInvoice(invoiceData)
    }
    fetchInvoice()
  }, [invoiceNumber, getInvoiceDetails])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "draft":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "مدفوع"
      case "sent":
        return "مُرسل"
      case "draft":
        return "مسودة"
      case "cancelled":
        return "ملغي"
      default:
        return status
    }
  }

  const handleDownload = async () => {
    setActionLoading(true)
    await downloadInvoicePDF(invoiceNumber)
    setActionLoading(false)
  }

  const handleSendReminder = async () => {
    setActionLoading(true)
    await sendInvoiceReminder(invoiceNumber)
    setActionLoading(false)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true)
    const success = await updateInvoiceStatus(invoiceNumber, newStatus)
    if (success && invoice) {
      setInvoice({ ...invoice, status: newStatus as any })
    }
    setActionLoading(false)
  }

  if (loading || !invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">فاتورة {invoice.invoice_number}</h1>
            <p className="text-muted-foreground">تفاصيل الفاتورة والعناصر</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onEdit} variant="outline" className="gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
          <Button onClick={handleDownload} disabled={actionLoading} className="gap-2">
            <Download className="h-4 w-4" />
            تحميل PDF
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة الفاتورة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-lg">
              {getStatusText(invoice.status)}
            </Badge>
            {invoice.is_overdue && (
              <Badge variant="destructive" className="mt-2">
                متأخر
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تاريخ الإصدار</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(invoice.issue_date).toLocaleDateString("ar-SA")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تاريخ الاستحقاق</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(invoice.due_date).toLocaleDateString("ar-SA")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ الإجمالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoice.total_amount} ر.س</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">رقم الفاتورة</p>
                <p className="text-lg font-semibold">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">اللغة</p>
                <p className="text-lg">{invoice.language === "ar" ? "العربية" : "الإنجليزية"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">تاريخ الإرسال</p>
                <p className="text-lg">
                  {invoice.sent_at ? new Date(invoice.sent_at).toLocaleDateString("ar-SA") : "لم يتم الإرسال"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">طلب الخدمة</p>
                <p className="text-lg">#{invoice.service_request}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص المبالغ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>المبلغ الفرعي:</span>
              <span className="font-semibold">{invoice.subtotal} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span>الضريبة ({invoice.tax_rate}%):</span>
              <span className="font-semibold">{invoice.tax_amount} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span>الخصم:</span>
              <span className="font-semibold">-{invoice.discount_amount} ر.س</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>المبلغ الإجمالي:</span>
              <span>{invoice.total_amount} ر.س</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>عناصر الفاتورة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">سعر الوحدة</TableHead>
                <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                <TableHead className="text-right">الخدمة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit_price} ر.س</TableCell>
                  <TableCell className="font-semibold">{item.total_price} ر.س</TableCell>
                  <TableCell>{item.service_title}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {invoice.status !== "paid" && (
              <Button onClick={() => handleStatusUpdate("paid")} disabled={actionLoading} variant="default">
                تحديد كمدفوع
              </Button>
            )}
            {invoice.status === "draft" && (
              <Button onClick={() => handleStatusUpdate("sent")} disabled={actionLoading} variant="secondary">
                إرسال الفاتورة
              </Button>
            )}
            {invoice.is_overdue && (
              <Button
                onClick={handleSendReminder}
                disabled={actionLoading}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Send className="h-4 w-4" />
                إرسال تذكير
              </Button>
            )}
            {invoice.status !== "cancelled" && (
              <Button onClick={() => handleStatusUpdate("cancelled")} disabled={actionLoading} variant="destructive">
                إلغاء الفاتورة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
