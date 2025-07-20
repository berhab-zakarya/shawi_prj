"use client"

import { useState, useEffect } from "react"
import { BookOpen, Search, Users, TrendingUp, Shield, Clock, Download, Eye, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LibraryPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const libraryFeatures = [
    {
      icon: BookOpen,
      title: "القوانين والتشريعات",
      description: "مجموعة شاملة من القوانين والتشريعات المحدثة من جميع الدول العربية والخليجية",
      features: ["نصوص قانونية محدثة", "تصنيف حسب المجال", "بحث متقدم", "تحديثات فورية"],
      color: "blue",
    },
    {
      icon: Shield,
      title: "السوابق والأحكام القضائية",
      description: "قاعدة بيانات ضخمة من الأحكام القضائية والسوابق من المحاكم العليا والمتخصصة",
      features: ["أحكام مصنفة", "تحليل قانوني", "مراجع موثقة", "سوابق قضائية"],
      color: "green",
    },
    {
      icon: Download,
      title: "العقود والنماذج الجاهزة",
      description: "مكتبة واسعة من العقود والنماذج القانونية الجاهزة والقابلة للتخصيص",
      features: ["نماذج متنوعة", "قابلة للتخصيص", "محدثة قانونياً", "سهلة الاستخدام"],
      color: "purple",
    },
    {
      icon: Search,
      title: "المذكرات والأبحاث",
      description: "مجموعة من المذكرات القانونية والأبحاث المتخصصة من خبراء القانون",
      features: ["أبحاث متخصصة", "مذكرات واقعية", "تحليل عميق", "مراجع علمية"],
      color: "orange",
    },
    {
      icon: Eye,
      title: "الكتب القانونية",
      description: "مكتبة رقمية من أهم الكتب والمراجع القانونية في مختلف التخصصات",
      features: ["كتب متخصصة", "مراجع موثوقة", "تحميل مجاني", "تحديث مستمر"],
      color: "red",
    },
    {
      icon: Users,
      title: "قواعد البيانات المقارنة",
      description: "مقارنات شاملة للقوانين والأنظمة القانونية بين الدول المختلفة",
      features: ["مقارنات دولية", "تحليل مقارن", "دراسات معمقة", "تغطية واسعة"],
      color: "teal",
    },
  ]

  const stats = [
    { number: "50,000+", label: "مستند قانوني", icon: "📄" },
    { number: "25+", label: "دولة مغطاة", icon: "🌍" },
    { number: "100+", label: "خبير قانوني", icon: "👨‍⚖️" },
    { number: "24/7", label: "إتاحة المحتوى", icon: "🕐" },
  ]

  const benefits = [
    {
      icon: Clock,
      title: "وصول فوري",
      description: "احصل على المعلومات القانونية التي تحتاجها في ثوانٍ معدودة",
    },
    {
      icon: Shield,
      title: "محتوى موثوق",
      description: "جميع المواد مراجعة ومعتمدة من خبراء قانونيين متخصصين",
    },
    {
      icon: TrendingUp,
      title: "تحديث مستمر",
      description: "المحتوى يتم تحديثه باستمرار لمواكبة آخر التطورات القانونية",
    },
    {
      icon: Search,
      title: "بحث متقدم",
      description: "نظام بحث ذكي يساعدك في العثور على المعلومة المطلوبة بسرعة",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white">
        <div className="container mx-auto px-4 py-20">
          <div
            className={`text-center transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <BookOpen className="w-20 h-20 mx-auto mb-8" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">المكتبة القانونية الذكية</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-8">
              مكتبة شاملة تضم أكبر مجموعة من المراجع والمصادر القانونية المحدثة والمصنفة بعناية فائقة
            </p>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg"
              onClick={() => (window.location.href = "/auth")}
            >
              ابدأ الاستكشاف الآن
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* What's in the Library */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">ماذا تحتوي المكتبة؟</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              مجموعة متنوعة ومتكاملة من المصادر القانونية لتلبية جميع احتياجاتك المهنية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {libraryFeatures.map((feature, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-700 hover:shadow-xl hover:-translate-y-2 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-${feature.color}-100 flex items-center justify-center mb-4`}
                  >
                    <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 text-right">{feature.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-6 leading-relaxed text-right">{feature.description}</p>

                  <div className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-6" onClick={() => (window.location.href = "/auth")}>
                    استكشف القسم
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-900 text-white py-16 rounded-3xl mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">أرقام تتحدث عن نفسها</h2>
            <p className="text-xl text-gray-300">إحصائيات حقيقية تعكس ثراء وتنوع محتوى المكتبة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">{stat.number}</div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">لماذا المكتبة الذكية؟</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              مزايا فريدة تجعل من مكتبتنا الخيار الأمثل للمحامين والباحثين القانونيين
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <benefit.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">ابدأ رحلتك القانونية الآن</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            انضم إلى آلاف المحامين والباحثين الذين يعتمدون على مكتبتنا الذكية في عملهم اليومي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4"
              onClick={() => (window.location.href = "/auth")}
            >
              ابدأ الاستكشاف مجاناً
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              onClick={() => (window.location.href = "/auth")}
            >
              طلب عرض توضيحي
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
