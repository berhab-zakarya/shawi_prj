"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useLawyerRequests } from "@/hooks/marketplace/useLawyerRequests"
import {
  Loader2,
  
  DollarSign,
  Search,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Download,
  Phone,
  Mail,
  Briefcase,
  Check,
  X,
  PlayCircle,
  Package,
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import type { ServiceRequest, ServiceDocument } from "@/types/marketplace-lawyer"
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

export default function LawyerRequests() {
  const { allRequests, myServiceRequests, loading, errorMessage: error, manageRequest } = useLawyerRequests()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [managingRequestId, setManagingRequestId] = useState<number | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    requestId: number
    status: "Accepted" | "Rejected" | "Completed"
    title: string
  } | null>(null)
  const { toast } = useToast()

    useEffect(() => {
      if (error) {
        toast({
          title: "خطأ",
          description: error,
          variant: "destructive",
        })
      }
    }, [error, toast])

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Accepted: "bg-blue-100 text-blue-800 border-blue-200",
      Paid: "bg-purple-100 text-purple-800 border-purple-200",
      "In Progress": "bg-indigo-100 text-indigo-800 border-indigo-200",
      Delivered: "bg-orange-100 text-orange-800 border-orange-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      Cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Accepted":
        return <Check className="h-4 w-4" />
      case "Paid":
        return <DollarSign className="h-4 w-4" />
      case "In Progress":
        return <PlayCircle className="h-4 w-4" />
      case "Delivered":
        return <Package className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <X className="h-4 w-4" />
      case "Cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      Pending: "قيد الانتظار",
      Accepted: "مقبول",
      Paid: "مدفوع",
      "In Progress": "قيد التنفيذ",
      Delivered: "تم التسليم",
      Completed: "مكتمل",
      Rejected: "مرفوض",
      Cancelled: "ملغي",
    }
    return labels[status] || status
  }

  const filterRequests = (requests: ServiceRequest[]): ServiceRequest[] => {
    return requests.filter((request) => {
      const matchesSearch =
        request.client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.lawyer.fullname.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }

  const filteredAllRequests = filterRequests(allRequests)
  const filteredMyRequests = filterRequests(myServiceRequests)

  const getRequestStats = (requests: ServiceRequest[]) => {
    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      accepted: requests.filter((r) => r.status === "Accepted").length,
      inProgress: requests.filter((r) => r.status === "In Progress").length,
      completed: requests.filter((r) => r.status === "Completed").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
    }
    return stats
  }

  const allStats = getRequestStats(allRequests)
  const myStats = getRequestStats(myServiceRequests)

  const handleStatusChange = (requestId: number, newStatus: "Accepted" | "Rejected" | "Completed") => {
    const request = [...allRequests, ...myServiceRequests].find((r) => r.id === requestId)
    if (!request) return

    setPendingAction({
      requestId,
      status: newStatus,
      title: request.service.title,
    })
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!pendingAction) return

    setManagingRequestId(pendingAction.requestId)
    const result = await manageRequest(pendingAction.requestId, { status: pendingAction.status })

    if (result) {
      const statusLabels = {
        Accepted: "قبول",
        Rejected: "رفض",
        Completed: "إكمال",
      }

      toast({
        title: `تم ${statusLabels[pendingAction.status]} الطلب بنجاح`,
        description: `تم ${statusLabels[pendingAction.status]} طلب الخدمة "${pendingAction.title}"`,
      })
    }

    setManagingRequestId(null)
    setPendingAction(null)
    setShowConfirmDialog(false)
  }

  const canManageRequest = (request: ServiceRequest): boolean => {
    // Only allow management for requests to my services and if status allows it
    const isMyRequest = myServiceRequests.some((r) => r.id === request.id)
    return isMyRequest && ["Pending", "Accepted", "In Progress"].includes(request.status)
  }

  const getAvailableActions = (
    status: string,
  ): Array<{ value: "Accepted" | "Rejected" | "Completed"; label: string }> => {
    switch (status) {
      case "Pending":
        return [
          { value: "Accepted", label: "قبول الطلب" },
          { value: "Rejected", label: "رفض الطلب" },
        ]
      case "Accepted":
      case "In Progress":
        return [{ value: "Completed", label: "إكمال الطلب" }]
      default:
        return []
    }
  }

  if (loading && allRequests.length === 0 && myServiceRequests.length === 0) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
            <p className="text-muted-foreground">متابعة وإدارة طلبات الخدمات القانونية</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground">متابعة وإدارة طلبات الخدمات القانونية في السوق</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            جميع الطلبات ({allRequests.length})
          </TabsTrigger>
          <TabsTrigger value="my" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            طلبات خدماتي ({myServiceRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* All Requests Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Stats Cards for All Requests */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="border-r-4 border-r-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{allStats.total}</div>
                <p className="text-xs text-muted-foreground">طلب في النظام</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{allStats.pending}</div>
                <p className="text-xs text-muted-foreground">طلب معلق</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقبولة</CardTitle>
                <Check className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{allStats.accepted}</div>
                <p className="text-xs text-muted-foreground">طلب مقبول</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
                <PlayCircle className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">{allStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">طلب نشط</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{allStats.completed}</div>
                <p className="text-xs text-muted-foreground">طلب منجز</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
                <X className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{allStats.rejected}</div>
                <p className="text-xs text-muted-foreground">طلب مرفوض</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="Pending">قيد الانتظار</SelectItem>
                <SelectItem value="Accepted">مقبولة</SelectItem>
                <SelectItem value="In Progress">قيد التنفيذ</SelectItem>
                <SelectItem value="Completed">مكتملة</SelectItem>
                <SelectItem value="Rejected">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* All Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                جميع طلبات الخدمات ({filteredAllRequests.length})
              </CardTitle>
              <CardDescription>عرض جميع طلبات الخدمات القانونية في المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAllRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">
                    {searchTerm || statusFilter !== "all" ? "لا توجد نتائج للبحث" : "لا توجد طلبات"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "جرب تغيير معايير البحث" : "لم يتم تقديم أي طلبات بعد"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAllRequests.map((request) => (
                    <Card key={request.id} className="border-r-4 border-r-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="mr-1">{getStatusLabel(request.status)}</span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">طلب #{request.id}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                          {/* Client Info */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">معلومات العميل</h4>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.client.avatar_url || ""} />
                                <AvatarFallback>
                                  {request.client.first_name[0]}
                                  {request.client.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.client.fullname}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {request.client.email}
                                </div>
                                {request.client.phone_number && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {request.client.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Lawyer Info */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">معلومات المحامي</h4>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.lawyer.avatar_url || ""} />
                                <AvatarFallback>
                                  {request.lawyer.first_name[0]}
                                  {request.lawyer.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.lawyer.fullname}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {request.lawyer.email}
                                </div>
                                {request.lawyer.phone_number && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {request.lawyer.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Service Info */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">تفاصيل الخدمة</h4>
                            <div>
                              <p className="font-medium">{request.service.title}</p>
                              <p className="text-sm text-muted-foreground mb-2">{request.service.category}</p>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-bold text-green-600">${request.service.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Documents and Review */}
                        {(request.documents.length > 0 || request.review) && (
                          <>
                            <Separator className="my-4" />
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Documents */}
                              {request.documents.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">المستندات ({request.documents.length})</h5>
                                  <div className="space-y-2">
                                    {request.documents.map((doc: ServiceDocument) => (
                                      <div key={doc.id} className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="flex-1 truncate">{doc.file.split("/").pop()}</span>
                                        <Button size="sm" variant="outline">
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Review */}
                              {request.review && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">التقييم</h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            request.review && i < request.review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-sm font-medium mr-2">{request.review.rating}/5</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{request.review.comment}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Service Requests Tab */}
        <TabsContent value="my" className="space-y-6">
          {/* Stats Cards for My Requests */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="border-r-4 border-r-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات خدماتي</CardTitle>
                <Briefcase className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{myStats.total}</div>
                <p className="text-xs text-muted-foreground">طلب لخدماتي</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{myStats.pending}</div>
                <p className="text-xs text-muted-foreground">يحتاج موافقة</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مقبولة</CardTitle>
                <Check className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{myStats.accepted}</div>
                <p className="text-xs text-muted-foreground">تم قبولها</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
                <PlayCircle className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">{myStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">أعمل عليها</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{myStats.completed}</div>
                <p className="text-xs text-muted-foreground">تم إنجازها</p>
              </CardContent>
            </Card>

            <Card className="border-r-4 border-r-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
                <X className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{myStats.rejected}</div>
                <p className="text-xs text-muted-foreground">تم رفضها</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في طلبات خدماتي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="Pending">قيد الانتظار</SelectItem>
                <SelectItem value="Accepted">مقبولة</SelectItem>
                <SelectItem value="In Progress">قيد التنفيذ</SelectItem>
                <SelectItem value="Completed">مكتملة</SelectItem>
                <SelectItem value="Rejected">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* My Service Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                طلبات خدماتي ({filteredMyRequests.length})
              </CardTitle>
              <CardDescription>طلبات العملاء للخدمات التي أقدمها</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMyRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">
                    {searchTerm || statusFilter !== "all" ? "لا توجد نتائج للبحث" : "لا توجد طلبات لخدماتك"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== "all" ? "جرب تغيير معايير البحث" : "لم يطلب أحد خدماتك بعد"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMyRequests.map((request) => (
                    <Card key={request.id} className="border-r-4 border-r-purple-500/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="mr-1">{getStatusLabel(request.status)}</span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">طلب #{request.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}
                            </div>
                            {/* Request Management Actions */}
                            {canManageRequest(request) && (
                              <div className="flex items-center gap-2">
                                {getAvailableActions(request.status).map((action) => (
                                  <Button
                                    key={action.value}
                                    size="sm"
                                    variant={action.value === "Rejected" ? "destructive" : "default"}
                                    onClick={() => handleStatusChange(request.id, action.value)}
                                    disabled={managingRequestId === request.id}
                                    className={
                                      action.value === "Accepted"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : action.value === "Completed"
                                          ? "bg-blue-600 hover:bg-blue-700"
                                          : ""
                                    }
                                  >
                                    {managingRequestId === request.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                    ) : action.value === "Accepted" ? (
                                      <Check className="h-3 w-3 ml-1" />
                                    ) : action.value === "Rejected" ? (
                                      <X className="h-3 w-3 ml-1" />
                                    ) : (
                                      <CheckCircle className="h-3 w-3 ml-1" />
                                    )}
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Client Info */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">معلومات العميل</h4>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.client.avatar_url || ""} />
                                <AvatarFallback>
                                  {request.client.first_name[0]}
                                  {request.client.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.client.fullname}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {request.client.email}
                                </div>
                                {request.client.phone_number && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {request.client.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                            {request.client.bio && (
                              <p className="text-sm text-muted-foreground">{request.client.bio}</p>
                            )}
                          </div>

                          {/* Service Info */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">تفاصيل الخدمة المطلوبة</h4>
                            <div>
                              <p className="font-medium">{request.service.title}</p>
                              <p className="text-sm text-muted-foreground mb-2">{request.service.category}</p>
                              <p className="text-sm text-muted-foreground mb-2">{request.service.description}</p>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-bold text-green-600">${request.service.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Documents and Review */}
                        {(request.documents.length > 0 || request.review) && (
                          <>
                            <Separator className="my-4" />
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Documents */}
                              {request.documents.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">
                                    المستندات المرفقة ({request.documents.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {request.documents.map((doc: ServiceDocument) => (
                                      <div
                                        key={doc.id}
                                        className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                                      >
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <div className="flex-1">
                                          <p className="truncate">{doc.file.split("/").pop()}</p>
                                          <p className="text-xs text-muted-foreground">
                                            رفعه: {doc.uploaded_by_fullname} •{" "}
                                            {format(new Date(doc.uploaded_at), "dd MMM yyyy", { locale: ar })}
                                          </p>
                                        </div>
                                        <Button size="sm" variant="outline">
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Review */}
                              {request.review && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">تقييم العميل</h5>
                                  <div className="space-y-2 p-3 bg-green-50 rounded">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            request.review && i < request.review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-sm font-medium mr-2">{request.review.rating}/5</span>
                                    </div>
                                    <p className="text-sm">{request.review.comment}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(request.review.timestamp), "dd MMM yyyy", { locale: ar })}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingAction?.status === "Accepted" && <Check className="h-5 w-5 text-green-500" />}
              {pendingAction?.status === "Rejected" && <X className="h-5 w-5 text-red-500" />}
              {pendingAction?.status === "Completed" && <CheckCircle className="h-5 w-5 text-blue-500" />}
              تأكيد{" "}
              {pendingAction?.status === "Accepted" ? "قبول" : pendingAction?.status === "Rejected" ? "رفض" : "إكمال"}{" "}
              الطلب
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من{" "}
              {pendingAction?.status === "Accepted" ? "قبول" : pendingAction?.status === "Rejected" ? "رفض" : "إكمال"}{" "}
              طلب الخدمة "{pendingAction?.title}"؟
              <br />
              <span className="font-medium">
                {pendingAction?.status === "Accepted" && "سيتم إشعار العميل بقبول طلبه."}
                {pendingAction?.status === "Rejected" && "سيتم إشعار العميل برفض طلبه."}
                {pendingAction?.status === "Completed" && "سيتم إشعار العميل بإكمال الخدمة."}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={
                pendingAction?.status === "Accepted"
                  ? "bg-green-600 hover:bg-green-700"
                  : pendingAction?.status === "Rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
              }
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : null}
              تأكيد{" "}
              {pendingAction?.status === "Accepted"
                ? "القبول"
                : pendingAction?.status === "Rejected"
                  ? "الرفض"
                  : "الإكمال"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
