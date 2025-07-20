"use client"

import { useState, useEffect } from "react"
import { Building, Home, Shield, Users, FileText, Briefcase, ArrowRight, CheckCircle, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const services = [
    {
      id: 1,
      title: "قانون الشركات",
      description: "تأسيس شركات، صياغة عقود، استشارات تجارية وخدمات قانونية شاملة للشركات من جميع الأحجام",
      icon: Building,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      features: [
        "تأسيس الشركات بجميع أنواعها",
        "صياغة العقود التجارية",
        "الاستشارات التجارية المتخصصة",
        "حل النزاعات التجارية",
        "الاندماج والاستحواذ",
        "حماية الملكية الفكرية",
      ],
      rating: 4.9,
      cases: 150,
      featured: true,
    },
    {
      id: 2,
      title: "القانون العقاري",
      description: "نزاعات إيجارية، بيع وشراء، تسجيل عقاري وجميع الخدمات المتعلقة بالعقارات والأملاك",
      icon: Home,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      features: [
        "عقود البيع والشراء العقاري",
        "النزاعات الإيجارية",
        "التسجيل العقاري",
        "تقييم العقارات قانونياً",
        "قضايا الإخلاء",
        "الاستشارات العقارية",
      ],
      rating: 4.8,
      cases: 200,
      featured: false,
    },
    {
      id: 3,
      title: "القانون الجنائي",
      description: "دفاع وتمثيل في جميع أنواع القضايا الجنائية مع فريق من المحامين المتخصصين والخبراء",
      icon: Shield,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      features: [
        "الدفاع في القضايا الجنائية",
        "التمثيل أمام المحاكم",
        "الاستشارات الأمنية",
        "قضايا الأموال العامة",
        "جرائم الإنترنت",
        "الطعون والاستئناف",
      ],
      rating: 4.9,
      cases: 120,
      featured: true,
    },
    {
      id: 4,
      title: "قانون الأحوال الشخصية",
      description: "زواج، طلاق، حضانة، وميراث مع تقديم الاستشارات الشرعية والقانونية المناسبة",
      icon: Users,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      features: [
        "قضايا الزواج والطلاق",
        "الحضانة والنفقة",
        "قسمة المواريث",
        "الوصايا والأوقاف",
        "النسب والنفقة",
        "الاستشارات الشرعية",
      ],
      rating: 4.7,
      cases: 180,
      featured: false,
    },
    {
      id: 5,
      title: "القانون الإداري",
      description: "قضايا الموظفين، قرارات إدارية، عقود حكومية والتعامل مع الجهات الحكومية المختلفة",
      icon: FileText,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      features: [
        "القضايا الإدارية",
        "العقود الحكومية",
        "قضايا الموظفين",
        "الطعون الإدارية",
        "التراخيص والتصاريح",
        "المناقصات الحكومية",
      ],
      rating: 4.6,
      cases: 90,
      featured: false,
    },
    {
      id: 6,
      title: "قانون العمل",
      description: "عقود عمل، نزاعات عمالية، حقوق الموظفين وجميع القضايا المتعلقة ببيئة العمل",
      icon: Briefcase,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-100",
      features: [
        "صياغة عقود العمل",
        "النزاعات العمالية",
        "حقوق الموظفين",
        "التأمينات الاجتماعية",
        "إصابات العمل",
        "الفصل التعسفي",
      ],
      rating: 4.8,
      cases: 160,
      featured: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white">
        <div className="container mx-auto px-4 py-16">
          <div
            className={`text-center transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Briefcase className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">خدماتنا القانونية المتكاملة</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              نقدم مجموعة شاملة من الخدمات القانونية المتخصصة لتلبية جميع احتياجاتكم
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className={`relative overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 ${
                service.featured ? "ring-2 ring-yellow-400" : ""
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {service.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-yellow-500 text-black">
                    <Star className="w-3 h-3 ml-1" />
                    الأكثر طلباً
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center mb-4`}>
                  <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 text-right">{service.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{service.rating}</span>
                  </div>
                  <span>{service.cases} قضية</span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed text-right">{service.description}</p>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900 text-right">ما نقدمه:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {service.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 4 && (
                      <div className="text-sm text-gray-500 text-right">+{service.features.length - 4} خدمات أخرى</div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4"></div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => (window.location.href = "/auth")}>
                      احجز استشارة
                      <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => (window.location.href = "/auth")}>
                      تفاصيل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">هل تحتاج استشارة قانونية؟</h2>
            <p className="text-xl mb-8 opacity-90">تواصل معنا الآن للحصول على استشارة مجانية من خبرائنا</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4"
                onClick={() => (window.location.href = "/auth")}
              >
                استشارة مجانية
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                onClick={() => (window.location.href = "/auth")}
              >
                تواصل معنا
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
