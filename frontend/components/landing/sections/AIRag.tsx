"use client"

import type React from "react"
import { FileText, Brain, Scale, PenTool, Download } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"
import { useState, useEffect } from "react"

export function AIRag() {
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

    const element = document.getElementById("airag-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="airag-section" dir="rtl" className="w-full pt-8 md:pt-16 lg:pt-32">
      {/* Enhanced Section Header */}
      <div className="text-center mb-16">
        <div
          className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            نظام ذكي متطور
          </div>
          <HeroSectionTextHover />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
            اكتشف قوة الذكاء الاصطناعي في التحليل القانوني مع نظامنا المتطور
          </p>
        </div>
      </div>

      {/* Enhanced Grid Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Feature 1 - Upload & Analysis */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <GridItem
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            title="رفع وتحليل"
            description="ارفع ملفات Word/PDF بسهولة لتحليل فوري ودقيق باستخدام أحدث تقنيات الذكاء الاصطناعي"
            delay={0}
            isVisible={isVisible}
            gradient="from-blue-50 to-blue-100"
            iconBg="bg-blue-100"
          />
        </div>

        {/* Feature 2 - Smart Extraction */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <GridItem
            icon={<Brain className="h-6 w-6 text-purple-600" />}
            title="استخراج ذكي"
            description="يقوم النظام باستخراج الوقائع والطلبات تلقائياً مع تحليل السياق القانوني"
            delay={200}
            isVisible={isVisible}
            gradient="from-purple-50 to-purple-100"
            iconBg="bg-purple-100"
          />
        </div>

        {/* Feature 3 - Judgment Comparison */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <GridItem
            icon={<Scale className="h-6 w-6 text-green-600" />}
            title="مقارنة بالأحكام"
            description="يقارن النصوص مع مكتبة الأحكام الشاملة لاستنتاج السوابق القضائية المناسبة"
            delay={400}
            isVisible={isVisible}
            gradient="from-green-50 to-green-100"
            iconBg="bg-green-100"
          />
        </div>

        {/* Feature 4 - Suggestion & Drafting */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6">
          <GridItem
            icon={<PenTool className="h-6 w-6 text-orange-600" />}
            title="اقتراح وصياغة"
            description="يقترح مذكرة قانونية احترافية بصيغ متعددة مع إمكانية التخصيص حسب نوع القضية"
            delay={600}
            isVisible={isVisible}
            gradient="from-orange-50 to-orange-100"
            iconBg="bg-orange-100"
            featured={true}
          />
        </div>

        {/* Feature 5 - Direct Download */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6">
          <GridItem
            icon={<Download className="h-6 w-6 text-red-600" />}
            title="تنزيل مباشر"
            description="نتائج جاهزة للتنزيل بصيغة PDF أو Word مع إمكانية المشاركة والطباعة"
            delay={800}
            isVisible={isVisible}
            gradient="from-red-50 to-red-100"
            iconBg="bg-red-100"
            featured={true}
          />
        </div>
      </div>
    </div>
  )
}

interface GridItemProps {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  delay: number
  isVisible: boolean
  gradient: string
  iconBg: string
  featured?: boolean
}

const GridItem = ({ icon, title, description, delay, isVisible, gradient, iconBg, featured }: GridItemProps) => {
  return (
    <div
      className={`h-full transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`relative h-full rounded-2xl border p-6 md:p-8 group cursor-pointer transition-all duration-300 hover:shadow-xl ${featured ? "bg-gradient-to-br from-white to-gray-50 shadow-lg" : "bg-white shadow-sm hover:shadow-lg"}`}
      >
        <GlowingEffect
          blur={0}
          borderWidth={2}
          spread={60}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />

        <div className="relative flex h-full flex-col justify-between gap-6">
          {/* Icon and Badge */}
          <div className="flex items-start justify-between">
            <div
              className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
            {featured && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                مميز
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4 text-right flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{description}</p>
          </div>

          {/* Action Indicator */}
          <div className="flex items-center justify-end text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">اعرف المزيد</span>
            <svg className="w-4 h-4 mr-2 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
