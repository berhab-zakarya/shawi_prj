"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, User, ArrowLeft } from "lucide-react"
import { GridColumn } from "@/components/layout/grid-container"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const blogPosts = [
  {
    id: 1,
    title: "أحكام العقود في الفقه الإسلامي",
    excerpt: "دراسة شاملة حول أحكام العقود وشروطها في الشريعة الإسلامية وتطبيقاتها المعاصرة",
    author: "د. محمد أحمد",
    publishedAt: "2024-01-15",
    category: "العقود والمعاملات",
    readTime: 8,
    image: "/images/law.jpg",
  },
  {
    id: 2,
    title: "الأحكام القضائية في النظام السعودي",
    excerpt: "تحليل للأحكام القضائية الحديثة وتأثيرها على النظام القانوني في المملكة العربية السعودية",
    author: "أ. فاطمة السالم",
    publishedAt: "2024-01-10",
    category: "الأحكام القضائية",
    readTime: 12,
    image: "/images/law.jpg",
  },
  {
    id: 3,
    title: "التحكيم التجاري في القانون الدولي",
    excerpt: "نظرة على آليات التحكيم التجاري الدولي وأهميتها في حل النزاعات التجارية",
    author: "د. عبدالله الخالد",
    publishedAt: "2024-01-05",
    category: "العقود والمعاملات",
    readTime: 15,
    image: "/images/law.jpg",
  },
]

export function BlogSection() {
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

    const element = document.getElementById("blog-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div id="blog-section">
      {/* Section Header */}
      <GridColumn span={{ default: 12 }} className="text-center mb-16">
        <div
          className={cn(
            "space-y-4 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            المدونة القانونية
            <span className="block text-amber-600">مع الشاوي</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مقالات وتحليلات قانونية متخصصة لإثراء معرفتك القانونية
          </p>
        </div>
      </GridColumn>

      {/* Blog Posts */}
      {blogPosts.map((post, index) => (
        <GridColumn key={post.id} span={{ default: 12, lg: 4 }} className="mb-8">
          <Card
            className={cn(
              "h-full overflow-hidden group cursor-pointer border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{
              transitionDelay: `${index * 200}ms`,
            }}
          >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <Badge className="absolute top-4 right-4 bg-amber-600 text-white border-0">{post.category}</Badge>
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">⚖️</div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
                {post.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime} دقائق</span>
                </div>
              </div>
            </div>
          </Card>
        </GridColumn>
      ))}

      {/* View All Button */}
      <GridColumn span={{ default: 12 }} className="text-center mt-8">
        <Button
          variant="outline"
          size="lg"
          className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 group bg-transparent"
        >
          عرض جميع المقالات
          <ArrowLeft className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
        </Button>
      </GridColumn>
    </div>
  )
}
