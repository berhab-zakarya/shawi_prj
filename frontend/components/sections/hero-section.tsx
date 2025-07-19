"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GridColumn } from "@/components/layout/grid-container"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      {/* Text Content */}
      <GridColumn span={{ default: 12, lg: 6 }} className="flex flex-col justify-center order-2 lg:order-1">
        <div
          className={cn(
            "space-y-8 text-right transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-medium border border-amber-200">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            منصة قانونية متطورة
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              مكتب الشاوي
              <span className="block text-amber-600">للمحاماة</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              خبرة قانونية متكاملة تجمع بين الأصالة والاحترافية مع أحدث تقنيات الذكاء الاصطناعي
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              ابدأ الآن
              <ArrowLeft className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-amber-600 hover:text-amber-600 transition-all duration-300 group bg-transparent"
            >
              <Play className="ml-2 w-5 h-5" />
              شاهد العرض التوضيحي
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
            {[
              { number: "25k+", label: "عميل موثوق" },
              { number: "4.9", label: "تقييم العملاء" },
              { number: "10+", label: "سنوات خبرة" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </GridColumn>

      {/* Hero Image */}
      <GridColumn span={{ default: 12, lg: 6 }} className="flex items-center justify-center order-1 lg:order-2">
        <div
          className={cn(
            "relative w-full max-w-lg transition-all duration-1000 ease-out delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <div className="relative">
            <Image
              src="/law_illu.svg"
              alt="Legal Illustration"
              width={600}
              height={600}
              className="w-full h-auto"
              priority
            />

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-2xl">⚖️</span>
            </div>

            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xl">📚</span>
            </div>
          </div>
        </div>
      </GridColumn>
    </>
  )
}
