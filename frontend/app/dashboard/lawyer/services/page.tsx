/* eslint-disable */

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { useLawyerServices } from "@/hooks/marketplace/useServicesLawyer"
import { SERVICE_CATEGORIES } from "@/types/marketplace-lawyer"
import {
  Loader2,
  AlertCircle,
  DollarSign,
  Search,
  FileText,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Save,
  X,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import type { Service as LawyerService } from "@/types/marketplace"

export default function LawyerServices() {
  const { services, loading, errorMessage: error, createService, updateService, deleteService } = useLawyerServices()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("list")
  const [editingService, setEditingService] = useState<LawyerService | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<LawyerService | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
  })

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "Legal Consultation": "bg-blue-100 text-blue-800 border-blue-200",
      "Business Law": "bg-green-100 text-green-800 border-green-200",
      "Real Estate Law": "bg-purple-100 text-purple-800 border-purple-200",
      "Family Law": "bg-orange-100 text-orange-800 border-orange-200",
      "Criminal Law": "bg-red-100 text-red-800 border-red-200",
      "Corporate Law": "bg-indigo-100 text-indigo-800 border-indigo-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getCategoryStats = (): Record<string, number> => {
    const stats: Record<string, number> = {}
    services.forEach((service) => {
      stats[service.category] = (stats[service.category] || 0) + 1
    })
    return stats
  }

  const categoryStats = getCategoryStats()

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      category: "",
      description: "",
    })
    setEditingService(null)
  }

  const handleCreateService = () => {
    resetForm()
    setActiveTab("create")
  }

  const handleEditService = (service: LawyerService) => {
    setFormData({
      title: service.title,
      price: service.price,
      category: service.category,
      description: service.description,
    })
    setEditingService(service)
    setActiveTab("create")
  }

  const handleDeleteService = (service: LawyerService) => {
    setServiceToDelete(service)
    setShowDeleteDialog(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.price || !formData.category || !formData.description) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    if (editingService) {
      const result = await updateService(editingService.id, formData)
      if (result) {
        toast({
          title: "تم تحديث الخدمة بنجاح",
          description: `تم تحديث الخدمة "${result.title}"`,
        })
        resetForm()
        setActiveTab("list")
      }
    } else {
      const result = await createService(formData)
      if (result) {
        toast({
          title: "تم إنشاء الخدمة بنجاح",
          description: `تم إضافة الخدمة "${result.title}" إلى السوق`,
        })
        resetForm()
        setActiveTab("list")
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      const success = await deleteService(serviceToDelete.id)
      if (success) {
        toast({
          title: "تم حذف الخدمة",
          description: `تم حذف الخدمة "${serviceToDelete.title}" بنجاح`,
        })
      }
      setServiceToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  if (loading && services.length === 0) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">خدماتي</h1>
            <p className="text-muted-foreground">إدارة الخدمات المدرجة في السوق</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل الخدمات...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">خدماتي</h1>
            <p className="text-muted-foreground">إدارة الخدمات المدرجة في السوق القانوني</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">حدث خطأ في تحميل الخدمات</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">خدماتي</h1>
          <p className="text-muted-foreground">إدارة وتحديث الخدمات المدرجة في السوق القانوني</p>
        </div>
        <Button onClick={handleCreateService} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 ml-2" />
          إضافة خدمة جديدة
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-r-4 border-r-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخدمات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <p className="text-xs text-muted-foreground">خدمة نشطة</p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استشارات قانونية</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{categoryStats["Legal Consultation"] || 0}</div>
            <p className="text-xs text-muted-foreground">استشارة متاحة</p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قانون الأعمال</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{categoryStats["Business Law"] || 0}</div>
            <p className="text-xs text-muted-foreground">خدمة أعمال</p>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط السعر</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              $
              {services.length > 0
                ? Math.round(services.reduce((sum, s) => sum + Number.parseFloat(s.price), 0) / services.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">متوسط التسعير</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            قائمة الخدمات
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            {editingService ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingService ? "تعديل الخدمة" : "إضافة خدمة"}
          </TabsTrigger>
        </TabsList>

        {/* Services List Tab */}
        <TabsContent value="list" className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في الخدمات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                إدارة الخدمات ({filteredServices.length})
              </CardTitle>
              <CardDescription>إدارة وتحديث الخدمات المدرجة في السوق القانوني</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredServices.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">
                    {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد خدمات مدرجة"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? "جرب البحث بكلمات مختلفة" : "ابدأ بإضافة خدمة جديدة إلى السوق"}
                  </p>
                  {!searchTerm && (
                    <Button className="mt-4" onClick={handleCreateService}>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة خدمة جديدة
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-right">الرقم</TableHead>
                        <TableHead className="font-semibold text-right">العنوان</TableHead>
                        <TableHead className="font-semibold text-right">الفئة</TableHead>
                        <TableHead className="font-semibold text-right">الوصف</TableHead>
                        <TableHead className="font-semibold text-right">السعر</TableHead>
                        <TableHead className="font-semibold text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow key={service.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-primary text-right">#{service.id}</TableCell>
                          <TableCell className="font-semibold text-right">
                            <div className="max-w-48 truncate" title={service.title}>
                              {service.title}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className={getCategoryColor(service.category)}>
                              {SERVICE_CATEGORIES.find((cat) => cat.value === service.category)?.label ||
                                service.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            <div className="max-w-72 line-clamp-2 leading-relaxed" title={service.description}>
                              {service.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-lg font-bold text-green-600">{service.price}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditService(service)}
                                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteService(service)}
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
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

          {/* Summary */}
          {services.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    عرض {filteredServices.length} من أصل {services.length} خدمة
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create/Edit Service Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {editingService ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    {editingService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
                  </CardTitle>
                  <CardDescription>
                    {editingService ? "قم بتحديث بيانات الخدمة المحددة" : "أضف خدمة جديدة إلى السوق القانوني"}
                  </CardDescription>
                </div>
                {editingService && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setActiveTab("list")
                    }}
                  >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    العودة للقائمة
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      عنوان الخدمة <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="أدخل عنوان الخدمة"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      السعر (بالدولار) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="pr-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    فئة الخدمة <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة الخدمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    وصف الخدمة <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="اكتب وصفاً مفصلاً للخدمة..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-red-500">*</span> الحقول المطلوبة
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm()
                        setActiveTab("list")
                      }}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 ml-2" />
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                      {loading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
                      {editingService ? "تحديث الخدمة" : "إضافة الخدمة"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              تأكيد حذف الخدمة
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الخدمة "{serviceToDelete?.title}"؟
              <br />
              <span className="text-red-600 font-medium">لا يمكن التراجع عن هذا الإجراء.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Trash2 className="h-4 w-4 ml-2" />}
              حذف الخدمة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
