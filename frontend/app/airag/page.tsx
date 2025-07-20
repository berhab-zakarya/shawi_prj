"use client"

import { useState, useEffect } from "react"
import { FileText, Brain, Scale, PenTool, Download, ArrowRight, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AIRagPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const aiFeatures = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "رفع وتحليل المستندات",
      description:
        "ارفع ملفات Word أو PDF بسهولة تامة للحصول على تحليل فوري ودقيق باستخدام أحدث تقنيات الذكاء الاصطناعي المتطورة",
      features: ["دعم ملفات Word و PDF", "تحليل فوري خلال ثوانٍ", "دقة عالية في الاستخراج", "حفظ آمن للملفات"],
      color: "blue",
      gradient: "from-blue-50 to-blue-100",
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "الاستخراج الذكي للمعلومات",
      description:
        "يقوم النظام باستخراج الوقائع والطلبات والمعلومات المهمة تلقائياً مع تحليل السياق القانوني بدقة متناهية",
      features: ["استخراج الوقائع القانونية", "تحديد الطلبات والمطالب", "تحليل السياق القانوني", "تصنيف المعلومات"],
      color: "purple",
      gradient: "from-purple-50 to-purple-100",
    },
    {
      icon: <Scale className="h-8 w-8 text-green-600" />,
      title: "المقارنة مع الأحكام القضائية",
      description:
        "يقارن النصوص مع مكتبة شاملة من الأحكام القضائية لاستنتاج السوابق القضائية المناسبة والمرجعيات القانونية",
      features: [
        "مكتبة شاملة من الأحكام",
        "مقارنة ذكية للسوابق",
        "تحديد المرجعيات القانونية",
        "تحليل الاتجاهات القضائية",
      ],
      color: "green",
      gradient: "from-green-50 to-green-100",
    },
    {
      icon: <PenTool className="h-8 w-8 text-orange-600" />,
      title: "الاقتراح والصياغة الاحترافية",
      description: "يقترح مذكرة قانونية احترافية بصيغ متعددة مع إمكانية التخصيص الكامل حسب نوع القضية والمحكمة المختصة",
      features: ["صياغة مذكرات احترافية", "صيغ متعددة ومتنوعة", "تخصيص حسب نوع القضية", "مراجعة وتحسين النصوص"],
      color: "orange",
      gradient: "from-orange-50 to-orange-100",
    },
    {
      icon: <Download className="h-8 w-8 text-red-600" />,
      title: "التنزيل المباشر والمشاركة",
      description: "نتائج جاهزة للتنزيل بصيغة PDF أو Word مع إمكانية المشاركة المباشرة والطباعة عالية الجودة",
      features: ["تنزيل بصيغ متعددة", "جودة طباعة عالية", "مشاركة آمنة", "حفظ في السحابة"],
      color: "red",
      gradient: "from-red-50 to-red-100",
    },
  ]

  const stats = [
    { number: "50,000+", label: "مستند محلل", icon: "📄" },
    { number: "99.5%", label: "دقة التحليل", icon: "🎯" },
    { number: "30 ثانية", label: "متوسط وقت التحليل", icon: "⚡" },
    { number: "24/7", label: "متاح على مدار الساعة", icon: "🕐" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div
            className={`text-center transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Badge className="mb-6 bg-[#D4AF37]/10 text-[#D4AF37] border-white/30 px-6 py-2 text-lg">
              <Brain className="w-5 h-5 ml-2" />
              نظام الذكاء الاصطناعي القانوني
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              المحامي الذكي
              <span className="block text-yellow-300">بتقنية الـ AI</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
              اكتشف قوة الذكاء الاصطناعي في التحليل القانوني مع نظامنا المتطور الذي يجمع بين الخبرة القانونية
              والتكنولوجيا المتقدمة
            </p>
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg rounded-xl"
              onClick={() => (window.location.href = "/auth")}
            >
              جرب النظام مجاناً
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">كيف يعمل النظام؟</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            خمس خطوات بسيطة للحصول على تحليل قانوني شامل ومذكرة احترافية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 border-0 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`} />
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    الخطوة {index + 1}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 text-right">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-700 mb-6 leading-relaxed text-right">{feature.description}</p>
                <div className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">أرقام تتحدث عن نفسها</h2>
            <p className="text-xl text-gray-300">إحصائيات حقيقية تعكس جودة وكفاءة نظامنا</p>
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
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">جاهز لتجربة المستقبل؟</h2>
          <p className="text-xl mb-8 opacity-90">ابدأ الآن واكتشف كيف يمكن للذكاء الاصطناعي أن يحول عملك القانوني</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4"
              onClick={() => (window.location.href = "/auth")}
            >
              ابدأ التجربة المجانية
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              onClick={() => (window.location.href = "/auth")}
            >
              شاهد العرض التوضيحي
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
