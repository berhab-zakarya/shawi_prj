"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDownIcon, ChevronUpIcon, HelpCircle, MessageCircle } from 'lucide-react'
import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"

interface FaqItem {
  id: number
  question: string
  answer: string
  icon?: string
  category?: string
}

interface FaqSectionProps {
  data: FaqItem[]
}

const FaqSection: React.FC<FaqSectionProps> = ({ data }) => {
  const [openId, setOpenId] = useState<number | null>(null)
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

    const element = document.getElementById("faq-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const toggleAnswer = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  // Group FAQs by category if available
  const groupedFaqs = data.reduce((acc, faq) => {
    const category = faq.category || 'عام'
    if (!acc[category]) acc[category] = []
    acc[category].push(faq)
    return acc
  }, {} as Record<string, FaqItem[]>)

  return (
    <div id="faq-section" className="mx-auto max-w-7xl py-8 md:py-12 flex flex-col">
      {/* Enhanced Header */}
      <div className="text-center mb-16">
        <div
          className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            إجابات شاملة
          </div>
          <HeroSectionTextHover
            primaryText="الأسئلة"
            secondaryText="الشائعة"
            thirdText="الأسئلة شيوعًا"
            conjunctionText="أكثر"
          />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
            إجابات مفصلة على أكثر الأسئلة شيوعاً حول خدماتنا القانونية
          </p>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-12">
        {Object.entries(groupedFaqs).map(([category, faqs], categoryIndex) => (
          <div key={category}>
            {Object.keys(groupedFaqs).length > 1 && (
              <div
                className={`mb-8 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${categoryIndex * 200}ms` }}
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">{category}</h3>
                <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full" />
              </div>
            )}

            <div className="space-y-4">
              {faqs.map((item, index) => (
                <div
                  key={item.id}
                  className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${(categoryIndex * faqs.length + index) * 100}ms` }}
                >
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden">
                    <button
                      className="flex w-full items-center justify-between p-6 text-right focus:outline-none group"
                      onClick={() => toggleAnswer(item.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {item.icon && (
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                          </div>
                        )}
                        <span className="text-lg font-semibold text-gray-800 group-hover:text-amber-600 transition-colors duration-300 text-right flex-1">
                          {item.question}
                        </span>
                      </div>
                      <div className="text-[#D4AF37] group-hover:text-amber-600 transition-colors duration-300">
                        {openId === item.id ? (
                          <ChevronUpIcon className="h-6 w-6 transform transition-transform duration-300" />
                        ) : (
                          <ChevronDownIcon className="h-6 w-6 transform transition-transform duration-300" />
                        )}
                      </div>
                    </button>

                    {/* Enhanced Answer Section */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openId === item.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-r-4 border-amber-500">
                          <p className="text-gray-700 leading-relaxed text-right">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div
        className={`mt-16 transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            لم تجد إجابة لسؤالك؟
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            فريقنا من الخبراء القانونيين جاهز للإجابة على جميع استفساراتك
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            تواصل معنا الآن
          </button>
        </div>
      </div>
    </div>
  )
}

export default FaqSection
