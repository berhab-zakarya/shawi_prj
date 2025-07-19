"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
  Loader2,
  AlertCircle,
  User,
  DollarSign,
  Search,
  FileText,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react"
import { useServicesClient } from "@/hooks/marketplace/useServicesClient"
import { MarketplaceOrder } from "@/types/marketplace"
import  {RequestDetailsModal}  from "@/components/dashboard/clients/requests/request-details-modal"
import { useRouter } from "next/navigation"


export default function ClientRequests() {
  const router = useRouter()
  const { clientServices:requests, loading, errorMessage: error } = useServicesClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<MarketplaceOrder | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Security: Prevent prototype pollution and ensure safe string operations
  const safeLower = (val: unknown) =>
    typeof val === "string" ? val.toLowerCase() : "";

  const filteredRequests = requests.filter((request) => {
    const title = safeLower(request?.service?.title);
    const category = safeLower(request?.service?.category);
    const username = safeLower(request?.lawyer?.fullname);
    const status = safeLower(request?.status);
    const search = safeLower(searchTerm);

    return (
      title.includes(search) ||
      category.includes(search) ||
      username.includes(search) ||
      status.includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      Pending: { variant: "outline" as const, label: "في الانتظار", icon: Clock, color: "text-yellow-600" },
      "In Progress": { variant: "default" as const, label: "قيد التنفيذ", icon: PlayCircle, color: "text-blue-600" },
      Completed: { variant: "secondary" as const, label: "مكتمل", icon: CheckCircle, color: "text-green-600" },
      Cancelled: { variant: "destructive" as const, label: "ملغي", icon: XCircle, color: "text-red-600" },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.Pending
    const Icon = statusInfo.icon
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Legal Consultation": "bg-blue-100 text-blue-800 border-blue-200",
      "Estate Planning": "bg-purple-100 text-purple-800 border-purple-200",
      "Business Law": "bg-green-100 text-green-800 border-green-200",
      "Family Law": "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusStats = () => {
    const stats = {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      inProgress: requests.filter((r) => r.status === "In Progress").length,
      completed: requests.filter((r) => r.status === "Completed").length,
    }
    return stats
  }

  const handleViewRequest = (request: MarketplaceOrder) => {
    setSelectedRequest(request)
    setShowDetails(true)
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">طلباتي</h1>
            <p className="text-muted-foreground">تتبع حالة طلبات الخدمات القانونية</p>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">طلباتي</h1>
            <p className="text-muted-foreground">تتبع حالة طلبات الخدمات القانونية</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">حدث خطأ في تحميل الطلبات</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلباتي</h1>
          <p className="text-muted-foreground">تتبع حالة طلبات الخدمات القانونية المقدمة</p>
        </div>
        <Button onClick={()=>router.push("/dashboard/client/marketplace/")} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          طلب خدمة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في الطلبات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            طلبات الخدمات القانونية
          </CardTitle>
          <CardDescription>جميع طلبات الخدمات المقدمة مع حالتها الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد طلبات حالياً"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "جرب البحث بكلمات مختلفة" : "ابدأ بطلب خدمة قانونية جديدة"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start font-black">رقم الطلب</TableHead>
                  <TableHead className="text-start font-black">الخدمة</TableHead>
                  <TableHead className="text-start font-black">الفئة</TableHead>
                  <TableHead className="text-start font-black">المحامي</TableHead>
                  <TableHead className="text-start font-black">الحالة</TableHead>
                  <TableHead className="text-start font-black">السعر</TableHead>
                  <TableHead className="text-start font-black">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-start font-black">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    <TableCell className=" text-primary">#{request.id}</TableCell>
                    <TableCell className="font-semibold">
                      <div className="max-w-48 truncate" title={request.service.title}>
                        {request.service.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(request.service.category)}>
                        {request.service.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{request.lawyer.fullname}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">{request.service.price}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                        <Eye className="w-4 h-4 mr-2" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {requests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                عرض {filteredRequests.length} من أصل {requests.length} طلب
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Details Modal */}
      <RequestDetailsModal open={showDetails} onOpenChange={setShowDetails} request={selectedRequest} />
    </div>
  )
}
