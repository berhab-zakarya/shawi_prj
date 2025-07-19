"use client"

import { useEffect, useState } from "react"
import { Book, FileText, Scale, Users, Download, Search } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const libraryCategories = [
  {
    icon: FileText,
    title: "القوانين والتشريعات",
    description: "نصوص رسمية محدثة ومصنفة",
    count: "500+",
    color: "text-blue-600",
  },
  {
    icon: Scale,
    title: "السوابق والأحكام القضائية",
    description: "أحكام مشروحة من المحاكم",
    count: "1200+",
    color: "text-green-600",
  },
  {
    icon: Book,
    title: "العقود والنماذج الجاهزة",
    description: "نماذج وصيغ قانونية متنوعة",
    count: "300+",
    color: "text-purple-600",
  },
  {
    icon: Users,
    title: "المذكرات والأبحاث",
    description: "مذكرات واقعية وأبحاث متخصصة",
    count: "800+",
    color: "text-orange-600",
  },
  {
    icon: Download,
    title: "كتب قانونية PDF",
    description: "مراجع وكتب قيمة قابلة للتحميل",
    count: "150+",
    color: "text-red-600",
  },
  {
    icon: Search,
    title: "قواعد بيانات مقارنة",
    description: "قوانين وأحكام دولية للمقارنة",
    count: "2000+",
    color: "text-teal-600",
  },
]

export function LibrarySection() {
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

    const element = document.getElementById("library-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="library-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            مكتبة قانونية
            <span className="block text-amber-600">شاملة</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مجموعة واسعة من المراجع والمصادر القانونية المحدثة والمصنفة بعناية
          </p>
        </div>
      </GridColumn>

      {/* Library Categories */}
      {libraryCategories.map((category, index) => (
        <GridColumn key={category.title} span={{ default: 12, md: 6, lg: 4 }} className="mb-8">
          <Card
            className={cn(
              "h-full p-6 hover:shadow-lg transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm group cursor-pointer relative overflow-hidden",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <category.icon className="w-full h-full" />
            </div>

            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    category.color,
                  )}
                >
                  <category.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-300 group-hover:text-amber-300 transition-colors duration-300">
                  {category.count}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                  {category.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{category.description}</p>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-300 group-hover:translate-x-1"
              >
                تصفح القسم
                <Search className="mr-2 w-4 h-4" />
              </Button>
            </div>
          </Card>
        </GridColumn>
      ))}
    </div>
  )
}
