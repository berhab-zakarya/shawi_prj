"use client"

import { useState } from "react"
import { useInvoicesClient } from "@/hooks/marketplace/useInvoices"
import type { Invoice } from "@/types/invoices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Download, Calendar, DollarSign, FileText, AlertCircle, Loader2, Receipt } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ViewMode = "list" | "details"

export default function InvoicesPage() {
  const { invoices, loading, errorMessage, getInvoiceDetails, downloadInvoicePDF } = useInvoicesClient()
  const [currentView, setCurrentView] = useState<ViewMode>("list")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const handleViewDetails = async (invoiceNumber: string) => {
    setDetailsLoading(true)
    const invoice = await getInvoiceDetails(invoiceNumber)
    if (invoice) {
      setSelectedInvoice(invoice)
      setCurrentView("details")
    }
    setDetailsLoading(false)
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedInvoice(null)
  }

  const handleDownloadPDF = async (invoiceNumber: string) => {
    await downloadInvoicePDF(invoiceNumber)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "مدفوعة"
      case "sent":
        return "مرسلة"
      case "draft":
        return "مسودة"
      case "cancelled":
        return "ملغية"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderInvoicesList = () => (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
      </div>

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2 text-lg">جاري التحميل...</span>
        </div>
      ) : invoices.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد فواتير</h3>
            <p className="text-gray-600">لم يتم العثور على أي فواتير حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">تاريخ الإصدار</p>
                      <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">تاريخ الاستحقاق</p>
                      <p className="font-medium">{formatDate(invoice.due_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                      <p className="font-medium text-lg">{invoice.total_amount} ر.س</p>
                    </div>
                  </div>
                </div>

                {invoice.items.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">الخدمات:</p>
                    <div className="space-y-1">
                      {invoice.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-sm bg-gray-50 px-3 py-1 rounded">
                          {item.description} - {item.quantity} × {item.unit_price} ر.س
                        </p>
                      ))}
                      {invoice.items.length > 2 && (
                        <p className="text-sm text-gray-500">و {invoice.items.length - 2} خدمة أخرى...</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(invoice.invoice_number)}
                    disabled={detailsLoading}
                    className="flex-1"
                  >
                    {detailsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <FileText className="h-4 w-4 ml-2" />
                    )}
                    عرض التفاصيل
                  </Button>

                  {invoice.pdf_file && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(invoice.invoice_number)}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تحميل PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderInvoiceDetails = () => {
    if (!selectedInvoice) return null

    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToList} className="flex items-center gap-2 bg-transparent">
            <ArrowRight className="h-4 w-4" />
            العودة للقائمة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">تفاصيل الفاتورة {selectedInvoice.invoice_number}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{selectedInvoice.invoice_number}</CardTitle>
              <Badge className={getStatusColor(selectedInvoice.status)}>{getStatusText(selectedInvoice.status)}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">معلومات الفاتورة</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإصدار:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.issue_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الاستحقاق:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">اللغة:</span>
                      <span className="font-medium">
                        {selectedInvoice.language === "ar" ? "العربية" : "الإنجليزية"}
                      </span>
                    </div>
                    {selectedInvoice.sent_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الإرسال:</span>
                        <span className="font-medium">{formatDate(selectedInvoice.sent_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">الحالة</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status_display}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">مرسلة:</span>
                      <span className="font-medium">{selectedInvoice.is_sent ? "نعم" : "لا"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">متأخرة:</span>
                      <span className={`font-medium ${selectedInvoice.is_overdue ? "text-red-600" : "text-green-600"}`}>
                        {selectedInvoice.is_overdue ? "نعم" : "لا"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">تفاصيل الخدمات</h3>
              <div className="space-y-3">
                {selectedInvoice.items.map((item) => (
                  <Card key={item.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{item.description}</h4>
                        <span className="font-semibold text-lg">{item.total_price} ر.س</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>الكمية: {item.quantity}</span>
                        <span>سعر الوحدة: {item.unit_price} ر.س</span>
                      </div>
                      {item.service_title && <p className="text-sm text-gray-500 mt-1">الخدمة: {item.service_title}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">ملخص المبالغ</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{selectedInvoice.subtotal} ر.س</span>
                </div>
                {Number.parseFloat(selectedInvoice.tax_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة ({selectedInvoice.tax_rate}%):</span>
                    <span className="font-medium">{selectedInvoice.tax_amount} ر.س</span>
                  </div>
                )}
                {Number.parseFloat(selectedInvoice.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخصم:</span>
                    <span className="font-medium text-green-600">-{selectedInvoice.discount_amount} ر.س</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-primary">{selectedInvoice.total_amount} ر.س</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedInvoice.pdf_file && (
                <Button
                  onClick={() => handleDownloadPDF(selectedInvoice.invoice_number)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  تحميل PDF
                </Button>
              )}

              <Button variant="outline" onClick={handleBackToList} className="flex items-center gap-2 bg-transparent">
                <ArrowRight className="h-4 w-4" />
                العودة للقائمة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {currentView === "list" ? renderInvoicesList() : renderInvoiceDetails()}
    </div>
  )
}
