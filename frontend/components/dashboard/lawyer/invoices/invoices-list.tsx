/* eslint-disable */

"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, Download, Send, Eye, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { Invoice } from "@/types/invoices"

interface InvoicesListProps {
  invoices: Invoice[]
  loading: boolean
  errorMessage: string
  getInvoices: (filters?: { status?: string; startDate?: string; endDate?: string }) => Promise<void>
  searchInvoices: (searchQuery: string) => Promise<void>
  downloadInvoicePDF: (invoiceNumber: string) => Promise<boolean>
  updateInvoiceStatus: (invoiceNumber: string, status: string) => Promise<boolean>
  sendInvoiceReminder: (invoiceNumber: string) => Promise<boolean>
  onViewInvoice: (invoiceNumber: string) => void
  onEditInvoice: (invoiceNumber: string) => void
  onCreateInvoice: () => void
}

export function InvoicesList({
  invoices,
  loading,
  errorMessage,
  getInvoices,
  searchInvoices,
  downloadInvoicePDF,
  updateInvoiceStatus,
  sendInvoiceReminder,
  onViewInvoice,
  onEditInvoice,
  onCreateInvoice,
}: InvoicesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchInvoices(searchQuery)
    } else {
      await getInvoices({ status: statusFilter, startDate, endDate })
    }
  }

  const handleFilterChange = async () => {
    await getInvoices({ status: statusFilter, startDate, endDate })
  }

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

  const handleStatusUpdate = async (invoiceNumber: string, newStatus: string) => {
    await updateInvoiceStatus(invoiceNumber, newStatus)
  }

  const handleSendReminder = async (invoiceNumber: string) => {
    await sendInvoiceReminder(invoiceNumber)
  }

  const handleDownload = async (invoiceNumber: string) => {
    await downloadInvoicePDF(invoiceNumber)
  }

  useEffect(() => {
    handleFilterChange()
  }, [statusFilter, startDate, endDate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الفواتير</h1>
          <p className="text-muted-foreground">إدارة فواتير العملاء والخدمات القانونية</p>
        </div>
        <Button onClick={onCreateInvoice} className="gap-2">
          <Plus className="h-4 w-4" />
          فاتورة جديدة
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث برقم الفاتورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الفاتورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="sent">مُرسل</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="من تاريخ"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input type="date" placeholder="إلى تاريخ" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} variant="default">
              بحث
            </Button>
            <Button
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setStartDate("")
                setEndDate("")
                getInvoices()
              }}
              variant="outline"
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 space-x-reverse">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">تاريخ الإصدار</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">متأخر</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        لا توجد فواتير
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{new Date(invoice.issue_date).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>{new Date(invoice.due_date).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell className="font-medium">{invoice.total_amount} ر.س</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                        </TableCell>
                        <TableCell>{invoice.is_overdue && <Badge variant="destructive">متأخر</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onViewInvoice(invoice.invoice_number)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onEditInvoice(invoice.invoice_number)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice.invoice_number)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {invoice.status !== "paid" && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.invoice_number, "paid")}>
                                    تحديد كمدفوع
                                  </DropdownMenuItem>
                                )}
                                {invoice.status === "draft" && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(invoice.invoice_number, "sent")}>
                                    إرسال الفاتورة
                                  </DropdownMenuItem>
                                )}
                                {invoice.is_overdue && (
                                  <DropdownMenuItem onClick={() => handleSendReminder(invoice.invoice_number)}>
                                    <Send className="h-4 w-4 ml-2" />
                                    إرسال تذكير
                                  </DropdownMenuItem>
                                )}
                                {invoice.status !== "cancelled" && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(invoice.invoice_number, "cancelled")}
                                    className="text-destructive"
                                  >
                                    إلغاء الفاتورة
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
