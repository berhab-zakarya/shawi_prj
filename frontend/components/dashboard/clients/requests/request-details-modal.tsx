/* eslint-disable */

"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Download, Star, User, Calendar, MessageSquare, DollarSign, Tag } from "lucide-react"
import { MarketplaceOrder } from "@/types/marketplace"
import { useChatAPI } from "@/hooks/useChatApi"
import { useState } from "react"

interface RequestDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: MarketplaceOrder | null
}
// interface ErrorState {
//   message: string
//   type: "network" | "validation" | "authentication" | "not_found" | "server" | "websocket" | "duplicate_reaction" | null
// }
export function RequestDetailsModal({ open, onOpenChange, request }: RequestDetailsModalProps) {
  if (!request) return null

  const { createRoom, loading } = useChatAPI();
  const getStatusBadge = (status: string) => {
    const statusMap = {
      Pending: { variant: "outline" as const, label: "في الانتظار", color: "text-yellow-600" },
      "In Progress": { variant: "default" as const, label: "قيد التنفيذ", color: "text-blue-600" },
      Completed: { variant: "secondary" as const, label: "مكتمل", color: "text-green-600" },
      Cancelled: { variant: "destructive" as const, label: "ملغي", color: "text-red-600" },
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.Pending
    return <Badge variant={statusInfo.variant} className="text-sm px-3 py-1">{statusInfo.label}</Badge>
  }

  const handleDownloadDocument = (document: any) => {
    window.open(document.file_url, "_blank")
  }
  const [successCreate, setSuccessCreate] = useState(false)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }
  const handleCreationRoom = async () => {
    try {
      const data = await createRoom({
        name: `request_service_${request.id}`,
        participants: [request.lawyer.email],
        room_type: "ONE_TO_ONE",
      }
      )
      window.open("/dashboard/client/rooms/requuest_service_" + request.id, "_blank")
    } catch (e: any) {
      if (e.type == "validation") {
        window.open(`/dashboard/client/rooms/requuest_service_${request.id}`)
      }
      else {
        console.error("Error creating room:", e)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center justify-between text-xl">
            طلب الخدمة #{request.id}
            {getStatusBadge(request.status)}
          </DialogTitle>
          <DialogDescription className="text-base">
            تم الإنشاء في {new Date(request.created_at).toLocaleDateString("ar-SA")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Service Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  تفاصيل الخدمة
                </h4>
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <span className="font-medium text-sm text-muted-foreground">العنوان:</span>
                    <p className="font-medium text-base leading-relaxed">{request.service.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">الفئة:</span>
                    <Badge variant="outline" className="text-sm px-3 py-1">{request.service.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">السعر:</span>
                    <span className="font-bold text-lg text-green-600 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {request.service.price}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-sm text-muted-foreground">الوصف:</span>
                    <div className="bg-background p-4 rounded-md border max-h-32 overflow-y-auto">
                      <p className="text-sm leading-relaxed text-foreground">{request.service.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  المحامي المسؤول
                </h4>
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-base">{request.lawyer.fullname}</p>
                      {/* <p className="text-sm text-muted-foreground">{request.lawyer.email}</p> */}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  معلومات الطلب
                </h4>
                <div className="bg-muted p-6 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      تاريخ الإنشاء: {new Date(request.created_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      آخر تحديث: {new Date(request.updated_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              المستندات المرفقة ({request.documents.length})
            </h4>
            {request.documents.length > 0 ? (
              <div className="grid gap-4">
                {request.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                    <div className="flex items-center gap-4 flex-1">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-base">مستند #{document.id}</p>
                        <p className="text-sm text-muted-foreground">
                          رفعه {document.uploaded_by_fullname} في{" "}
                          {new Date(document.uploaded_at).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(document)}>
                      <Download className="h-4 w-4 mr-2" />
                      تحميل
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3" />
                <p>لا توجد مستندات مرفقة</p>
              </div>
            )}
          </div>

          {/* Review */}
          {request.review && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  التقييم
                </h4>
                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex">{renderStars(request.review.rating)}</div>
                    <span className="font-medium text-lg">({request.review.rating}/5)</span>
                  </div>
                  <div className="bg-background p-4 rounded-md border">
                    <p className="text-sm leading-relaxed mb-3">{request.review.comment}</p>
                    <p className="text-xs text-muted-foreground">
                      بواسطة {request.review.client_fullname} في{" "}
                      {new Date(request.review.timestamp).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleCreationRoom}
              variant="outline"
              className="flex-1 min-w-48 flex items-center justify-center gap-2"
              disabled={loading.rooms || successCreate}
            >
              <MessageSquare className="w-4 h-4" />
              {loading.rooms
                ? "جاري الإنشاء..."
                : successCreate
                  ? "تم إنشاء غرفة الدردشة"
                  : "التواصل مع المحامي"}
            </Button>
            {/* {request.status === "Completed" && !request.review && (
              <Button className="flex-1 min-w-48 flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                إضافة تقييم
              </Button>
            )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}