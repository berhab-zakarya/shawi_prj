"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Users,
  Bell,
  FileText,
  Monitor,
  FileSignature,
  BarChart3,
  AlertCircle,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Loader2,
  Activity,
  PieChartIcon,
  Clock,
  Mail,
  Star,
  CheckCircle,
} from "lucide-react"

import { useAdminDashboardHome } from "@/hooks/useHomeAdmin"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview")

  const { dashboardData, loading, error, fetchDashboardData, downloadAnalyticsCSV } = useAdminDashboardHome()

  // Loading state
  const isLoading = Object.values(loading).some(Boolean)

  // Error handling
  const hasErrors = Object.values(error).some(Boolean)

  // Stats calculations
  const stats = {
    totalUsers: dashboardData.users.length,
    totalNotifications: dashboardData.notifications.length,
    totalContracts: dashboardData.contracts.length,
    totalServices: dashboardData.services.length,
    totalPayments: dashboardData.payments.length,
    totalDocuments: dashboardData.documents.length,
    totalReviews: dashboardData.reviews.length,

    // Status breakdowns
    unreadNotifications: dashboardData.notifications.filter((n) => !n.read).length,
    highPriorityNotifications: dashboardData.notifications.filter((n) => n.priority === "HIGH").length,
    activeUsers: dashboardData.users.filter((u) => u.is_active).length,
    pendingContracts: dashboardData.contracts.filter((c) => c.needs_review).length,
    lockedContracts: dashboardData.contracts.filter((c) => c.is_locked).length,

    // Financial
    totalPaymentAmount: dashboardData.payments.reduce(
      (sum, payment) => sum + Number.parseFloat(payment.amount || "0"),
      0,
    ),
    completedPayments: dashboardData.payments.filter((p) => p.status === "completed").length,

    // Recent activity
    recentUsers: dashboardData.users.slice(0, 5),
    recentNotifications: dashboardData.notifications.slice(0, 5),
    recentContracts: dashboardData.contracts.slice(0, 5),
    recentReviews: dashboardData.reviews.slice(0, 3),
  }

  // Chart data
  const usersChartData = [
    { name: "نشط", count: stats.activeUsers },
    { name: "غير نشط", count: stats.totalUsers - stats.activeUsers },
  ].filter((item) => item.count > 0)

  const notificationsChartData = [
    { name: "عالية", count: dashboardData.notifications.filter((n) => n.priority === "HIGH").length },
    { name: "متوسطة", count: dashboardData.notifications.filter((n) => n.priority === "MEDIUM").length },
    { name: "منخفضة", count: dashboardData.notifications.filter((n) => n.priority === "LOW").length },
  ].filter((item) => item.count > 0)

  const contractsChartData = [
    { name: "تحتاج مراجعة", count: stats.pendingContracts },
    { name: "مكتملة", count: stats.lockedContracts },
    { name: "نشطة", count: stats.totalContracts - stats.pendingContracts - stats.lockedContracts },
  ].filter((item) => item.count > 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "completed":
  //       return "bg-green-100 text-green-800"
  //     case "pending":
  //       return "bg-yellow-100 text-yellow-800"
  //     case "cancelled":
  //       return "bg-red-100 text-red-800"
  //     default:
  //       return "bg-blue-100 text-blue-800"
  //   }
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" dir="rtl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل لوحة التحكم الإدارية...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم الإدارية</h1>
              <p className="text-slate-600 text-lg">إدارة شاملة لجميع أقسام النظام</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => downloadAnalyticsCSV()} variant="outline" className="bg-white/80 backdrop-blur-sm">
                تصدير التقرير
              </Button>
              <Button onClick={() => fetchDashboardData()} className="bg-blue-600 hover:bg-blue-700">
                تحديث البيانات
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2 text-white bg-black/80 backdrop-blur-sm"
            >
              <Activity className="w-4 h-4" />
              نظرة عامة
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "outline"}
              onClick={() => setActiveTab("analytics")}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm"
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
                {error.analytics && <p className="text-sm">• خطأ في تحميل التحليلات</p>}
                {error.users && <p className="text-sm">• خطأ في تحميل المستخدمين</p>}
                {error.notifications && <p className="text-sm">• خطأ في تحميل الإشعارات</p>}
                {error.contracts && <p className="text-sm">• خطأ في تحميل العقود</p>}
                {error.services && <p className="text-sm">• خطأ في تحميل الخدمات</p>}
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
                  <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeUsers} نشط من أصل {stats.totalUsers}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الإشعارات</CardTitle>
                  <Bell className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.totalNotifications}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.unreadNotifications} غير مقروءة، {stats.highPriorityNotifications} عالية الأولوية
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العقود</CardTitle>
                  <FileSignature className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.totalContracts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingContracts} تحتاج مراجعة، {stats.lockedContracts} مكتملة
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الخدمات</CardTitle>
                  <Monitor className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalServices}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalPayments} دفعة، {stats.totalReviews} تقييم
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            {stats.totalPayments > 0 && (
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
                        {formatCurrency(stats.totalPaymentAmount)}
                      </div>
                      <p className="text-sm text-green-700">إجمالي المدفوعات</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.completedPayments}</div>
                      <p className="text-sm text-blue-700">المدفوعات المكتملة</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.totalPayments - stats.completedPayments}
                      </div>
                      <p className="text-sm text-orange-700">المدفوعات المعلقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Users */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      المستخدمين الجدد
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentUsers.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email} • {user.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(user.date_joined).toLocaleDateString("ar-SA")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد مستخدمين جدد</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      الإشعارات الحديثة
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentNotifications.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentNotifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Bell className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority === "HIGH"
                                  ? "عالية"
                                  : notification.priority === "MEDIUM"
                                    ? "متوسطة"
                                    : "منخفضة"}
                              </Badge>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>من: {notification.created_by_email}</span>
                              <Calendar className="h-3 w-3 mr-2" />
                              <span>{new Date(notification.created_at).toLocaleDateString("ar-SA")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد إشعارات حديثة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Contracts and Reviews */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Contracts */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5" />
                    العقود الحديثة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentContracts.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentContracts.map((contract) => (
                        <div key={contract.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <FileSignature className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{contract.contract_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {contract.client
                                  ? `${contract.client.first_name} ${contract.client.last_name}`
                                  : "غير محدد"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {contract.needs_review ? (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            ) : contract.is_locked ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(contract.created_at).toLocaleDateString("ar-SA")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileSignature className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد عقود حديثة</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    التقييمات الحديثة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentReviews.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentReviews.map((review) => (
                        <div key={review.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{review.client_fullname}</p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{review.comment}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.timestamp).toLocaleDateString("ar-SA")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد تقييمات حديثة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>الإجراءات السريعة</CardTitle>
                <CardDescription>الإجراءات الإدارية الأكثر استخداماً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <Plus className="w-6 h-6" />
                    <span>إضافة مستخدم جديد</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <Bell className="w-6 h-6" />
                    <span>إرسال إشعار</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <FileText className="w-6 h-6" />
                    <span>إنشاء مقال جديد</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                    <BarChart3 className="w-6 h-6" />
                    <span>عرض التقارير</span>
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
              {/* Users Chart */}
              {usersChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      توزيع المستخدمين
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
                        <PieChart>
                          <Pie
                            data={usersChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {usersChartData.map((entry, index) => (
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

              {/* Notifications Chart */}
              {notificationsChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      الإشعارات حسب الأولوية
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
                        <BarChart data={notificationsChartData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Contracts Chart */}
              {contractsChartData.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      حالة العقود
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
                        <PieChart>
                          <Pie
                            data={contractsChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {contractsChartData.map((entry, index) => (
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
                    {/* Recent users activity */}
                    {stats.recentUsers.slice(0, 2).map((user) => (
                      <div key={`user-${user.id}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">مستخدم جديد انضم</p>
                          <p className="text-xs text-muted-foreground">{user.full_name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.date_joined).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    ))}

                    {/* Recent notifications activity */}
                    {stats.recentNotifications.slice(0, 2).map((notification) => (
                      <div
                        key={`notif-${notification.id}`}
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                      >
                        <div className="p-2 bg-red-100 rounded-full">
                          <Bell className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">إشعار جديد</p>
                          <p className="text-xs text-muted-foreground">{notification.title}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    ))}

                    {/* Recent contracts activity */}
                    {stats.recentContracts.slice(0, 2).map((contract) => (
                      <div
                        key={`contract-${contract.id}`}
                        className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg"
                      >
                        <div className="p-2 bg-orange-100 rounded-full">
                          <FileSignature className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">عقد جديد</p>
                          <p className="text-xs text-muted-foreground">{contract.contract_type}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(contract.created_at).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    ))}

                    {stats.recentUsers.length === 0 &&
                      stats.recentNotifications.length === 0 &&
                      stats.recentContracts.length === 0 && (
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
    </div>
  )
}
