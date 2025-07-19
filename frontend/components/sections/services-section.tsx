"use client"

import { useEffect, useState } from "react"
import { Building, Home, Shield, Users, FileText, Briefcase } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const services = [
  {
    icon: Building,
    title: "قانون الشركات",
    description: "تأسيس شركات، صياغة عقود، استشارات تجارية وخدمات قانونية شاملة للشركات من جميع الأحجام.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Home,
    title: "القانون العقاري",
    description: "نزاعات إيجارية، بيع وشراء، تسجيل عقاري وجميع الخدمات المتعلقة بالعقارات والأملاك.",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    title: "القانون الجنائي",
    description: "دفاع وتمثيل في جميع أنواع القضايا الجنائية مع فريق من المحامين المتخصصين والخبراء.",
    gradient: "from-red-500 to-red-600",
  },
  {
    icon: Users,
    title: "قانون الأحوال الشخصية",
    description: "زواج، طلاق، حضانة، وميراث مع تقديم الاستشارات الشرعية والقانونية المناسبة.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "القانون الإداري",
    description: "قضايا الموظفين، قرارات إدارية، عقود حكومية والتعامل مع الجهات الحكومية المختلفة.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Briefcase,
    title: "قانون العمل",
    description: "عقود عمل، نزاعات عمالية، حقوق الموظفين وجميع القضايا المتعلقة ببيئة العمل.",
    gradient: "from-teal-500 to-teal-600",
  },
]

export function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("services-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="services-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            خدماتنا القانونية
            <span className="block text-amber-600">المتكاملة</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نقدم مجموعة متكاملة من الخدمات القانونية لتلبية احتياجات عملائنا من الأفراد والشركات
          </p>
        </div>
      </GridColumn>

      {/* Services Grid */}
      {services.map((service, index) => (
        <GridColumn key={service.title} span={{ default: 12, md: 6, lg: 4 }} className="mb-8">
          <Card
            className={cn(
              "h-full overflow-hidden group cursor-pointer border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{
              transitionDelay: `${index * 150}ms`,
            }}
          >
            {/* Gradient Header */}
            <div className={cn("h-2 bg-gradient-to-r transition-all duration-300 group-hover:h-3", service.gradient)} />

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110",
                    service.gradient,
                  )}
                >
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  {service.title}
                </h3>
              </div>

              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          </Card>
        </GridColumn>
      ))}
    </div>
  )
}
