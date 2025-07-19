"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useRouter } from "next/navigation"
import { Post, usePosts } from "@/hooks/usePosts"
import { AuthContext } from "@/contexts/AuthContext"
import Header from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Share2,
  BookOpen,
  Tag,
  Star,
  FileText,
  Video,
  ImageIcon,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Heart,
  Bookmark,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import SectionBackground from "@/components/SectionBackground"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { getPostBySlug, deletePost, loading, errorMessage } = usePosts()
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const isAdminOrLawyer = user?.role && ["Admin", "Lawyer"].includes(user.role)

  const [post, setPost] = useState<Post | null>();
  const [successMessage, setSuccessMessage] = useState("")
  const [readingProgress, setReadingProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        const fetchedPost = await getPostBySlug(slug)
        setPost(fetchedPost)
      }
    }
    fetchPost()
  }, [slug])

  // Reading progress tracker
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadingProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener("scroll", updateReadingProgress)
    return () => window.removeEventListener("scroll", updateReadingProgress)
  }, [])

  const handleDelete = async () => {
    if (!user || !post) return

    if (isAdminOrLawyer && (user.role === "Admin" || post.author_email === user.email)) {
      if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
        const success = await deletePost(post.slug)
        if (success) {
          setSuccessMessage("تم حذف المنشور بنجاح")
          setTimeout(() => {
            router.push("/blog")
          }, 2000)
        }
      }
    }
  }

  const handleShare = async (platform?: string) => {
    const url = window.location.href
    const title = post?.title
    const text = post?.meta_description || post?.title

    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title!)}&url=${encodeURIComponent(url)}`)
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url)
      setSuccessMessage("تم نسخ الرابط إلى الحافظة")
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateDetailed = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const getContentTypeLabel = (type: string) => {
    const labels = {
      article: "مقال",
      video: "فيديو",
      infographic: "إنفوجرافيك",
      faq: "أسئلة شائعة",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getContentTypeIcon = (type: string) => {
    const icons = {
      article: FileText,
      video: Video,
      infographic: ImageIcon,
      faq: HelpCircle,
    }
    const Icon = icons[type as keyof typeof icons] || FileText
    return <Icon className="w-4 h-4" />
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <SectionBackground />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-80 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (errorMessage || !post) {
    return (
      <div dir="rtl" className="min-h-screen bg-white">
        <SectionBackground />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-12 border border-gray-200">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">المنشور غير موجود</h1>
              <p className="text-gray-600 mb-8">
                {errorMessage || "لم يتم العثور على المنشور المطلوب أو قد يكون محذوفاً"}
              </p>
              <Link href="/blog">
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للمدونة
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen relative mt-10">
      <SectionBackground />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-[#D4AF37] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <Header />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <Alert className="bg-white border border-green-200 shadow-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{successMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/blog" className="hover:text-[#D4AF37] transition-colors">
              المدونة
            </Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-md">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12">
            {/* Content Type & Featured Badge */}
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <div className="flex items-center gap-2">
                  {getContentTypeIcon(post.content_type)}
                  {getContentTypeLabel(post.content_type)}
                </div>
              </Badge>
              {post.is_featured && (
                <Badge className="bg-[#D4AF37] text-white text-sm px-3 py-1">
                  <Star className="w-3 h-3 ml-1" />
                  مميز
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-[#D4AF37] text-white font-semibold">
                      {post.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-600">خبير قانوني</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{getReadingTime(post.content)} دقائق قراءة</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{post.view_count.toLocaleString()} مشاهدة</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`border-gray-300 hover:bg-gray-50 ${isLiked ? "text-red-600 border-red-300" : ""}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`border-gray-300 hover:bg-gray-50 ${isBookmarked ? "text-[#D4AF37] border-[#D4AF37]" : ""}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-sm px-3 py-1 text-gray-600 border-gray-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <Tag className="w-3 h-3 ml-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Featured Image */}
            
              <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl mb-12 shadow-2xl">
                <Image src={post.media || "/images/law.jpg"} alt={post.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
          
          </header>

          {/* Article Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 lg:p-12">
                  <div
                    className="prose prose-lg prose-gray max-w-none"
                    style={{
                      fontSize: "18px",
                      lineHeight: "1.8",
                      color: "#374151",
                    }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </CardContent>
              </Card>

              {/* Share Section */}
              <Card className="mt-8 border border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">شارك هذا المقال</h3>
                      <p className="text-sm text-gray-600">ساعد الآخرين في الاستفادة من هذا المحتوى</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare("twitter")}
                        className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Twitter className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare("facebook")}
                        className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Facebook className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare("linkedin")}
                        className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare("copy")}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Author Bio */}
              <Card className="mt-8 border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-[#D4AF37] text-white font-bold text-xl">
                        {post.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author}</h3>
                      <p className="text-gray-600 mb-4">
                        خبير قانوني متخصص في القانون المدني والتجاري، يتمتع بخبرة واسعة في تقديم الاستشارات القانونية
                        والمساعدة في حل النزاعات القانونية المختلفة.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>نُشر في {formatDateDetailed(post.created_at)}</span>
                        <span>•</span>
                        <span>{post.view_count.toLocaleString()} مشاهدة</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Admin Actions */}
                {isAdminOrLawyer && (user.role === "Admin" || post.author_email === user.email) && (
                  <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">إدارة المنشور</h3>
                      <div className="space-y-2">
                        <Link href={`/blog?edit=${post.slug}`} className="block">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                          >
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل المنشور
                          </Button>
                        </Link>
                        <Button
                          onClick={handleDelete}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف المنشور
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}


                {/* Quick Actions */}
                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">إجراءات سريعة</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                        onClick={() => handleShare()}
                      >
                        <Share2 className="w-4 h-4 ml-2" />
                        مشاركة المقال
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                        onClick={() => window.print()}
                      >
                        <FileText className="w-4 h-4 ml-2" />
                        طباعة المقال
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <Link href="/blog">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة إلى المدونة
                </Button>
              </Link>
              <div className="flex gap-3">
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                  <BookOpen className="w-4 h-4 ml-2" />
                  مقالات ذات صلة
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
