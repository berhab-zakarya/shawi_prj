"use client"

import { useEffect, useState } from "react"
import { Check, Star } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const pricingTiers = [
  {
    name: "تحليل مذكرة",
    price: "99 درهم",
    description: "تحليل فوري ومفصل للمستندات القانونية",
    features: ["تحليل فوري للمستند", "استخراج الوقائع والطلبات", "تقرير PDF قابل للتنزيل", "دعم فني على مدار الساعة"],
    popular: false,
    cta: "ابدأ الآن",
  },
  {
    name: "الخطة الذهبية",
    price: "499 درهم",
    period: "/شهرياً",
    description: "الحل الأمثل للمحامين والمكاتب القانونية",
    features: [
      "10 تحليلات للمذكرات شهرياً",
      "أولوية في الدعم البشري",
      "خصم 20% على الاستشارات الخاصة",
      "تقارير مفصلة ومخصصة",
      "دعم مخصص على مدار الساعة",
      "تكامل مع الأنظمة القانونية",
    ],
    popular: true,
    cta: "ابدأ الآن",
  },
  {
    name: "استشارة خاصة",
    price: "249 درهم",
    description: "جلسة استشارية مخصصة مع خبير قانوني",
    features: ["جلسة 30 دقيقة مع محامٍ", "سرية تامة ومضمونة", "خطة عمل مبدئية للقضية", "متابعة لمدة أسبوع"],
    popular: false,
    cta: "احجز الآن",
  },
]

export function PricingSection() {
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

    const element = document.getElementById("pricing-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="pricing-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            اختر خطتك
            <span className="block text-amber-600">المناسبة</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            أسعار مناسبة وحلول متنوعة لتلبية احتياجاتك القانونية
          </p>
        </div>
      </GridColumn>

      {/* Pricing Cards */}
      {pricingTiers.map((tier, index) => (
        <GridColumn key={tier.name} span={{ default: 12, lg: 4 }} className="mb-8">
          <Card
            className={cn(
              "h-full relative overflow-hidden border-0 transition-all duration-500 group",
              tier.popular
                ? "bg-gradient-to-b from-amber-50 to-white shadow-2xl ring-2 ring-amber-200 scale-105"
                : "bg-white shadow-lg hover:shadow-xl",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{
              transitionDelay: `${index * 150}ms`,
            }}
          >
            {/* Popular Badge */}
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-amber-600 text-white px-4 py-1 shadow-lg">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  الأكثر شعبية
                </Badge>
              </div>
            )}

            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-gray-500">{tier.period}</span>}
                </div>
                <p className="text-gray-600 text-sm">{tier.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={cn(
                  "w-full transition-all duration-300",
                  tier.popular
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl"
                    : "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white",
                )}
              >
                {tier.cta}
              </Button>
            </div>
          </Card>
        </GridColumn>
      ))}
    </div>
  )
}
