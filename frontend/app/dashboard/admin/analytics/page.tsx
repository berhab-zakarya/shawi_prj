"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Download,
  RefreshCw,
  Users,
  FileText,
  Receipt,
  FileCodeIcon as FileContract,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics"

type AnalyticsSection =
  | "overview"
  | "users"
  | "documents"
  | "invoices"
  | "contracts"
  | "marketplace"
  | "content"
  | "notifications"

export default function AdminAnalyticsPage() {
  const { analytics, loading, errorMessage, getAnalytics, downloadCSV, refreshAnalytics } = useAdminAnalytics()
  const [activeSection, setActiveSection] = useState<AnalyticsSection>("overview")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    getAnalytics()
  }, [getAnalytics])

  const handleFilterChange = async () => {
    const filters = {
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    }
    await getAnalytics(filters)
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const filters = {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      }
      await downloadCSV(filters)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ar-SA").format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount)
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="text-lg">جاري تحميل البيانات...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-red-800">
                <h3 className="font-semibold mb-2">خطأ في تحميل البيانات</h3>
                <p>{errorMessage}</p>
                <Button onClick={refreshAnalytics} className="mt-4 bg-transparent" variant="outline">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحليلات الإدارة</h1>
            <p className="text-gray-600 mt-1">نظرة شاملة على أداء النظام والمستخدمين</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <div className="flex flex-col">
                <Label htmlFor="start-date" className="text-sm mb-1">
                  من تاريخ
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="end-date" className="text-sm mb-1">
                  إلى تاريخ
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <Button onClick={handleFilterChange} disabled={loading}>
                <Calendar className="h-4 w-4 ml-2" />
                تطبيق الفلتر
              </Button>
              <Button onClick={handleExportCSV} disabled={isExporting} variant="outline">
                <Download className="h-4 w-4 ml-2" />
                {isExporting ? "جاري التصدير..." : "تصدير CSV"}
              </Button>
              <Button onClick={refreshAnalytics} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as AnalyticsSection)}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="marketplace">السوق</TabsTrigger>
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          </TabsList>

          {/* Overview Section */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics?.users.total || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(analytics?.users.new_users_last_30_days || 0)} مستخدم جديد في آخر 30 يوم
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستندات</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics?.documents.total || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(analytics?.documents.analyses_performed || 0)} تحليل تم إجراؤه
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics?.invoices.total_revenue || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(analytics?.invoices.overdue || 0)} فاتورة متأخرة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
                  <FileContract className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics?.contracts.total || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    متوسط وقت المراجعة: {analytics?.contracts.avg_review_time_days || 0} يوم
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Section */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع المستخدمين حسب الدور</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.users.by_role &&
                    Object.entries(analytics.users.by_role).map(([role, count]) => {
                      const percentage = (count / analytics.users.total) * 100
                      const roleNames: Record<string, string> = {
                        Admin: "مدير",
                        Lawyer: "محامي",
                        Client: "عميل",
                        "No Role": "بدون دور",
                      }
                      return (
                        <div key={role} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{roleNames[role] || role}</span>
                            <span className="text-sm text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>حالة المستخدمين</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>مستخدمون نشطون</span>
                    </div>
                    <Badge variant="secondary">{formatNumber(analytics?.users.active_users || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span>مستخدمون غير نشطين</span>
                    </div>
                    <Badge variant="outline">{formatNumber(analytics?.users.inactive_users || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>مستخدمون جدد (30 يوم)</span>
                    </div>
                    <Badge variant="default">{formatNumber(analytics?.users.new_users_last_30_days || 0)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Section */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع المستندات حسب النوع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.documents.by_type &&
                    Object.entries(analytics.documents.by_type).map(([type, count]) => {
                      const percentage = (count / analytics.documents.total) * 100
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{type}</span>
                            <span className="text-sm text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات التحليل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>إجمالي التحليلات المنجزة</span>
                    <Badge variant="secondary">{formatNumber(analytics?.documents.analyses_performed || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>متوسط درجة الثقة</span>
                    <Badge variant="default">
                      {((analytics?.documents.avg_confidence_score || 0) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoices Section */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>حالة الفواتير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.invoices.by_status &&
                    Object.entries(analytics.invoices.by_status).map(([status, count]) => {
                      const percentage = (count / analytics.invoices.total) * 100
                      const statusNames: Record<string, string> = {
                        draft: "مسودة",
                        sent: "مرسلة",
                        paid: "مدفوعة",
                        cancelled: "ملغية",
                      }
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{statusNames[status] || status}</span>
                            <span className="text-sm text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإيرادات والمتأخرات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>إجمالي الإيرادات</span>
                    </div>
                    <Badge variant="secondary">{formatCurrency(analytics?.invoices.total_revenue || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>فواتير متأخرة</span>
                    </div>
                    <Badge variant="destructive">{formatNumber(analytics?.invoices.overdue || 0)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contracts Section */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>حالة العقود</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.contracts.by_status &&
                    Object.entries(analytics.contracts.by_status).map(([status, count]) => {
                      const percentage = (count / analytics.contracts.total) * 100
                      const statusNames: Record<string, string> = {
                        DRAFT: "مسودة",
                        UNDER_REVIEW: "قيد المراجعة",
                        APPROVED: "موافق عليه",
                        REJECTED: "مرفوض",
                        SIGNED_BY_CLIENT: "موقع من العميل",
                        SIGNED_BY_LAWYER: "موقع من المحامي",
                        COMPLETED: "مكتمل",
                        EXPORTED: "مُصدر",
                      }
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{statusNames[status] || status}</span>
                            <span className="text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-1" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أنواع العقود</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.contracts.by_type &&
                    Object.entries(analytics.contracts.by_type).map(([type, count]) => {
                      const percentage = (count / analytics.contracts.total) * 100
                      const typeNames: Record<string, string> = {
                        EMPLOYMENT: "عمل",
                        NDA: "سرية",
                        FREELANCE: "عمل حر",
                        LEASE: "إيجار",
                        PARTNERSHIP: "شراكة",
                        SALES: "بيع",
                        CUSTOM: "مخصص",
                      }
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{typeNames[type] || type}</span>
                            <span className="text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-1" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Marketplace Section */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>طلبات الخدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.marketplace.service_requests.by_status &&
                    Object.entries(analytics.marketplace.service_requests.by_status).map(([status, count]) => {
                      const percentage = (count / analytics.marketplace.service_requests.total) * 100
                      const statusNames: Record<string, string> = {
                        Pending: "معلق",
                        Accepted: "مقبول",
                        Paid: "مدفوع",
                        "In Progress": "قيد التنفيذ",
                        Delivered: "مُسلم",
                        Completed: "مكتمل",
                      }
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{statusNames[status] || status}</span>
                            <span className="text-sm text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات السوق</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>إجمالي المدفوعات</span>
                    <Badge variant="secondary">{formatNumber(analytics?.marketplace.payments.total || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>إجمالي الإيرادات</span>
                    <Badge variant="default">
                      {formatCurrency(analytics?.marketplace.payments.total_revenue || 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>متوسط التقييم</span>
                    <Badge variant="outline">{(analytics?.marketplace.avg_review_rating || 0).toFixed(1)} ⭐</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Section */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أنواع المحتوى</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.content.by_content_type &&
                    Object.entries(analytics.content.by_content_type).map(([type, count]) => {
                      const percentage = (count / analytics.content.total_posts) * 100
                      const typeNames: Record<string, string> = {
                        article: "مقال",
                        video: "فيديو",
                        infographic: "إنفوجرافيك",
                        faq: "أسئلة شائعة",
                      }
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{typeNames[type] || type}</span>
                            <span className="text-sm text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات المحتوى</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>إجمالي المنشورات</span>
                    <Badge variant="secondary">{formatNumber(analytics?.content.total_posts || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>منشورات مميزة</span>
                    <Badge variant="default">{formatNumber(analytics?.content.featured_posts || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>إجمالي المشاهدات</span>
                    <Badge variant="outline">{formatNumber(analytics?.content.total_views || 0)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {analytics?.content.top_tags && analytics.content.top_tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>أهم العلامات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.content.top_tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag.name} ({formatNumber(tag.count)})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Section */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أولوية الإشعارات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.notifications.by_priority &&
                    Object.entries(analytics.notifications.by_priority).map(([priority, count]) => {
                      const percentage = (count / analytics.notifications.total) * 100
                      const priorityNames: Record<string, string> = {
                        low: "منخفضة",
                        medium: "متوسطة",
                        high: "عالية",
                      }
                      const priorityColors: Record<string, string> = {
                        low: "bg-green-500",
                        medium: "bg-yellow-500",
                        high: "bg-red-500",
                      }
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${priorityColors[priority]}`}></div>
                              <span className="text-sm font-medium">{priorityNames[priority] || priority}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatNumber(count)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>حالة الإشعارات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span>إجمالي الإشعارات</span>
                    </div>
                    <Badge variant="secondary">{formatNumber(analytics?.notifications.total || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-500" />
                      <span>إشعارات غير مقروءة</span>
                    </div>
                    <Badge variant="destructive">{formatNumber(analytics?.notifications.unread || 0)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>معدل القراءة</span>
                    <Badge variant="outline">
                      {analytics?.notifications.total
                        ? (
                            ((analytics.notifications.total - analytics.notifications.unread) /
                              analytics.notifications.total) *
                            100
                          ).toFixed(1) + "%"
                        : "0%"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
