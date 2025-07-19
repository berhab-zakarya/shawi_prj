"use client"

import { useEffect, useState } from "react"
import { FileText, Brain, Scale, PenTool, Download, Zap } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: FileText,
    title: "رفع وتحليل",
    description: "ارفع ملفات Word/PDF بسهولة لتحليل فوري ودقيق",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Brain,
    title: "استخراج ذكي",
    description: "يقوم النظام باستخراج الوقائع والطلبات تلقائياً",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Scale,
    title: "مقارنة بالأحكام",
    description: "يقارن النصوص مع مكتبة الأحكام لاستنتاج السوابق القضائية",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: PenTool,
    title: "اقتراح وصياغة",
    description: "يقترح مذكرة قانونية احترافية بصيغ متعددة",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Download,
    title: "تنزيل مباشر",
    description: "نتائج جاهزة للتنزيل بصيغة PDF أو Word",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Zap,
    title: "سرعة فائقة",
    description: "معالجة فورية وتحليل سريع للمستندات",
    color: "bg-yellow-50 text-yellow-600",
  },
]

export function FeaturesSection() {
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

    const element = document.getElementById("features-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="features-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            نظام التحليل القانوني
            <span className="block text-amber-600">الذكي</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            حلول متقدمة للمحامين والمستشارين القانونيين باستخدام أحدث تقنيات الذكاء الاصطناعي
          </p>
        </div>
      </GridColumn>

      {/* Features Grid */}
      {features.map((feature, index) => (
        <GridColumn key={feature.title} span={{ default: 12, md: 6, lg: 4 }} className="mb-8">
          <Card
            className={cn(
              "h-full p-6 hover:shadow-lg transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm group cursor-pointer",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <div className="space-y-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  feature.color,
                )}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </Card>
        </GridColumn>
      ))}
    </div>
  )
}
