/* eslint-disable */
"use client"

import type React from "react"

import { useState, useEffect, useContext } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { usePosts } from "@/hooks/usePosts"
import { postSchema, type PostFormData } from "@/lib/validations/post"
import { AuthContext } from "@/contexts/AuthContext"
import Header from "@/components/layout/Header"
import RichTextEditor from "@/components/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  Eye,
  Plus,
  Search,
  Tag,
  User,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Save,
  X,
  FileText,
  Video,
  ImageIcon,
  HelpCircle,
  Star,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import SectionBackground from "@/components/SectionBackground"

type ViewMode = "list" | "create" | "edit"
interface ErrorType 
  { 
    message?: string ;
    title?:string;
  }

export default function BlogPage() {
  const router = useRouter()

  // Helper function to extract error messages safely
  const getErrorMessage = (error: ErrorType): string => {
    if (typeof error?.message === "string") {
      return error.message
    }
    return "خطأ في الحقل"
  }

  const {
    posts,
    featuredPosts,
    tagStats,
    totalCount,
    loading,
    errorMessage,
    getPosts,
    createPost,
    updatePost,
    deletePost,
  } = usePosts()
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const isAdminOrLawyer = user?.role && ["Admin", "Lawyer"].includes(user.role)

  // View state management
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [editingPost, setEditingPost] = useState<any>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContentType, setSelectedContentType] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>("")

  // UI states
  const [newTag, setNewTag] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // React Hook Form setup with proper default values
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content_type: "article",
      content: "",
      media: undefined,
      tags: [],
      meta_title: "",
      meta_description: "",
      is_featured: false,
    },
  })

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = form

  // Filter posts based on search (client-side for search term only)
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Apply server-side filters
  useEffect(() => {
    const filters: any = {}
    if (selectedContentType !== "all") filters.content_type = selectedContentType
    if (selectedTag !== "all") filters.tags__name = selectedTag
    if (selectedDate) filters.created_at = selectedDate

    getPosts(filters)
  }, [selectedContentType, selectedTag, selectedDate])

  // Handle form submission
  const onSubmit = async (data: PostFormData) => {
    try {
      const formDataToSubmit = {
        ...data,
        media: selectedFile || undefined,
      }

      if (editingPost) {
        const result = await updatePost(editingPost.slug, formDataToSubmit)
        if (result) {
          setSuccessMessage("تم تحديث المنشور بنجاح")
          setViewMode("list")
          setEditingPost(null)
          resetForm()
          router.push(`/blog/${result.slug}`)
        }
      } else {
        const result = await createPost(formDataToSubmit)
        if (result) {
          setSuccessMessage("تم إنشاء المنشور بنجاح")
          setViewMode("list")
          resetForm()
          router.push(`/blog/${result.slug}`)
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const resetForm = () => {
    reset({
      title: "",
      content_type: "article",
      content: "",
      media: undefined,
      tags: [],
      meta_title: "",
      meta_description: "",
      is_featured: false,
    })
    setSelectedFile(null)
    setNewTag("")
  }

  const handleCreateNew = () => {
    resetForm()
    setEditingPost(null)
    setViewMode("create")
  }

  const handleEdit = (post: any) => {
    if (!user) {
      setSuccessMessage("")
      return
    }
    if (isAdminOrLawyer && (user.role === "Admin" || post.author_email === user.email)) {
      setEditingPost(post)
      reset({
        title: post.title,
        content_type: post.content_type,
        content: post.content,
        media: undefined,
        tags: post.tags || [],
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        is_featured: post.is_featured,
      })
      setSelectedFile(null)
      setViewMode("edit")
    }
  }

  const handleCancel = () => {
    setViewMode("list")
    setEditingPost(null)
    resetForm()
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      const currentTags = getValues("tags") || []
      if (!currentTags.includes(newTag.trim())) {
        setValue("tags", [...currentTags, newTag.trim()])
        setNewTag("")
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = getValues("tags") || []
    setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleDelete = async (slug: string, authorEmail: string) => {
    if (!user) {
      setSuccessMessage("")
      return
    }
    if (isAdminOrLawyer && (user.role === "Admin" || authorEmail === user.email)) {
      if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
        const success = await deletePost(slug)
        if (success) {
          setSuccessMessage("تم حذف المنشور بنجاح")
        }
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

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  if (!authContext) {
    return <div>خطأ: يجب أن تكون الصفحة ملفوفة بـ AuthProvider</div>
  }

  return (
    <div dir="rtl" className="min-h-screen relative">
      {/* Grid Background */}
      <SectionBackground />

      <Header />

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <Alert className="bg-white border border-green-200 shadow-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{successMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <Alert variant="destructive" className="bg-white shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-24 pb-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">المدونة القانونية</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              مقالات وموارد قانونية متخصصة من خبراء القانون لخدمة المجتمع القانوني
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>محدث يومياً</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>خبراء قانونيين</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{totalCount} منشور</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Create/Edit Post Form */}
        {(viewMode === "create" || viewMode === "edit") && (
          <Card className="mb-12 border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                    {viewMode === "edit" ? (
                      <Edit className="w-4 h-4 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {viewMode === "edit" ? "تعديل المنشور" : "إنشاء منشور جديد"}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للقائمة
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      العنوان *
                    </Label>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="title"
                          placeholder="أدخل عنوان المنشور"
                          className={`${errors.title
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-300 focus:border-[#D4AF37]"
                            }`}
                        />
                      )}
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {getErrorMessage(errors.title)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content_type" className="text-sm font-medium text-gray-700">
                      نوع المحتوى *
                    </Label>
                    <Controller
                      name="content_type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            className={`${errors.content_type
                                ? "border-red-300 focus:border-red-500"
                                : "border-gray-300 focus:border-[#D4AF37]"
                              }`}
                          >
                            <SelectValue placeholder="اختر نوع المحتوى" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                مقال
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                فيديو
                              </div>
                            </SelectItem>
                            <SelectItem value="infographic">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                إنفوجرافيك
                              </div>
                            </SelectItem>
                            <SelectItem value="faq">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                أسئلة شائعة
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.content_type && (
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {getErrorMessage(errors.content_type)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                    المحتوى *
                  </Label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <div className="border border-gray-300 rounded-md overflow-hidden focus-within:border-[#D4AF37]">
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="اكتب محتوى المنشور هنا..."
                          error={errors.content ? getErrorMessage(errors.content) : undefined}
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media" className="text-sm font-medium text-gray-700">
                    الوسائط{" "}
                    {watch("content_type") === "video" || watch("content_type") === "infographic" ? "*" : "(اختياري)"}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                    <Input
                      id="media"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          تم اختيار الملف: {selectedFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.media && (
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {getErrorMessage(errors.media)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">العلامات</Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="إضافة علامة جديدة"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      className="flex-1 border-gray-300 focus:border-[#D4AF37]"
                    />
                    <Button type="button" onClick={handleAddTag} className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(watch("tags") || []).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <Tag className="w-3 h-3 ml-1" />
                        {tag}
                        <X className="w-3 h-3 mr-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title" className="text-sm font-medium text-gray-700">
                      عنوان SEO
                    </Label>
                    <Controller
                      name="meta_title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="meta_title"
                          placeholder="حتى 60 حرف"
                          className="border-gray-300 focus:border-[#D4AF37]"
                        />
                      )}
                    />
                    {errors.meta_title && <p className="text-red-600 text-sm">{getErrorMessage(errors.meta_title)}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description" className="text-sm font-medium text-gray-700">
                      وصف SEO
                    </Label>
                    <Controller
                      name="meta_description"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="meta_description"
                          placeholder="حتى 160 حرف"
                          className="border-gray-300 focus:border-[#D4AF37]"
                        />
                      )}
                    />
                    {errors.meta_description && (
                      <p className="text-red-600 text-sm">{getErrorMessage(errors.meta_description)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#D4AF37]"
                      />
                    )}
                  />
                  <Label htmlFor="is_featured" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    منشور مميز
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                  >
                    <Save className="w-4 h-4 ml-2" />
                    {isSubmitting || loading ? "جاري الحفظ..." : viewMode === "edit" ? "تحديث المنشور" : "نشر المنشور"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List View */}
        {viewMode === "list" && (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في المقالات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 border-gray-300 focus:border-[#D4AF37]"
                  />
                </div>

                {isAdminOrLawyer && (
                  <Button onClick={handleCreateNew} className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء منشور جديد
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                  <SelectTrigger className="w-48 border-gray-300 focus:border-[#D4AF37]">
                    <SelectValue placeholder="نوع المحتوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="article">مقال</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                    <SelectItem value="infographic">إنفوجرافيك</SelectItem>
                    <SelectItem value="faq">أسئلة شائعة</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-48 border-gray-300 focus:border-[#D4AF37]">
                    <SelectValue placeholder="العلامات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العلامات</SelectItem>
                    {tagStats.map((stat) => (
                      <SelectItem key={stat.tags__name} value={stat.tags__name}>
                        {stat.tags__name} ({stat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48 border-gray-300 focus:border-[#D4AF37]"
                />

                {(selectedContentType !== "all" || selectedTag !== "all" || selectedDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedContentType("all")
                      setSelectedTag("all")
                      setSelectedDate("")
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 ml-1" />
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  جميع المنشورات
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  المنشورات المميزة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse border border-gray-200">
                        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <Card
                        key={post.id}
                        className="group hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden"
                      >

                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.media || "/images/law.jpg"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary" className="text-xs">
                              <div className="flex items-center gap-1">
                                {getContentTypeIcon(post.content_type)}
                                {getContentTypeLabel(post.content_type)}
                              </div>
                            </Badge>
                            {post.is_featured && (
                              <Badge className="bg-[#D4AF37] text-white text-xs">
                                <Star className="w-3 h-3 ml-1" />
                                مميز
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                            {post.title}
                          </h3>

                          <div
                            className="text-gray-600 text-sm mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + "..." }}
                          />

                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs px-2 py-0 text-gray-600 border-gray-300"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-0 text-gray-500 border-gray-300">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(post.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.view_count}
                              </span>
                            </div>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.author}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/blog/${post.slug}`} className="flex-1">
                              <Button size="sm" className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                                قراءة المزيد
                              </Button>
                            </Link>

                            {isAdminOrLawyer && (user.role === "Admin" || post.author_email === user.email) && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(post)}
                                  className="border-gray-300 hover:bg-gray-50"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(post.slug, post.author_email)}
                                  className="border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!loading && filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منشورات</h3>
                    <p className="text-gray-500">لا توجد منشورات تطابق معايير البحث المحددة</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="featured" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="group hover:shadow-lg transition-all duration-200 border-2 border-[#D4AF37] overflow-hidden"
                    >
                      {post.media && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.media || "/images/law.jpg"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-[#D4AF37] text-white text-xs">
                              <Star className="w-3 h-3 ml-1" />
                              مميز
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">
                            <div className="flex items-center gap-1">
                              {getContentTypeIcon(post.content_type)}
                              {getContentTypeLabel(post.content_type)}
                            </div>
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                          {post.title}
                        </h3>

                        <div
                          className="text-gray-600 text-sm mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + "..." }}
                        />

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(post.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count}
                          </span>
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <Button size="sm" className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                            قراءة المزيد
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Tag Statistics */}
            {tagStats.length > 0 && (
              <section className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">العلامات الشائعة</h2>
                  <p className="text-gray-600">اكتشف المواضيع الأكثر تداولاً في المدونة</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {tagStats.map((stat) => (
                    <Badge
                      key={stat.tags__name}
                      variant="outline"
                      className="cursor-pointer hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-colors px-3 py-1"
                      onClick={() => setSelectedTag(stat.tags__name)}
                    >
                      <Tag className="w-3 h-3 ml-1" />
                      {stat.tags__name}
                      <span className="mr-1 text-xs opacity-70">({stat.count})</span>
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
