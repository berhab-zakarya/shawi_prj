"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { MarketplaceService } from "@/types/marketplace"
import { Star, DollarSign, User, Calendar, MessageSquare, FileText } from "lucide-react"

interface ServiceCardProps {
  service: MarketplaceService
  onRequestService: (lawyerId:number,serviceId: number) => void
  loading: boolean
}

export function ServiceCard({ service, onRequestService, loading }: ServiceCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Legal Consultation": "bg-blue-100 text-blue-800 border-blue-200",
      "Business Law": "bg-green-100 text-green-800 border-green-200",
      "Estate Planning": "bg-purple-100 text-purple-800 border-purple-200",
      "Family Law": "bg-orange-100 text-orange-800 border-orange-200",
      "Criminal Law": "bg-red-100 text-red-800 border-red-200",
      "Corporate Law": "bg-indigo-100 text-indigo-800 border-indigo-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  // const getAverageRating = () => {
  //   const reviews = service.requests.filter((req) => req.review).map((req) => req.review!.rating)
  //   if (reviews.length === 0) return 0
  //   return reviews.reduce((sum, rating) => sum + rating, 0) / reviews.length
  // }

  const getTotalRequests = () => service.requests?.length || 0
  const getCompletedRequests = () => service.requests?.filter((req) => req.status === "Completed").length || 0

  // const averageRating = getAverageRating()
  const totalRequests = getTotalRequests()
  const completedRequests = getCompletedRequests()

  // const renderStars = (rating: number) => {
  //   return Array.from({ length: 5 }, (_, i) => (
  //     <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
  //   ))
  // }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">{service.title}</CardTitle>
            <Badge variant="outline" className={getCategoryColor(service.category)}>
              {service.category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
              <DollarSign className="h-5 w-5" />
              {service.price}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <CardDescription className="line-clamp-3 leading-relaxed">{service.description}</CardDescription>

        <Separator />

        {/* Lawyer Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={service.lawyer.avatar_url || "/placeholder.svg?height=48&width=48"} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold">{service.lawyer.fullname}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{service.lawyer.bio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            {/* <div className="flex items-center justify-center gap-1">
              {averageRating > 0 ? (
                <>
                  <div className="flex">{renderStars(Math.round(averageRating))}</div>
                  <span className="text-sm font-medium">({averageRating.toFixed(1)})</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">لا توجد تقييمات</span>
              )}
            </div> */}
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{completedRequests}</span>
            </div>
            <p className="text-xs text-muted-foreground">مكتمل</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{totalRequests}</span>
            </div>
            <p className="text-xs text-muted-foreground">طلب</p>
          </div>
        </div>

        <Separator />

        {/* Action Button */}
        {service.request_status === "Pending" ? (
          <Button className="w-full" disabled size="lg">
            لديك طلب حالي
          </Button>):      <Button  className="w-full" onClick={() => onRequestService(service.lawyer?.id,service.id)} disabled={loading} size="lg">
          {loading ? "جاري الإرسال..." : "طلب الخدمة"}
        </Button>

          }
  
        {/* Service Date */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>متاح منذ {new Date(service.created_at).toLocaleDateString("ar-SA")}</span>
        </div>
      </CardContent>
    </Card>
  )
}
