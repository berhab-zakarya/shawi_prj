"use client"

import { useState } from "react"
import { useMarketplace } from "@/hooks/useMarketplace"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ServiceCard } from "@/components/dashboard/clients/marketplace/service-card"
import { Loader2, AlertCircle, Store, Search, Filter, DollarSign, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ClientMarketplace() {
  const { services, loading, errorMessage: error, requestService } = useMarketplace()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<string>("all")
  const { toast } = useToast()

  const categories = Array.from(new Set(services.map((service) => service.category)))

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.lawyer.fullname.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory

    const price = Number.parseFloat(service.price)
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "0-100" && price <= 100) ||
      (priceRange === "100-200" && price > 100 && price <= 200) ||
      (priceRange === "200+" && price > 200)

    return matchesSearch && matchesCategory && matchesPrice
  })

  const handleRequestService = async (lawyerId: number, serviceId: number) => {
    const success = await requestService({
      lawyerId: lawyerId,
      serviceId: serviceId,
    })
    if (success) {
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم التواصل معك قريباً من قبل المحامي",
      })
    } else {
      toast({
        title: "فشل في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    }
  }

  const getMarketplaceStats = () => {
    const totalServices = services.length
    const totalLawyers = new Set(services.map((s) => s.lawyer.id)).size
    const averagePrice =
      services.length > 0 ? services.reduce((sum, s) => sum + Number.parseFloat(s.price), 0) / services.length : 0
    // const totalReviews = services.reduce((sum, s) => sum + s.requests.filter((r) => r.review).length, 0)

    return { totalServices, totalLawyers, averagePrice,  }
  }

  const stats = getMarketplaceStats()

  if (loading && services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">السوق القانوني</h1>
            <p className="text-muted-foreground">اكتشف الخدمات القانونية من محامين مختصين</p>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">السوق القانوني</h1>
            <p className="text-muted-foreground">اكتشف الخدمات القانونية من محامين مختصين</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8" />
            السوق القانوني
          </h1>
          <p className="text-muted-foreground">اكتشف واطلب الخدمات القانونية من محامين مختصين</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخدمات</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحامون المتاحون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLawyers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط السعر</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.averagePrice)}</div>
          </CardContent>
        </Card>
{/* 
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقييمات</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card> */}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في الخدمات أو المحامين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الأسعار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأسعار</SelectItem>
                <SelectItem value="0-100">$0 - $100</SelectItem>
                <SelectItem value="100-200">$100 - $200</SelectItem>
                <SelectItem value="200+">$200+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Store className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                {searchTerm || selectedCategory !== "all" || priceRange !== "all"
                  ? "لا توجد نتائج للبحث"
                  : "لا توجد خدمات متاحة"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || selectedCategory !== "all" || priceRange !== "all"
                  ? "جرب تغيير معايير البحث"
                  : "يرجى العودة لاحقاً للاطلاع على الخدمات الجديدة"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onRequestService={handleRequestService} loading={loading} />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {services.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                عرض {filteredServices.length} من أصل {services.length} خدمة متاحة
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
