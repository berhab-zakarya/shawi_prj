"use client"

import type React from "react"
import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react"
import { ArrowLeft, BookOpen, Users, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export function LibrarySection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()

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

  const features = [
    {
      title: "القوانين والتشريعات",
      description: "نصوص رسمية محدثة ومصنفة بعناية فائقة",
      buttonText: "تصفح القسم",
      icon: <IconTerminal2 />,
      color: "blue",
      stats: "محدث يومياً",
    },
    {
      title: "السوابق والأحكام القضائية",
      description: "أحكام مشروحة من المحاكم العليا والمتخصصة",
      buttonText: "تصفح القسم",
      icon: <IconEaseInOut />,
      color: "green",
      stats: "من جميع المحاكم",
    },
    {
      title: "العقود والنماذج الجاهزة",
      description: "نماذج وصيغ قانونية متنوعة وقابلة للتخصيص",
      buttonText: "تصفح القسم",
      icon: <IconCurrencyDollar />,
      color: "purple",
      stats: "جاهز للاستخدام",
    },
    {
      title: "المذكرات والأبحاث",
      description: "مذكرات واقعية وأبحاث متخصصة من خبراء القانون",
      buttonText: "تصفح القسم",
      icon: <IconCloud />,
      color: "orange",
      stats: "من الخبراء",
    },
    {
      title: "كتب قانونية PDF",
      description: "مراجع وكتب قيمة قابلة للتحميل والطباعة",
      buttonText: "تصفح القسم",
      icon: <IconRouteAltLeft />,
      color: "red",
      stats: "كتاب متخصص",
    },
    {
      title: "قواعد بيانات مقارنة",
      description: "قوانين وأحكام دولية للمقارنة والدراسة",
      buttonText: "تصفح القسم",
      icon: <IconHelp />,
      color: "teal",
      stats: "من 50+ دولة",
    },
  ]

  return (
    <div id="library-section" className="pt-8 md:pt-16 lg:pt-32" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              مكتبة شاملة
            </div>
            <HeroSectionTextHover primaryText="مكتبة " secondaryText="قانونية" thirdText="شاملة" conjunctionText="" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
              مجموعة واسعة من المراجع والمصادر القانونية المحدثة والمصنفة بعناية
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 max-w-7xl mx-auto gap-8">
          {features.map((feature, index) => (
            <Feature
              key={feature.title}
              {...feature}
              index={index}
              isVisible={isVisible}

              isHovered={hoveredIndex === index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div
          className={`mt-20 transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">5,000+</div>
                <div className="text-gray-600">مستند قانوني</div>
                <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>يتزايد يومياً</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">دولة مغطاة</div>
                <div className="flex items-center justify-center gap-1 text-blue-600 text-sm">
                  <Users className="w-4 h-4" />
                  <span>تغطية عالمية</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600">إتاحة المحتوى</div>
                <div className="flex items-center justify-center gap-1 text-purple-600 text-sm">
                  <IconCloud className="w-4 h-4" />
                  <span>وصول فوري</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button
            onClick={() => router.push("/auth")}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            استكشف المكتبة الكاملة
          </button>
        </div>
      </div>
    </div>
  )
}

const Feature = ({
  title,
  description,
  buttonText,
  icon,
  index,
  color,
  stats,
  isVisible,
  isHovered,
  onHover,
  onLeave,
}: {
  title: string
  description: string
  buttonText: string
  icon: React.ReactNode
  index: number
  color: string
  stats: string
  isVisible: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) => {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-300 bg-blue-50 text-[#D4AF37]",
    green: "border-green-200 hover:border-green-300 bg-green-50 text-green-600",
    purple: "border-purple-200 hover:border-purple-300 bg-purple-50 text-purple-600",
    orange: "border-orange-200 hover:border-orange-300 bg-orange-50 text-orange-600",
    red: "border-red-200 hover:border-red-300 bg-red-50 text-red-600",
    teal: "border-teal-200 hover:border-teal-300 bg-teal-50 text-teal-600",
  }
  const router = useRouter();
  return (
    <div
    onClick={()=>{
      router.push('/auth')
    }}
      className={cn(
        "flex flex-col border-2 py-12 px-8 relative group cursor-pointer rounded-2xl transition-all duration-300 bg-white hover:shadow-xl",
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-4 right-4 text-6xl">{icon}</div>
      </div>

      {/* Icon */}
      <div className="mb-6 relative z-10 text-neutral-600 dark:text-neutral-400 transform transition-transform duration-300 group-hover:scale-110">
        <div className="w-12 h-12">{icon}</div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 relative z-10">
        <div className="absolute right-0 inset-y-0 h-6 group-hover:h-8 w-1 rounded-tl-full rounded-bl-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-[#D4AF37] transition-all duration-200 origin-center" />

        <h3 className="text-lg md:text-xl font-bold mb-2 relative z-10 text-neutral-800 dark:text-neutral-100 group-hover:-translate-x-2 transition-transform duration-200">
          {title}
        </h3>

        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed relative z-10">
          {description}
        </p>

        <div className="text-xs text-gray-500 font-medium">{stats}</div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 mt-6">
        <button className="flex items-center gap-2 text-sm font-medium text-[#D4AF37] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 group/btn">
          <span>{buttonText}</span>
          <ArrowLeft className="w-4 h-4 transform rotate-180 group-hover/btn:-translate-x-1 transition-transform duration-200" />
        </button>
      </div>

      {/* Hover Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}
