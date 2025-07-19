"use client"

import { useEffect, useState } from "react"
import Eight from "@/components/animata/bento-grid/eight"
import { ArrowLeft, Play, Star,   } from "lucide-react"

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pt-20 md:pt-32 lg:pt-40 ">
      <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
        {/* Text Content - Enhanced with better hierarchy */}
        <div className="col-span-12 lg:col-span-6 order-2 lg:order-1">
          <div
            className={`space-y-8 text-right transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 px-6 py-3 rounded-full text-sm font-medium border border-amber-200 shadow-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-amber-500" />
                <span className="font-bold"></span>
              </div>
              <span>منصة قانونية موثوقة</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>

            {/* Main Heading - Improved typography */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                مكتب الشاوي
                <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  للمحاماة
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl font-medium">
                خبرة قانونية متكاملة تجمع بين
                <span className="text-amber-600 font-semibold"> الأصالة والاحترافية </span>
                مع أحدث تقنيات الذكاء الاصطناعي
              </p>
            </div>

            {/* Enhanced CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button className="group relative bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3">
                  ابدأ الآن
                  <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
               
                </button>

                <button className="group flex items-center gap-3 text-gray-700 hover:text-amber-600 font-medium text-lg transition-colors duration-300">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-amber-50 rounded-full flex items-center justify-center transition-colors duration-300">
                    <Play className="w-5 h-5 mr-1" />
                  </div>
                  شاهد العرض التوضيحي
                </button>
              </div>

              {/* Social Proof */}
              {/* <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>+25,000 عميل موثوق</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>10+ سنوات خبرة</span>
                </div>
              </div> */}
            </div>

            {/* Enhanced Stats */}
            {/* <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              {[
                { number: "25k+", label: "عميل موثوق", icon: "👥" },
                { number: "4.9", label: "تقييم العملاء", icon: "⭐" },
                { number: "10+", label: "سنوات خبرة", icon: "🏆" },
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div> */}
          </div>
        </div>

        {/* Enhanced Bento Grid */}
        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 ">
          <div
            className={`transition-all duration-1000 ease-out delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl opacity-30 blur-xl" />
              <div className="relative ">
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
