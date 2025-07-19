/* eslint-disable */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import {
  Briefcase,
  FileText,
  MessageSquare,
  FileCheck,
  AlertCircle,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Loader2,
  Activity,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Scale,
  Gavel,
  BookOpen,
} from "lucide-react"

// Hooks
import { useProfile } from "@/hooks/use-profile"
import { useLawyerServices } from "@/hooks/marketplace/useServicesLawyer"
import { useLawyerRequests } from "@/hooks/marketplace/useLawyerRequests"
import { useInvoicesClient } from "@/hooks/marketplace/useInvoices"
import { useContracts } from "@/hooks/useContracts"
import { useChatAPI } from "@/hooks/useChatApi"
import { useNotification } from "@/hooks/useNotifications"
import { useRouter } from "next/navigation"
import CreateRoomModal from "@/components/chat/CreateRoomModal"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

export default function LawyerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "performance">("overview")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Hooks
  const { user, loading: profileLoading, errorMessage: profileError } = useProfile()
  const { services, loading: servicesLoading, errorMessage: servicesError } = useLawyerServices()
  const {  myServiceRequests, loading: requestsLoading, errorMessage: requestsError } = useLawyerRequests()
  const { invoices, loading: invoicesLoading, errorMessage: invoicesError } = useInvoicesClient()
  const { contracts, loading: contractsLoading, errorMessage: contractsError } = useContracts()
  const { loading: chatLoading, rooms, error: chatError, createRoom, getActiveUsers } = useChatAPI()
  const { unreadCount } = useNotification()

  // Loading state
  const isLoading =
    profileLoading || servicesLoading || requestsLoading || invoicesLoading || contractsLoading || chatLoading.rooms

  // Error handling
  const hasErrors =
    profileError || servicesError || requestsError || invoicesError || contractsError || chatError.message

  // Stats calculations
  const stats = {
    totalServices: services.length,
    totalRequests: myServiceRequests.length,
    totalContracts: contracts.length,
    totalInvoices: invoices.length,
    totalChatRooms: rooms.length,
    unreadNotifications: unreadCount,

    // Status breakdowns
    activeServices: services.filter((service) => service.title).length, // Assuming active services have titles
    pendingRequests: myServiceRequests.filter((req) => req.status === "Pending").length,
    acceptedRequests: myServiceRequests.filter((req) => req.status === "Accepted").length,
    completedRequests: myServiceRequests.filter((req) => req.status === "Completed").length,
    activeContracts: contracts.filter((contract) => !contract.is_locked).length,
    reviewContracts: contracts.filter((contract) => contract.needs_review).length,

    // Financial
    totalRevenue: invoices.reduce((sum, inv) => sum + Number.parseFloat(inv.total_amount || "0"), 0),
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
    pendingPayments: invoices.filter((inv) => inv.status === "sent").length,

    // Recent activity
    recentServices: services.slice(0, 5),
    recentRequests: myServiceRequests.slice(0, 5),
    recentContracts: contracts.slice(0, 3),
    recentInvoices: invoices.slice(0, 3),
  }

  // Chart data
  const servicesChartData =
    services.length > 0
      ? [
          { name: "استشارة قانونية", count: services.filter((s) => s.category === "Legal Consultation").length },
          { name: "قانون الأعمال", count: services.filter((s) => s.category === "Business Law").length },
          { name: "قانون العقارات", count: services.filter((s) => s.category === "Real Estate Law").length },
          { name: "قانون الأسرة", count: services.filter((s) => s.category === "Family Law").length },
          { name: "قانون جنائي", count: services.filter((s) => s.category === "Criminal Law").length },
          { name: "قانون الشركات", count: services.filter((s) => s.category === "Corporate Law").length },
        ].filter((item) => item.count > 0)
      : []

  const requestsChartData =
    myServiceRequests.length > 0
      ? [
          { name: "في الانتظار", count: myServiceRequests.filter((req) => req.status === "Pending").length },
          { name: "مقبول", count: myServiceRequests.filter((req) => req.status === "Accepted").length },
          { name: "قيد التنفيذ", count: myServiceRequests.filter((req) => req.status === "In Progress").length },
          { name: "مكتمل", count: myServiceRequests.filter((req) => req.status === "Completed").length },
          { name: "مرفوض", count: myServiceRequests.filter((req) => req.status === "Rejected").length },
        ].filter((item) => item.count > 0)
      : []

  const revenueChartData =
    invoices.length > 0
      ? invoices.slice(0, 6).map((invoice, index) => ({
          month: `الشهر ${index + 1}`,
          revenue: Number.parseFloat(invoice.total_amount || "0"),
        }))
      : []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "صباح الخير"
    if (hour < 17) return "مساء الخير"
    return "مساء الخير"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount)
  }

  type StatusBadge = {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
    color: string
  }

  const getStatusBadge = (status: string, type: "request" | "contract" | "invoice"): StatusBadge => {
    const statusConfig = {
      request: {
        Pending: { label: "في الانتظار", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
        Accepted: { label: "مقبول", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
        "In Progress": { label: "قيد التنفيذ", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
        Completed: { label: "مكتمل", variant: "secondary" as const, color: "bg-green-100 text-green-800" },
        Rejected: { label: "مرفوض", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      },
      contract: {
        DRAFT: { label: "مسودة", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
        UNDER_REVIEW: { label: "قيد المراجعة", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
        APPROVED: { label: "موافق عليه", variant: "default" as const, color: "bg-green-100 text-green-800" },
        COMPLETED: { label: "مكتمل", variant: "secondary" as const, color: "bg-green-100 text-green-800" },
      },
      invoice: {
        draft: { label: "مسودة", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
        sent: { label: "مرسلة", variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
        paid: { label: "مدفوعة", variant: "default" as const, color: "bg-green-100 text-green-800" },
        cancelled: { label: "ملغية", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      },
    }

    const config = statusConfig[type][status as keyof (typeof statusConfig)[typeof type]]
    return config || { label: status, variant: "outline", color: "bg-gray-100 text-gray-800" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {getGreeting()}، المحامي {user.first_name} {user.last_name}
                </h1>
                <p className="text-slate-600 text-lg">مرحباً بك في لوحة تحكم المحامي</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Scale className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    عضو منذ {new Date(user.date_joined).getFullYear()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              نظرة عامة
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "outline"}
              onClick={() => setActiveTab("analytics")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              التحليلات
            </Button>
            <Button
              variant={activeTab === "performance" ? "default" : "outline"}
              onClick={() => setActiveTab("performance")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              الأداء
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {hasErrors && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-1">
                <p className="font-medium">تحذير: بعض البيانات قد لا تكون محدثة</p>
                {profileError && <p className="text-sm">• خطأ في تحميل الملف الشخصي</p>}
                {servicesError && <p className="text-sm">• خطأ في تحميل الخدمات</p>}
                {requestsError && <p className="text-sm">• خطأ في تحميل الطلبات</p>}
                {invoicesError && <p className="text-sm">• خطأ في تحميل الفواتير</p>}
                {contractsError && <p className="text-sm">• خطأ في تحميل العقود</p>}
                {chatError.message && <p className="text-sm">• خطأ في تحميل الرسائل</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">خدماتي</CardTitle>
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalServices}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeServices} خدمة نشطة</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.totalRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingRequests} في الانتظار، {stats.completedRequests} مكتمل
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العقود</CardTitle>
                  <FileCheck className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalContracts}</div>
                  <p className="text-xs text-muted-foreground">{stats.reviewContracts} يحتاج مراجعة</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">{stats.paidInvoices} فاتورة مدفوعة</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    معدل الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">معدل قبول الطلبات</span>
                      <span className="font-semibold">
                        {stats.totalRequests > 0 ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">معدل إكمال الطلبات</span>
                      <span className="font-semibold">
                        {stats.totalRequests > 0
                          ? Math.round((stats.completedRequests / stats.totalRequests) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">متوسط وقت الاستجابة</span>
                      <span className="font-semibold">2.5 ساعة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    المهام العاجلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm">طلبات تحتاج رد</span>
                      <Badge variant="destructive">{stats.pendingRequests}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm">عقود تحتاج مراجعة</span>
                      <Badge variant="outline">{stats.reviewContracts}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm">فواتير معلقة</span>
                      <Badge variant="secondary">{stats.pendingPayments}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">المحادثات النشطة</span>
                      <span className="font-semibold">{stats.totalChatRooms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">الإشعارات غير المقروءة</span>
                      <Badge variant="destructive">{stats.unreadNotifications}</Badge>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="w-full mt-2" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      بدء محادثة جديدة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Requests */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      الطلبات الحديثة
                    </span>
                    <Button onClick={() => router.push("/dashboard/lawyer/requests")} variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentRequests.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{request.service.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {request.client.fullname} • {new Date(request.created_at).toLocaleDateString("ar-SA")}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={getStatusBadge(request.status, "request").variant}
                            className={getStatusBadge(request.status, "request").color}
                          >
                            {getStatusBadge(request.status, "request").label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد طلبات حديثة</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Services */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      خدماتي
                    </span>
                    <Button onClick={() => router.push("/dashboard/lawyer/services")} variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentServices.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Briefcase className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{service.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {service.category} • {formatCurrency(Number.parseFloat(service.price))}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">نشط</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد خدمات بعد</p>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة خدمة
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>الإجراءات السريعة</CardTitle>
                <CardDescription>الإجراءات الأكثر استخداماً للمحامين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button
                    onClick={() => router.push("/dashboard/lawyer/services")}
                    className="h-20 flex-col gap-2 bg-transparent"
                    variant="outline"
                  >
                    <Plus className="w-6 h-6" />
                    <span>إضافة خدمة جديدة</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/lawyer/requests")}
                    className="h-20 flex-col gap-2 bg-transparent"
                    variant="outline"
                  >
                    <FileText className="w-6 h-6" />
                    <span>مراجعة الطلبات</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/lawyer/contracts")}
                    className="h-20 flex-col gap-2 bg-transparent"
                    variant="outline"
                  >
                    <FileCheck className="w-6 h-6" />
                    <span>مراجعة العقود</span>
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="h-20 flex-col gap-2 bg-transparent"
                    variant="outline"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span>بدء محادثة</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Services Chart */}
              {servicesChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      توزيع الخدمات حسب الفئة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: {
                          label: "العدد",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={servicesChartData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Requests Chart */}
              {requestsChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      حالة الطلبات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: {
                          label: "العدد",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={requestsChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {requestsChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Revenue Chart */}
            {revenueChartData.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    تطور الإيرادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "الإيرادات",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueChartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الاستجابة</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">2.5 ساعة</div>
                  <p className="text-xs text-muted-foreground">متوسط وقت الرد</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">من إجمالي الطلبات</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">تقييم العملاء</CardTitle>
                  <Star className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">4.8</div>
                  <p className="text-xs text-muted-foreground">من 5 نجوم</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل القبول</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalRequests > 0 ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">من الطلبات المستلمة</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Performance */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5" />
                    الأداء القانوني
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">القضايا المكسوبة</span>
                      <span className="font-semibold text-green-600">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">العقود المراجعة</span>
                      <span className="font-semibold">{stats.totalContracts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">الاستشارات المقدمة</span>
                      <span className="font-semibold">{stats.completedRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">سنوات الخبرة</span>
                      <span className="font-semibold">
                        {new Date().getFullYear() - new Date(user.date_joined).getFullYear()} سنة
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    التخصصات القانونية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {servicesChartData.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-sm">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min((category.count / Math.max(...servicesChartData.map((c) => c.count))) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateRoom={createRoom}
        onGetActiveUsers={getActiveUsers}
      />
    </div>
  )
}
