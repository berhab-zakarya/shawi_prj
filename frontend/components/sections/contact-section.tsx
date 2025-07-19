"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const contactMethods = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    description: "فريقنا الودود هنا لمساعدتكم",
    contact: "info@elshawi-law.ae",
    color: "text-blue-600",
  },
  {
    icon: Phone,
    title: "الهاتف",
    description: "من الإثنين إلى الجمعة من 8 صباحاً إلى 5 مساءً",
    contact: "+971 50 123 4567",
    color: "text-green-600",
  },
  {
    icon: MapPin,
    title: "المكتب",
    description: "تعال وقم بزيارتنا في مقرنا",
    contact: "دبي، الإمارات العربية المتحدة",
    color: "text-purple-600",
  },
  {
    icon: MessageCircle,
    title: "الدردشة المباشرة",
    description: "فريقنا الودود هنا لمساعدتكم",
    contact: "بدء دردشة جديدة",
    color: "text-orange-600",
  },
]

export function ContactSection() {
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

    const element = document.getElementById("contact-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div id="contact-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            لا تتردد
            <span className="block text-amber-600">تحدث إلينا</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">نحن هنا لمساعدتك في جميع احتياجاتك القانونية</p>
        </div>
      </GridColumn>

      {/* Contact Methods */}
      <GridColumn span={{ default: 12, lg: 6 }} className="mb-12 lg:mb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactMethods.map((method, index) => (
            <Card
              key={method.title}
              className={cn(
                "p-6 border-0 bg-white shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              )}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="space-y-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    method.color,
                  )}
                >
                  <method.icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{method.title}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-300 group-hover:underline",
                      method.color,
                    )}
                  >
                    {method.contact}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </GridColumn>

      {/* Contact Form */}
      <GridColumn span={{ default: 12, lg: 6 }}>
        <Card
          className={cn(
            "p-8 border-0 bg-white shadow-lg",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
          style={{ transitionDelay: "400ms" }}
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                <Input placeholder="محمد" className="border-gray-200 focus:border-amber-500 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأخير</label>
                <Input placeholder="السعيد" className="border-gray-200 focus:border-amber-500 focus:ring-amber-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="mohammed@example.com"
                className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
              <Textarea
                placeholder="اكتب رسالتك هنا"
                rows={5}
                className="border-gray-200 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              إرسال الرسالة
            </Button>
          </form>
        </Card>
      </GridColumn>
    </div>
  )
}
