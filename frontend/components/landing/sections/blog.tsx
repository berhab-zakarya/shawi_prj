"use client"

import { useState, useEffect, useMemo } from "react"
import { useBlog } from "@/hooks/use-blog"
import { BlogGrid } from "../blog/blog-grid"
import { BlogSearch } from "../blog/blog-search"
import HeroSectionTextHover from "@/components/animata/hero/hero-section-text-hover"
import { BookOpen, TrendingUp, Clock, Users } from 'lucide-react'

export default function ArabicBlog() {
  const { posts, categories, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useBlog()
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

  // Memoize stats to prevent recalculation
  const blogStats = useMemo(() => {
    const totalPosts = posts.length
    const totalReadTime = posts.reduce((acc, post) => acc + post.readTime, 0)
    const uniqueAuthors = new Set(posts.map(post => post.author)).size
    
    return {
      totalPosts,
      avgReadTime: totalPosts > 0 ? Math.round(totalReadTime / totalPosts) : 0,
      uniqueAuthors,
    }
  }, [posts])

  return (
    <div id="blog-section" dir="rtl" className="min-h-screen pt-8 md:pt-16 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div
            className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              مقالات متخصصة
            </div>
            <HeroSectionTextHover
              primaryText="المدونة القانونية"
              secondaryText="استكشف مقالاتنا"
              thirdText="مع الشاوي"
              conjunctionText=""
            />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
              مقالات وتحليلات قانونية متخصصة من خبراء المجال لإثراء معرفتك القانونية
            </p>
          </div>
        </div>

        {/* Blog Stats */}
        <div
          className={`mb-12 transition-all duration-700 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{blogStats.totalPosts}</div>
              <div className="text-gray-600 text-sm">مقال متخصص</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{blogStats.avgReadTime}</div>
              <div className="text-gray-600 text-sm">دقيقة متوسط القراءة</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{blogStats.uniqueAuthors}</div>
              <div className="text-gray-600 text-sm">خبير قانوني</div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div
          className={`transition-all duration-700 ease-out delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <BlogSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </div>

        {/* Enhanced Results Count */}
        <div
          className={`mb-8 transition-all duration-700 ease-out delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {posts.length > 0 ? (
                <>
                  تم العثور على <span className="font-semibold text-[#D4AF37]">{posts.length}</span> مقال
                  {searchQuery && (
                    <>
                      {" "}
                      للبحث عن "<span className="font-semibold">{searchQuery}</span>"
                    </>
                  )}
                </>
              ) : (
                "لا توجد نتائج"
              )}
            </p>
            
            {posts.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>مرتب حسب الأحدث</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Blog Grid */}
        <div
          className={`transition-all duration-700 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <BlogGrid posts={posts} />
        </div>

        {/* Call to Action */}
        {posts.length > 0 && (
          <div
            className={`mt-16 text-center transition-all duration-700 ease-out delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                هل تريد المزيد من المحتوى القانوني؟
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                اشترك في نشرتنا الإخبارية للحصول على أحدث المقالات والتحليلات القانونية
              </p>
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                اشترك الآن
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
