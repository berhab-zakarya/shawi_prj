"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { faqSectionData } from "@/lib/constants"

export function FaqSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("faq-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const toggleAnswer = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div id="faq-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            الأسئلة
            <span className="block text-amber-600">الشائعة</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">أكثر الأسئلة شيوعاً حول خدماتنا القانونية</p>
        </div>
      </GridColumn>

      {/* FAQ Items */}
      <GridColumn span={{ default: 12, lg: 10 }} start={{ lg: 2 }}>
        <div className="space-y-4">
          {faqSectionData.map((item, index) => (
            <Card
              key={item.id}
              className={cn(
                "border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              )}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <button className="w-full p-6 text-right focus:outline-none group" onClick={() => toggleAnswer(item.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="text-2xl">{item.icon}</span>}
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                      {item.question}
                    </h3>
                  </div>
                  <div className="text-amber-600">
                    {openId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Answer */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openId === item.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </GridColumn>
    </div>
  )
}
