"use client"

import { useState, useEffect } from "react"
import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Shield, CheckCircle } from 'lucide-react'

const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    // Reset form or show success message
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      description: "فريقنا الودود هنا لمساعدتكم",
      contact: "info@elshawi-law.ae",
      color: "blue",
      action: "mailto:info@elshawi-law.ae"
    },
    {
      icon: Phone,
      title: "الهاتف",
      description: "من الإثنين إلى الجمعة من 8 صباحاً إلى 5 مساءً",
      contact: "+971 50 123 4567",
      color: "green",
      action: "tel:+971501234567"
    },
    {
      icon: MapPin,
      title: "المكتب",
      description: "تعال وقم بزيارتنا في مقرنا",
      contact: "دبي، الإمارات العربية المتحدة",
      color: "purple",
      action: "#"
    },
    {
      icon: MessageCircle,
      title: "الدردشة المباشرة",
      description: "فريقنا الودود هنا لمساعدتكم",
      contact: "بدء دردشة جديدة",
      color: "orange",
      action: "#"
    },
  ]

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    green: "bg-green-100 text-green-600 hover:bg-green-200",
    purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    orange: "bg-orange-100 text-orange-600 hover:bg-orange-200",
  }

  return (
    <section id="contact-section" className="bg-white py-8 md:py-12 dark:bg-gray-900" lang="ar" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              تواصل معنا
            </div>
            <HeroSectionTextHover primaryText="تحدث" secondaryText="إلينا" thirdText="تتردد" conjunctionText="لا" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
              نحن هنا لمساعدتك في جميع احتياجاتك القانونية. تواصل معنا بالطريقة التي تناسبك
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Enhanced Contact Methods */}
          <div className="space-y-8">
            <div
              className={`transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-right">طرق التواصل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => (
                  <a
                    key={method.title}
                    href={method.action}
                    className={`block p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group cursor-pointer transform hover:-translate-y-1 ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          colorClasses[method.color as keyof typeof colorClasses]
                        }`}
                      >
                        <method.icon className="w-7 h-7" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                          {method.title}
                        </h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <p className="text-sm font-medium text-amber-600 group-hover:underline">
                          {method.contact}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Trust Signals */}
            <div
              className={`transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-right">لماذا تختارنا؟</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">استجابة سريعة خلال 24 ساعة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">سرية تامة ومضمونة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">متاح 24/7 للحالات العاجلة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Contact Form */}
          <div
            className={`transition-all duration-700 ease-out delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-right">أرسل رسالة</h3>
                <p className="text-gray-600 text-right">سنتواصل معك في أقرب وقت ممكن</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 text-right">الاسم الأول</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="محمد"
                      className="block w-full px-4 py-3 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 text-right">الاسم الأخير</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="السعيد"
                      className="block w-full px-4 py-3 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 text-right">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="mohammed@example.com"
                    className="block w-full px-4 py-3 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 text-right">الرسالة</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="اكتب رسالتك هنا..."
                    className="block w-full px-4 py-3 text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all duration-300 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>

              {/* Form Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  بإرسال هذا النموذج، فإنك توافق على 
                  <a href="#" className="text-amber-600 hover:underline mx-1">سياسة الخصوصية</a>
                  الخاصة بنا
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
