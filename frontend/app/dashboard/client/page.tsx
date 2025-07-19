"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  FileText,
  Receipt,
  MessageSquare,
  FileCodeIcon as FileContract,
  Store,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Plus,
  Eye,
  Loader2,
  Activity,
  BarChart3,
  PieChartIcon,
} from "lucide-react"

// Hooks
import { useProfile } from "@/hooks/use-profile"
import { useDocumentsAPI } from "@/hooks/useDocumentsAPI"
import { useInvoicesClient } from "@/hooks/marketplace/useInvoices"
import { useServicesClient } from "@/hooks/marketplace/useServicesClient"
import { useMarketplace } from "@/hooks/useMarketplace"
import { useContracts } from "@/hooks/useContracts"
import { useRouter } from "next/navigation"
import CreateRoomModal from "@/components/chat/CreateRoomModal"
import { useChatAPI } from "@/hooks/useChatApi"
import { useNotification } from "@/hooks/useNotifications"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ClientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Hooks
  const { user, loading: profileLoading, errorMessage: profileError } = useProfile()
  const { documents, loading: documentsLoading, errorGlobal: documentsError } = useDocumentsAPI()
  const { invoices, loading: invoicesLoading, errorMessage: invoicesError } = useInvoicesClient()
  const { clientServices, loading: servicesLoading, errorMessage: servicesError } = useServicesClient()
  const {  loading: marketplaceLoading } = useMarketplace()
  const { contracts, loading: contractsLoading, errorMessage: contractsError } = useContracts()
  // const { rooms, messages,getActiveUsers,createRoom, notifications, unreadCount, loading: chatLoading, error: chatError } = useChat()
  const {loading:chatLoading,rooms,error:chatError,createRoom,getActiveUsers} = useChatAPI();
  const {unreadCount} = useNotification()

  // Loading state
  const isLoading =
    profileLoading ||
    documentsLoading ||
    invoicesLoading ||
    servicesLoading ||
    marketplaceLoading ||
    contractsLoading ||
    chatLoading.rooms

  // Error handling
  const hasErrors =
    profileError || documentsError || invoicesError || servicesError || contractsError || chatError.message

  // Stats calculations
  const stats = {
    totalDocuments: documents.length,
    totalInvoices: invoices.length,
    totalRequests: clientServices.length,
    totalContracts: contracts.length,
    totalChatRooms: rooms.length,
    unreadNotifications: unreadCount,

    // Status breakdowns
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
    pendingRequests: clientServices.filter((req) => req.status === "Pending").length,
    completedRequests: clientServices.filter((req) => req.status === "Completed").length,
    activeContracts: contracts.filter((contract) => !contract.is_locked).length,

    // Financial
    totalInvoiceAmount: invoices.reduce((sum, inv) => sum + Number.parseFloat(inv.total_amount || "0"), 0),
    paidAmount: invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + Number.parseFloat(inv.total_amount || "0"), 0),

    // Recent activity
    recentDocuments: documents.slice(0, 5),
    recentInvoices: invoices.slice(0, 3),
    recentRequests: clientServices.slice(0, 3),
  }

  // Chart data
  const documentsChartData =
    documents.length > 0
      ? [
        { name: "PDF", count: documents.filter((doc) => doc.document_type === "PDF").length },
        { name: "DOCX", count: documents.filter((doc) => doc.document_type === "DOCX").length },
        { name: "TXT", count: documents.filter((doc) => doc.document_type === "TXT").length },
      ].filter((item) => item.count > 0)
      : []

  const invoicesChartData =
    invoices.length > 0
      ? [
        { name: "مدفوعة", count: invoices.filter((inv) => inv.status === "paid").length },
        { name: "مرسلة", count: invoices.filter((inv) => inv.status === "sent").length },
        { name: "مسودة", count: invoices.filter((inv) => inv.status === "draft").length },
        { name: "ملغية", count: invoices.filter((inv) => inv.status === "cancelled").length },
      ].filter((item) => item.count > 0)
      : []

  const requestsChartData =
    clientServices.length > 0
      ? [
        { name: "في الانتظار", count: clientServices.filter((req) => req.status === "Pending").length },
        { name: "قيد التنفيذ", count: clientServices.filter((req) => req.status === "In Progress").length },
        { name: "مكتمل", count: clientServices.filter((req) => req.status === "Completed").length },
        { name: "ملغي", count: clientServices.filter((req) => req.status === "Cancelled").length },
      ].filter((item) => item.count > 0)
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


  const getStatusBadge = (status: string, type: "invoice" | "request" | "contract"): StatusBadge => {
    const statusConfig = {
      invoice: {
        paid: { label: "مدفوعة", variant: "default" as const, color: "bg-green-100 text-green-800" },
        sent: { label: "مرسلة", variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
        draft: { label: "مسودة", variant: "outline" as const, color: "bg-gray-100 text-gray-800" },
        cancelled: { label: "ملغية", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      },
      request: {
        Pending: { label: "في الانتظار", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
        "In Progress": { label: "قيد التنفيذ", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
        Completed: { label: "مكتمل", variant: "secondary" as const, color: "bg-green-100 text-green-800" },
        Cancelled: { label: "ملغي", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      },
      contract: {
        active: { label: "نشط", variant: "default" as const, color: "bg-green-100 text-green-800" },
        locked: { label: "مكتمل", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
        review: { label: "في المراجعة", variant: "outline" as const, color: "bg-yellow-100 text-yellow-800" },
      },
    }

    const config = statusConfig[type][status as keyof (typeof statusConfig)[typeof type]]
    return config || { label: status, variant: "outline", color: "bg-gray-100 text-gray-800" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
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
    <div className="min-h-screen " dir="rtl">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || "/profile.png"} />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {getGreeting()}، {user.first_name} {user.last_name}
                </h1>
                <p className="text-slate-600 text-lg">مرحباً بك في لوحة تحكم العميل</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
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
                {documentsError && <p className="text-sm">• خطأ في تحميل المستندات</p>}
                {invoicesError && <p className="text-sm">• خطأ في تحميل الفواتير</p>}
                {servicesError && <p className="text-sm">• خطأ في تحميل الطلبات</p>}
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
                  <CardTitle className="text-sm font-medium">المستندات</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">
                    {documents.filter((doc) => doc.analyses.length > 0).length} محلل بالذكاء الاصطناعي
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الفواتير</CardTitle>
                  <Receipt className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.paidInvoices} مدفوعة من أصل {stats.totalInvoices}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">طلبات الخدمات</CardTitle>
                  <Store className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedRequests} مكتمل، {stats.pendingRequests} في الانتظار
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العقود</CardTitle>
                  <FileContract className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.totalContracts}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeContracts} نشط</p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            {stats.totalInvoices > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    النظرة المالية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.totalInvoiceAmount)}
                      </div>
                      <p className="text-sm text-green-700">إجمالي الفواتير</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.paidAmount)}</div>
                      <p className="text-sm text-blue-700">المبلغ المدفوع</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(stats.totalInvoiceAmount - stats.paidAmount)}
                      </div>
                      <p className="text-sm text-orange-700">المبلغ المستحق</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Documents */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      المستندات الحديثة
                    </span>
                    <Button onClick={()=>router.push("/dashboard/client/documents/")} variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.document_type} • {new Date(doc.uploaded_at).toLocaleDateString("ar-SA")}
                              </p>
                            </div>
                          </div>
                          {doc.analyses.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              محلل
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد مستندات بعد</p>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        رفع مستند
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Service Requests */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      طلبات الخدمات الحديثة
                    </span>
                    <Button onClick={()=>router.push("/dashboard/marketplace/")} variant="ghost" size="sm">
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
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Store className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{request.service.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {request.lawyer.fullname} • {new Date(request.created_at).toLocaleDateString("ar-SA")}
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
                      <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد طلبات خدمات بعد</p>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        طلب خدمة
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
                <CardDescription>الإجراءات الأكثر استخداماً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button onClick={() => {
                    router.push("/dashboard/client/documents/")
                  }} className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <Plus className="w-6 h-6" />
                    <span>رفع مستند جديد</span>
                  </Button>
                  <Button onClick={() => {
                    router.push("/dashboard/client/marketplace/")
                  }} className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <Store className="w-6 h-6" />
                    <span>طلب خدمة قانونية</span>
                  </Button>
                  <Button onClick={() => {
                    router.push("/dashboard/client/contracts/")
                  }} className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <FileContract className="w-6 h-6" />
                    <span>إنشاء عقد ذكي</span>
                  </Button>
                  <Button onClick={() => {
                    setShowCreateModal(true)
                  }} className="h-20 flex-col gap-2 bg-transparent" variant="outline">
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
              {/* Documents Chart */}
              {documentsChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      توزيع المستندات حسب النوع
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
                        <BarChart data={documentsChartData}>
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

              {/* Invoices Chart */}
              {invoicesChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      حالة الفواتير
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
                            data={invoicesChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {invoicesChartData.map((entry, index) => (
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

              {/* Service Requests Chart */}
              {requestsChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      حالة طلبات الخدمات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: {
                          label: "العدد",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={requestsChartData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Activity Timeline */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    النشاط الأخير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Recent documents activity */}
                    {stats.recentDocuments.slice(0, 3).map((doc) => (
                      <div key={`doc-${doc.id}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">تم رفع مستند جديد</p>
                          <p className="text-xs text-muted-foreground">{doc.title}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploaded_at).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    ))}

                    {/* Recent invoices activity */}
                    {stats.recentInvoices.slice(0, 2).map((invoice) => (
                      <div key={`inv-${invoice.id}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Receipt className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">فاتورة جديدة</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.invoice_number} - {formatCurrency(Number.parseFloat(invoice.total_amount))}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(invoice.issue_date).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    ))}

                    {/* Recent requests activity */}
                    {stats.recentRequests.slice(0, 2).map((request) => (
                      <div key={`req-${request.id}`} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Store className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">طلب خدمة جديد</p>
                          <p className="text-xs text-muted-foreground">{request.service.title}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    ))}

                    {stats.recentDocuments.length === 0 &&
                      stats.recentInvoices.length === 0 &&
                      stats.recentRequests.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>لا يوجد نشاط حديث</p>
                        </div>
                      )}
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
