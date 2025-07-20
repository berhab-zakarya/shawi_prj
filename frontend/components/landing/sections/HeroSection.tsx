"use client"

import { useEffect, useState } from "react"
import Eight from "@/components/animata/bento-grid/eight"
import { ArrowLeft, Play, Star } from "lucide-react"
import Link from "next/link"

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pt-20 md:pt-32 lg:pt-40">
      <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
        {/* Text Content */}
        <div className="col-span-12 lg:col-span-6 order-2 lg:order-1">
          <div
            className={`space-y-8 text-right transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/20 text-[#D4AF37] px-6 py-3 rounded-full text-sm font-medium border border-[#D4AF37]/30 shadow-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-amber-500" />
              </div>
              <span>منصة قانونية موثوقة</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                مكتب الشاوي
                <span className="block bg-gradient-to-r from-[#D4AF37] to-[#B8941F] bg-clip-text text-transparent">
                  للمحاماة
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl font-medium">
                خبرة قانونية متكاملة تجمع بين
                <span className="text-[#D4AF37] font-semibold"> الأصالة والاحترافية </span>
                مع أحدث تقنيات الذكاء الاصطناعي
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link href="/auth">
                  <button className="group relative bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white hover:text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3">
                    ابدأ الآن
                    <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                  </button>
                </Link>

                <button className="group flex items-center gap-3 text-gray-700 hover:text-amber-600 font-medium text-lg transition-colors duration-300">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-amber-50 rounded-full flex items-center justify-center transition-colors duration-300">
                    <Play className="w-5 h-5 mr-1" />
                  </div>
                  شاهد العرض التوضيحي
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <div
            className={`transition-all duration-1000 ease-out delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/30 rounded-3xl opacity-30 blur-xl" />
              <div className="relative">
                <Eight />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
