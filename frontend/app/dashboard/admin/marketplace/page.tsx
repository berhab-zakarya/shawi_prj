"use client"

import { useState } from "react"
import { useAdminMarketplace } from "@/hooks/marketplace/useAdminMarketplace"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  CreditCard,
  FileText,
  Star,
  RefreshCw,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Save,
  X,
} from "lucide-react"
import type { Service, ServiceData, PaymentData, ReviewData } from "@/types/monitoring"

type ViewMode = "list" | "view" | "edit" | "create"

interface ViewState {
  services: { mode: ViewMode; selectedId?: number }
  payments: { mode: ViewMode; selectedId?: number }
  documents: { mode: ViewMode; selectedId?: number }
  reviews: { mode: ViewMode; selectedId?: number }
}

interface FormDataState {
  // Service form data
  title?: string
  price?: string
  category?: string
  description?: string
  lawyer_id?: number

  // Payment form data
  status?: string

  // Review form data
  rating?: number
  comment?: string

  // Document form data
  file?: File
  uploaded_by_id?: number
}

export default function AdminMarketplacePage() {
  const {
    services,
    payments,
    documents,
    reviews,
    loading,
    errorMessage,
    fetchServices,
    createService,
    updateService,
    deleteService,
    fetchPayments,
    updatePayment,
    deletePayment,
    fetchDocuments,
    deleteDocument,
    fetchReviews,
    updateReview,
    deleteReview,
  } = useAdminMarketplace()

  const [viewState, setViewState] = useState<ViewState>({
    services: { mode: "list" },
    payments: { mode: "list" },
    documents: { mode: "list" },
    reviews: { mode: "list" },
  })

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: "service" | "payment" | "document" | "review"
    id: number
    title: string
  }>({
    isOpen: false,
    type: "service",
    id: 0,
    title: "",
  })

  const [formData, setFormData] = useState<FormDataState>({})

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      completed: "مكتمل",
      pending: "قيد الانتظار",
      cancelled: "ملغي",
      paid: "مدفوع",
      failed: "فشل",
      approved: "موافق عليه",
      rejected: "مرفوض",
    }
    return statusMap[status.toLowerCase()] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: string) => {
    return `${price} ريال`
  }

  const handleViewChange = (tab: keyof ViewState, mode: ViewMode, selectedId?: number) => {
    setViewState((prev) => ({
      ...prev,
      [tab]: { mode, selectedId },
    }))
    if (mode === "create" || mode === "edit") {
      if (mode === "edit" && selectedId) {
        // Pre-fill form data based on the selected item
        switch (tab) {
          case "services":
            const service = services.find((s) => s.id === selectedId)
            if (service) {
              setFormData({
                title: service.title,
                price: service.price,
                category: service.category,
                description: service.description,
              })
            }
            break
          case "payments":
            const payment = payments.find((p) => p.id === selectedId)
            if (payment) {
              setFormData({ status: payment.status })
            }
            break
          case "reviews":
            const review = reviews.find((r) => r.id === selectedId)
            if (review) {
              setFormData({
                rating: review.rating,
                comment: review.comment,
              })
            }
            break
        }
      } else {
        setFormData({})
      }
    }
  }

  const handleSubmit = async (tab: keyof ViewState) => {
    try {
      const { mode, selectedId } = viewState[tab]

      switch (tab) {
        case "services":
          if (mode === "create") {
            await createService(formData as ServiceData)
          } else if (mode === "edit" && selectedId) {
            await updateService(selectedId, formData as ServiceData)
          }
          break
        case "payments":
          if (mode === "edit" && selectedId) {
            await updatePayment(selectedId, formData as PaymentData)
          }
          break
        case "reviews":
          if (mode === "edit" && selectedId) {
            await updateReview(selectedId, formData as ReviewData)
          }
          break
      }

      handleViewChange(tab, "list")
      setFormData({})
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleDelete = async () => {
    try {
      const { type, id } = deleteModal

      switch (type) {
        case "service":
          await deleteService(id)
          break
        case "payment":
          await deletePayment(id)
          break
        case "document":
          await deleteDocument(id)
          break
        case "review":
          await deleteReview(id)
          break
      }

      setDeleteModal({ isOpen: false, type: "service", id: 0, title: "" })
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const LoadingTable = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 space-x-reverse">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  )

  const ErrorAlert = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 ml-2" />
          إعادة المحاولة
        </Button>
      </AlertDescription>
    </Alert>
  )

  // Services Components
  const ServicesForm = ({ mode }: { mode: "create" | "edit" }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{mode === "create" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}</h3>
        <Button variant="outline" onClick={() => handleViewChange("services", "list")}>
          <X className="h-4 w-4 ml-2" />
          إلغاء
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">عنوان الخدمة</Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => setFormData((prev: FormDataState) => ({ ...prev, title: e.target.value }))}
            placeholder="أدخل عنوان الخدمة"
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="price">السعر</Label>
          <Input
            id="price"
            type="number"
            value={formData.price || ""}
            onChange={(e) => setFormData((prev: FormDataState) => ({ ...prev, price: e.target.value }))}
            placeholder="أدخل السعر"
            className="text-right"
          />
        </div>
        <div>
          <Label htmlFor="category">الفئة</Label>
          <Input
            id="category"
            value={formData.category || ""}
            onChange={(e) => setFormData((prev: FormDataState) => ({ ...prev, category: e.target.value }))}
            placeholder="أدخل فئة الخدمة"
            className="text-right"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData((prev: FormDataState) => ({ ...prev, description: e.target.value }))}
          placeholder="أدخل وصف الخدمة"
          rows={4}
          className="text-right"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={() => handleSubmit("services")} disabled={loading.createService || loading.updateService}>
          <Save className="h-4 w-4 ml-2" />
          {mode === "create" ? "إضافة الخدمة" : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  )

  const ServiceView = ({ service }: { service: Service }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">تفاصيل الخدمة</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleViewChange("services", "edit", service.id)}>
            <Edit className="h-4 w-4 ml-2" />
            تعديل
          </Button>
          <Button variant="outline" onClick={() => handleViewChange("services", "list")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الخدمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-slate-600">العنوان</Label>
              <p className="text-lg font-semibold">{service.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">السعر</Label>
              <p className="text-lg font-semibold text-green-600">{formatPrice(service.price)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">الفئة</Label>
              <Badge variant="outline">{service.category}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">الوصف</Label>
              <p className="text-sm text-slate-700">{service.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات المحامي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-slate-600">الاسم</Label>
              <p className="text-lg font-semibold">{service.lawyer_fullname}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">البريد الإلكتروني</Label>
              <p className="text-sm text-slate-700">{service.lawyer.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">عدد الطلبات</Label>
              <Badge variant="secondary">{service.requests.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تواريخ مهمة</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-600">تاريخ الإنشاء</Label>
            <p className="text-sm text-slate-700">{formatDate(service.created_at)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-600">آخر تحديث</Label>
            <p className="text-sm text-slate-700">{formatDate(service.updated_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Payment Form Component
  const PaymentForm = () => {
    const payment = payments.find((p) => p.id === viewState.payments.selectedId)
    if (!payment) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">تعديل حالة الدفع</h3>
          <Button variant="outline" onClick={() => handleViewChange("payments", "list")}>
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الدفع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>رقم الطلب</Label>
                <p className="text-lg font-semibold">#{payment.request.id}</p>
              </div>
              <div>
                <Label>المبلغ</Label>
                <p className="text-lg font-semibold text-green-600">{formatPrice(payment.amount)}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="status">حالة الدفع</Label>
              <Select
                value={formData.status || payment.status}
                onValueChange={(value) => setFormData((prev: FormDataState) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => handleSubmit("payments")} disabled={loading.updatePayment}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Review Form Component
  const ReviewForm = () => {
    const review = reviews.find((r) => r.id === viewState.reviews.selectedId)
    if (!review) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">تعديل التقييم</h3>
          <Button variant="outline" onClick={() => handleViewChange("reviews", "list")}>
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تعديل التقييم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>العميل</Label>
              <p className="text-lg font-semibold">{review.client_fullname}</p>
            </div>

            <div>
              <Label htmlFor="rating">التقييم</Label>
              <Select
                value={formData.rating?.toString() || review.rating.toString()}
                onValueChange={(value) =>
                  setFormData((prev: FormDataState) => ({ ...prev, rating: Number.parseInt(value) }))
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 نجمة</SelectItem>
                  <SelectItem value="2">2 نجمة</SelectItem>
                  <SelectItem value="3">3 نجوم</SelectItem>
                  <SelectItem value="4">4 نجوم</SelectItem>
                  <SelectItem value="5">5 نجوم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="comment">التعليق</Label>
              <Textarea
                id="comment"
                value={formData.comment || review.comment}
                onChange={(e) => setFormData((prev: FormDataState) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="text-right"
              />
            </div>

            <Button onClick={() => handleSubmit("reviews")} disabled={loading.updateReview}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">لوحة إدارة السوق</h1>
            <p className="text-slate-600 mt-1">مراقبة ومتابعة جميع أنشطة السوق</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                fetchServices()
                fetchPayments()
                fetchDocuments()
                fetchReviews()
              }}
              disabled={Object.values(loading).some(Boolean)}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${Object.values(loading).some(Boolean) ? "animate-spin" : ""}`} />
              تحديث البيانات
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الخدمات</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-blue-100">الخدمات المتاحة في السوق</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المدفوعات</CardTitle>
              <CreditCard className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-green-100">إجمالي المعاملات المالية</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستندات</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-purple-100">الملفات المرفوعة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التقييمات</CardTitle>
              <Star className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs text-orange-100">تقييمات العملاء</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      إدارة الخدمات
                    </CardTitle>
                    <CardDescription>جميع الخدمات المتاحة في السوق مع تفاصيل المحامين والأسعار</CardDescription>
                  </div>
                  {viewState.services.mode === "list" && (
                    <Button onClick={() => handleViewChange("services", "create")}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة خدمة
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {errorMessage.services && <ErrorAlert message={errorMessage.services} onRetry={fetchServices} />}

                {viewState.services.mode === "create" && <ServicesForm mode="create" />}
                {viewState.services.mode === "edit" && <ServicesForm mode="edit" />}
                {viewState.services.mode === "view" && viewState.services.selectedId && (
                  <ServiceView service={services.find((s) => s.id === viewState.services.selectedId)!} />
                )}

                {viewState.services.mode === "list" && (
                  <>
                    {loading.services ? (
                      <LoadingTable />
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">العنوان</TableHead>
                              <TableHead className="text-right">المحامي</TableHead>
                              <TableHead className="text-right">الفئة</TableHead>
                              <TableHead className="text-right">السعر</TableHead>
                              <TableHead className="text-right">الطلبات</TableHead>
                              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {services.map((service) => (
                              <TableRow key={service.id}>
                                <TableCell className="font-medium text-right">{service.title}</TableCell>
                                <TableCell className="text-right">{service.lawyer_fullname}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline">{service.category}</Badge>
                                </TableCell>
                                <TableCell className="font-semibold text-green-600 text-right">
                                  {formatPrice(service.price)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="secondary">{service.requests.length}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 text-right">
                                  {formatDate(service.created_at)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewChange("services", "view", service.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewChange("services", "edit", service.id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setDeleteModal({
                                          isOpen: true,
                                          type: "service",
                                          id: service.id,
                                          title: service.title,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  إدارة المدفوعات
                </CardTitle>
                <CardDescription>جميع المعاملات المالية وحالات الدفع</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMessage.payments && <ErrorAlert message={errorMessage.payments} onRetry={fetchPayments} />}

                {viewState.payments.mode === "edit" && <PaymentForm />}

                {viewState.payments.mode === "list" && (
                  <>
                    {loading.payments ? (
                      <LoadingTable />
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">رقم الطلب</TableHead>
                              <TableHead className="text-right">العميل</TableHead>
                              <TableHead className="text-right">المحامي</TableHead>
                              <TableHead className="text-right">المبلغ</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell className="font-medium text-right">#{payment.request.id}</TableCell>
                                <TableCell className="text-right">{payment.request.client.fullname}</TableCell>
                                <TableCell className="text-right">{payment.request.lawyer.fullname}</TableCell>
                                <TableCell className="font-semibold text-green-600 text-right">
                                  {formatPrice(payment.amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={getStatusBadgeVariant(payment.status)}>
                                    {getStatusText(payment.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 text-right">
                                  {formatDate(payment.timestamp)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewChange("payments", "edit", payment.id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setDeleteModal({
                                          isOpen: true,
                                          type: "payment",
                                          id: payment.id,
                                          title: `دفعة #${payment.request.id}`,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  إدارة المستندات
                </CardTitle>
                <CardDescription>جميع الملفات والمستندات المرفوعة من قبل العملاء والمحامين</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMessage.documents && <ErrorAlert message={errorMessage.documents} onRetry={fetchDocuments} />}

                {loading.documents ? (
                  <LoadingTable />
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اسم الملف</TableHead>
                          <TableHead className="text-right">رقم الطلب</TableHead>
                          <TableHead className="text-right">رفع بواسطة</TableHead>
                          <TableHead className="text-right">العميل</TableHead>
                          <TableHead className="text-right">المحامي</TableHead>
                          <TableHead className="text-right">تاريخ الرفع</TableHead>
                          <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell className="font-medium text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <span>{document.file.split("/").pop()}</span>
                                <FileText className="h-4 w-4 text-slate-500" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">#{document.request.id}</TableCell>
                            <TableCell className="text-right">{document.uploaded_by_fullname}</TableCell>
                            <TableCell className="text-right">{document.request.client.fullname}</TableCell>
                            <TableCell className="text-right">{document.request.lawyer.fullname}</TableCell>
                            <TableCell className="text-sm text-slate-500 text-right">
                              {formatDate(document.uploaded_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDeleteModal({
                                      isOpen: true,
                                      type: "document",
                                      id: document.id,
                                      title: document.file.split("/").pop() || "مستند",
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  إدارة التقييمات
                </CardTitle>
                <CardDescription>جميع تقييمات العملاء للخدمات المقدمة</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMessage.reviews && <ErrorAlert message={errorMessage.reviews} onRetry={fetchReviews} />}

                {viewState.reviews.mode === "edit" && <ReviewForm />}

                {viewState.reviews.mode === "list" && (
                  <>
                    {loading.reviews ? (
                      <LoadingTable />
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">العميل</TableHead>
                              <TableHead className="text-right">المحامي</TableHead>
                              <TableHead className="text-right">الخدمة</TableHead>
                              <TableHead className="text-right">التقييم</TableHead>
                              <TableHead className="text-right">التعليق</TableHead>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reviews.map((review) => (
                              <TableRow key={review.id}>
                                <TableCell className="font-medium text-right">{review.client_fullname}</TableCell>
                                <TableCell className="text-right">{review.request.lawyer.fullname}</TableCell>
                                <TableCell className="text-right">{review.request.service.title}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-1 justify-end">
                                    <span className="text-sm text-slate-600 ml-1">({review.rating}/5)</span>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? "text-yellow-400 fill-current" : "text-slate-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-right">{review.comment}</TableCell>
                                <TableCell className="text-sm text-slate-500 text-right">
                                  {formatDate(review.timestamp)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewChange("reviews", "edit", review.id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setDeleteModal({
                                          isOpen: true,
                                          type: "review",
                                          id: review.id,
                                          title: `تقييم ${review.client_fullname}`,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModal.isOpen}
          onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, isOpen: open }))}
        >
          <DialogContent className="text-right">
            <DialogHeader>
              <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
              <DialogDescription className="text-right">
              {`  هل أنت متأكد من حذف "${deleteModal.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 flex-row-reverse">
              <Button variant="outline" onClick={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  loading.deleteService || loading.deletePayment || loading.deleteDocument || loading.deleteReview
                }
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
