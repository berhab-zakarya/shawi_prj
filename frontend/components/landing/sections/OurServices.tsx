/* eslint-disable */

"use client"

import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"
import { useId, useState, useEffect } from "react"
import { Building, Home, Shield, Users, FileText, Briefcase, ArrowRight } from "lucide-react"

export function OurServices() {
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
    <div id="services-section" className="pt-8 md:pt-16 lg:pt-32" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" />
              خدمات متكاملة
            </div>
            <HeroSectionTextHover
              primaryText="خدماتنا "
              secondaryText="القانونية"
              thirdText="المتكاملة"
              conjunctionText=""
            />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
              نقدم مجموعة شاملة من الخدمات القانونية المتخصصة لتلبية جميع احتياجاتكم
            </p>
          </div>
        </div>

        {/* Enhanced Services Grid */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {enhancedLegalServices.map((service, index) => (
            <div key={service.title} className="col-span-12 sm:col-span-6 lg:col-span-4">
              <div
                className={`relative bg-gradient-to-b dark:from-neutral-900 from-neutral-50 dark:to-neutral-950 to-white p-8 rounded-3xl overflow-hidden transition-all duration-700 hover:scale-105 hover:shadow-2xl group cursor-pointer border border-gray-100 hover:border-gray-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Grid size={20} />

                {/* Service Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                </div>

                {/* Content */}
                <div className="space-y-4 relative z-20">
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-white group-hover:text-amber-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                    {service.description}
                  </p>

                  {/* Service Features */}
                  <ul className="space-y-2 text-sm text-gray-600">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm">
                      اعرف المزيد
                      <ArrowRight className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const enhancedLegalServices = [
  {
    title: "قانون الشركات",
    description: "تأسيس شركات، صياغة عقود، استشارات تجارية وخدمات قانونية شاملة للشركات من جميع الأحجام.",
    icon: Building,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    features: ["تأسيس الشركات", "صياغة العقود", "الاستشارات التجارية"],
  },
  {
    title: "القانون العقاري",
    description: "نزاعات إيجارية، بيع وشراء، تسجيل عقاري وجميع الخدمات المتعلقة بالعقارات والأملاك.",
    icon: Home,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    features: ["النزاعات الإيجارية", "عقود البيع والشراء", "التسجيل العقاري"],
  },
  {
    title: "القانون الجنائي",
    description: "دفاع وتمثيل في جميع أنواع القضايا الجنائية مع فريق من المحامين المتخصصين والخبراء.",
    icon: Shield,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    features: ["الدفاع الجنائي", "التمثيل القانوني", "الاستشارات الأمنية"],
  },
  {
    title: "قانون الأحوال الشخصية",
    description: "زواج، طلاق، حضانة، وميراث مع تقديم الاستشارات الشرعية والقانونية المناسبة.",
    icon: Users,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    features: ["قضايا الزواج والطلاق", "الحضانة والنفقة", "المواريث"],
  },
  {
    title: "القانون الإداري",
    description: "قضايا الموظفين، قرارات إدارية، عقود حكومية والتعامل مع الجهات الحكومية المختلفة.",
    icon: FileText,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    features: ["القضايا الإدارية", "العقود الحكومية", "قضايا الموظفين"],
  },
  {
    title: "قانون العمل",
    description: "عقود عمل، نزاعات عمالية، حقوق الموظفين وجميع القضايا المتعلقة ببيئة العمل.",
    icon: Briefcase,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
    features: ["عقود العمل", "النزاعات العمالية", "حقوق الموظفين"],
  },
]

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][]
  size?: number
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ]
  return (
    <div className="pointer-events-none absolute right-1/2 top-0 -mr-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-l [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  )
}

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId()

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any, idx: number) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}-${idx}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
