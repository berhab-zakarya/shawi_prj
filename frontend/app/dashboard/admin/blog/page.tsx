/* eslint-diasble */


"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/hooks/useAdminBlog"
import type { Post, User, PostStats, CreatePostData, CreateUserData } from "@/types/admin-blog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PlusCircle,
  Edit,
  Trash2,
  Users,
  FileText,
  TrendingUp,
  Star,
  Eye,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  UserX,
  Save,
  X,
  BarChart3,
} from "lucide-react"

type ViewMode = "dashboard" | "posts" | "create-post" | "edit-post" | "users" | "create-user" | "edit-user" | "creators"


export default function AdminBlogPage() {
  const {
    errorMessage,
    loading,
    createPost,
    updatePost,
    deletePost,
    getPostStats,
    createUser,
    updateUser,
    toggleUserActive,
    getContentCreators,
  } = useAdmin()

  const [currentView, setCurrentView] = useState<ViewMode>("dashboard")
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [creators, setCreators] = useState<User[]>([])
  const [stats, setStats] = useState<PostStats | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [postForm, setPostForm] = useState<CreatePostData>({
    title: "",
    content_type: "article",
    content: "",
    tags: [],
    meta_title: "",
    meta_description: "",
    is_featured: false,
  })

  const [userForm, setUserForm] = useState<CreateUserData>({
    email: "",
    first_name: "",
    last_name: "",
    role: "user",
    is_active: true,
    email_verified: false,
    profile: {
      phone_number: "",
      address: "",
      city: "",
      country: "",
      occupation: "",
    },
  })

  const [tagInput, setTagInput] = useState("")


  const loadStats = async () => {
    try {
      const statsData = await getPostStats()
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const loadCreators = async () => {
    try {
      const creatorsData = await getContentCreators()
      setCreators(creatorsData)
    } catch (error) {
      console.error("Failed to load creators:", error)
    }
  }

  // Load initial data
  useEffect(() => {
    loadStats()
    loadCreators()
  }, [])
  const handleCreatePost = async () => {
    try {
      const newPost = await createPost(postForm)
      setPosts((prev) => [newPost, ...prev])
      setCurrentView("posts")
      resetPostForm()
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleUpdatePost = async () => {
    if (!selectedPost) return
    try {
      const updatedPost = await updatePost(selectedPost.slug, postForm)
      setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
      setCurrentView("posts")
      resetPostForm()
      setSelectedPost(null)
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  const handleDeletePost = async (slug: string) => {
    try {
      await deletePost(slug)
      setPosts((prev) => prev.filter((p) => p.slug !== slug))
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const handleCreateUser = async () => {
    try {
      const newUser = await createUser(userForm)
      setUsers((prev) => [newUser, ...prev])
      setCurrentView("users")
      resetUserForm()
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    try {
      const updatedUser = await updateUser(selectedUser.id, userForm)
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
      setCurrentView("users")
      resetUserForm()
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleToggleUserActive = async (userId: number) => {
    try {
      await toggleUserActive(userId)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)))
      setCreators((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)))
    } catch (error) {
      console.error("Failed to toggle user active:", error)
    }
  }

  const resetPostForm = () => {
    setPostForm({
      title: "",
      content_type: "article",
      content: "",
      tags: [],
      meta_title: "",
      meta_description: "",
      is_featured: false,
    })
  }

  const resetUserForm = () => {
    setUserForm({
      email: "",
      first_name: "",
      last_name: "",
      role: "user",
      is_active: true,
      email_verified: false,
      profile: {
        phone_number: "",
        address: "",
        city: "",
        country: "",
        occupation: "",
      },
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !postForm.tags?.includes(tagInput.trim())) {
      setPostForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPostForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const startEditPost = (post: Post) => {
    setSelectedPost(post)
    setPostForm({
      title: post.title,
      content_type: post.content_type,
      content: post.content,
      tags: post.tags,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      is_featured: post.is_featured,
    })
    setCurrentView("edit-post")
  }
const startEditUser = (user: User) => {
  setSelectedUser(user)
  setUserForm({
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_active: user.is_active,
    email_verified: user.email_verified,
    profile: {
      phone_number: user.profile?.phone_number ?? "",
      address: user.profile?.address ?? "",
      city: user.profile?.city ?? "",
      country: user.profile?.country ?? "",
      occupation: user.profile?.occupation ?? "",
    },
  })
  setCurrentView("edit-user")
}

  return (
    <div className="min-h-screen " dir="rtl">
      <div className="container mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="bg-primary text-primary-foreground rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">إدارة المدونة</h1>
              <p className="text-primary-foreground/80">لوحة تحكم شاملة لإدارة المحتوى والمستخدمين</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={currentView === "dashboard" ? "secondary" : "outline"}
                onClick={() => setCurrentView("dashboard")}
                className={
                  currentView === "dashboard"
                    ? "bg-secondary text-secondary-foreground"
                    : "border-primary-foreground/20  hover:bg-primary-foreground/10 text-black"
                }
              >
                <BarChart3 className="w-4 h-4 ml-2" />
                لوحة التحكم
              </Button>
              <Button
                variant={currentView === "posts" ? "secondary" : "outline"}
                onClick={() => setCurrentView("posts")}
                className={
                  currentView === "posts"
                    ? "bg-secondary text-secondary-foreground"
                    : "border-primary-foreground hover:bg-primary-foreground text-black"
                }
              >
                <FileText className="w-4 h-4 ml-2" />
                المقالات
              </Button>
              <Button
                variant={currentView === "users" ? "secondary" : "outline"}
                onClick={() => setCurrentView("users")}
                className={
                  currentView === "users"
                    ? "bg-secondary text-secondary-foreground"
                    : "border-primary-foreground/20  hover:bg-primary-foreground/10 text-black"
                }
              >
                <Users className="w-4 h-4 ml-2" />
                المستخدمين
              </Button>
              <Button
                variant={currentView === "creators" ? "secondary" : "outline"}
                onClick={() => setCurrentView("creators")}
                className={
                  currentView === "creators"
                    ? "bg-secondary text-secondary-foreground"
                    : "border-primary-foreground/20 hover:bg-primary-foreground/10 text-black"
                }
              >
                <Star className="w-4 h-4 ml-2" />
                منشئي المحتوى
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertDescription className="font-medium text-destructive">{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="space-y-4">
          {/* Dashboard View */}
          {currentView === "dashboard" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المقالات</CardTitle>
                    <div className="p-2 bg-chart-1/20 rounded-full">
                      <FileText className="h-4 w-4 text-chart-1" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold text-foreground">{stats?.total_posts || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">جميع المقالات المنشورة</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-sm font-medium text-muted-foreground">المقالات المميزة</CardTitle>
                    <div className="p-2 bg-chart-2/20 rounded-full">
                      <Star className="h-4 w-4 text-chart-2" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold text-foreground">{stats?.featured_posts || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">المقالات المميزة</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-sm font-medium text-muted-foreground">منشئي المحتوى</CardTitle>
                    <div className="p-2 bg-chart-3/20 rounded-full">
                      <Users className="h-4 w-4 text-chart-3" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold text-foreground">{creators.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">إجمالي المنشئين</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30 rounded-t-lg">
                    <CardTitle className="text-sm font-medium text-muted-foreground">المستخدمين النشطين</CardTitle>
                    <div className="p-2 bg-chart-4/20 rounded-full">
                      <UserCheck className="h-4 w-4 text-chart-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold text-foreground">
                      {creators.filter((u) => u.is_active).length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">المستخدمين الفعالين</p>
                  </CardContent>
                </Card>
              </div>

              {/* Posts by Type */}
              {stats?.posts_by_type && (
                <Card className="border-0 shadow-lg bg-card">
                  <CardHeader className="bg-muted/50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <TrendingUp className="w-5 h-5" />
                      المقالات حسب النوع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats.posts_by_type).map(([type, count], index) => {
                        const chartColors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]
                        const colorClass = chartColors[index % chartColors.length]
                        return (
                          <div
                            key={type}
                            className={`p-4 rounded-lg bg-muted/30 border border-border text-center hover:bg-muted/50 transition-colors`}
                          >
                            <div className={`font-bold text-2xl text-${colorClass} mb-1`}>{count}</div>
                            <div className="text-sm text-muted-foreground capitalize">{type}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Posts Management */}
          {currentView === "posts" && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                      <FileText className="w-6 h-6" />
                      إدارة المقالات
                    </h2>
                    <Button
                      onClick={() => setCurrentView("create-post")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <PlusCircle className="w-4 h-4 ml-2" />
                      إضافة مقال جديد
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-right font-bold text-foreground">العنوان</TableHead>
                      <TableHead className="text-right font-bold text-foreground">النوع</TableHead>
                      <TableHead className="text-right font-bold text-foreground">الكاتب</TableHead>
                      <TableHead className="text-right font-bold text-foreground">المشاهدات</TableHead>
                      <TableHead className="text-right font-bold text-foreground">مميز</TableHead>
                      <TableHead className="text-right font-bold text-foreground">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right font-bold text-foreground">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post, index) => (
                      <TableRow key={post.id} className={index % 2 === 0 ? "bg-muted/20" : "bg-card"}>
                        <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            {post.content_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{post.author}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-chart-1 font-medium">
                            <Eye className="w-4 h-4 ml-1" />
                            {post.view_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.is_featured && <Star className="w-4 h-4 text-chart-2 fill-chart-2" />}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditPost(post)}
                              className="bg-muted/50 text-foreground border-border hover:bg-muted"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePost(post.slug)}
                              disabled={loading}
                              className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Create/Edit Post */}
          {(currentView === "create-post" || currentView === "edit-post") && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                      <Edit className="w-6 h-6" />
                      {currentView === "create-post" ? "إضافة مقال جديد" : "تعديل المقال"}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentView("posts")
                        resetPostForm()
                        setSelectedPost(null)
                      }}
                      className="bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    >
                      <X className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground font-medium">
                        العنوان
                      </Label>
                      <Input
                        id="title"
                        value={postForm.title}
                        onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="أدخل عنوان المقال"
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content_type" className="text-foreground font-medium">
                        نوع المحتوى
                      </Label>
                      <Select
                        value={postForm.content_type}
                        onValueChange={(value) => setPostForm((prev) => ({ ...prev, content_type: value }))}
                      >
                        <SelectTrigger className="bg-muted/30 border-border focus:border-ring">
                          <SelectValue placeholder="اختر نوع المحتوى" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">مقال</SelectItem>
                          <SelectItem value="news">خبر</SelectItem>
                          <SelectItem value="tutorial">درس تعليمي</SelectItem>
                          <SelectItem value="review">مراجعة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-foreground font-medium">
                      المحتوى
                    </Label>
                    <Textarea
                      id="content"
                      value={postForm.content}
                      onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="أدخل محتوى المقال"
                      rows={8}
                      className="bg-muted/30 border-border focus:border-ring"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">الكلمات المفتاحية</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="أدخل كلمة مفتاحية"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        إضافة
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {postForm.tags?.map((tag, index) => {
                        const chartColors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]
                        const colorClass = chartColors[index % chartColors.length]
                        return (
                          <Badge
                            key={tag}
                            className={`cursor-pointer bg-muted text-muted-foreground hover:bg-muted/80 border-border bg-${colorClass}`}
                            onClick={() => removeTag(tag)}
                          >
                            {tag} <X className="w-3 h-3 mr-1" />
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta_title" className="text-foreground font-medium">
                        عنوان SEO
                      </Label>
                      <Input
                        id="meta_title"
                        value={postForm.meta_title}
                        onChange={(e) => setPostForm((prev) => ({ ...prev, meta_title: e.target.value }))}
                        placeholder="عنوان محرك البحث"
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_description" className="text-foreground font-medium">
                        وصف SEO
                      </Label>
                      <Input
                        id="meta_description"
                        value={postForm.meta_description}
                        onChange={(e) => setPostForm((prev) => ({ ...prev, meta_description: e.target.value }))}
                        placeholder="وصف محرك البحث"
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse bg-muted/30 p-4 rounded-lg border border-border">
                    <Switch
                      id="is_featured"
                      checked={postForm.is_featured}
                      onCheckedChange={(checked) => setPostForm((prev) => ({ ...prev, is_featured: checked }))}
                    />
                    <Label htmlFor="is_featured" className="text-foreground font-medium flex items-center gap-2">
                      <Star className="w-4 h-4 text-chart-2" />
                      مقال مميز
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={currentView === "create-post" ? handleCreatePost : handleUpdatePost}
                      disabled={loading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {currentView === "create-post" ? "إنشاء المقال" : "حفظ التغييرات"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Management */}
          {currentView === "users" && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                      <Users className="w-6 h-6" />
                      إدارة المستخدمين
                    </h2>
                    <Button
                      onClick={() => setCurrentView("create-user")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <PlusCircle className="w-4 h-4 ml-2" />
                      إضافة مستخدم جديد
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-right font-bold text-foreground">الاسم</TableHead>
                      <TableHead className="text-right font-bold text-foreground">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right font-bold text-foreground">الدور</TableHead>
                      <TableHead className="text-right font-bold text-foreground">الحالة</TableHead>
                      <TableHead className="text-right font-bold text-foreground">تاريخ التسجيل</TableHead>
                      <TableHead className="text-right font-bold text-foreground">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={user.id} className={index % 2 === 0 ? "bg-muted/20" : "bg-card"}>
                        <TableCell className="font-medium text-foreground">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.is_active ? (
                              <>
                                <UserCheck className="w-4 h-4 text-chart-1" />
                                <span className="text-chart-1 font-medium">نشط</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-4 h-4 text-destructive" />
                                <span className="text-destructive font-medium">غير نشط</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.date_joined).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditUser(user)}
                              className="bg-muted/50 text-foreground border-border hover:bg-muted flex-1"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserActive(user.id)}
                              disabled={loading}
                              className={
                                user.is_active
                                  ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 flex-1"
                                  : "bg-chart-1/10 text-chart-1 border-chart-1/20 hover:bg-chart-1/20 flex-1"
                              }
                            >
                              {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Create/Edit User */}
          {(currentView === "create-user" || currentView === "edit-user") && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                      <Users className="w-6 h-6" />
                      {currentView === "create-user" ? "إضافة مستخدم جديد" : "تعديل المستخدم"}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentView("users")
                        resetUserForm()
                        setSelectedUser(null)
                      }}
                      className="bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    >
                      <X className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="أدخل البريد الإلكتروني"
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-foreground font-medium">
                        الدور
                      </Label>
                      <Select
                        value={userForm.role}
                        onValueChange={(value) => setUserForm((prev) => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger className="bg-muted/30 border-border focus:border-ring">
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">مستخدم</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="editor">محرر</SelectItem>
                          <SelectItem value="author">كاتب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-foreground font-medium">
                        الاسم الأول
                      </Label>
                      <Input
                        id="first_name"
                        value={userForm.first_name}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="أدخل الاسم الأول"
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-foreground font-medium">
                        الاسم الأخير
                      </Label>
                      <Input
                        id="last_name"
                        value={userForm.last_name}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="أدخل الاسم الأخير"
                        className="bg-muted/30 border-border focus:border-ring"
                      />
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      معلومات الملف الشخصي
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className="text-foreground font-medium">
                          رقم الهاتف
                        </Label>
                        <Input
                          id="phone_number"
                          value={userForm.profile?.phone_number || ""}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, phone_number: e.target.value },
                            }))
                          }
                          placeholder="أدخل رقم الهاتف"
                          className="bg-card border-border focus:border-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="text-foreground font-medium">
                          المهنة
                        </Label>
                        <Input
                          id="occupation"
                          value={userForm.profile?.occupation || ""}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, occupation: e.target.value },
                            }))
                          }
                          placeholder="أدخل المهنة"
                          className="bg-card border-border focus:border-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="address" className="text-foreground font-medium">
                        العنوان
                      </Label>
                      <Input
                        id="address"
                        value={userForm.profile?.address || ""}
                        onChange={(e) =>
                          setUserForm((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, address: e.target.value },
                          }))
                        }
                        placeholder="أدخل العنوان"
                        className="bg-card border-border focus:border-ring"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-foreground font-medium">
                          المدينة
                        </Label>
                        <Input
                          id="city"
                          value={userForm.profile?.city || ""}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, city: e.target.value },
                            }))
                          }
                          placeholder="أدخل المدينة"
                          className="bg-card border-border focus:border-ring"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-foreground font-medium">
                          البلد
                        </Label>
                        <Input
                          id="country"
                          value={userForm.profile?.country || ""}
                          onChange={(e) =>
                            setUserForm((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, country: e.target.value },
                            }))
                          }
                          placeholder="أدخل البلد"
                          className="bg-card border-border focus:border-ring"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-8 bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="is_active"
                        checked={userForm.is_active}
                        onCheckedChange={(checked) => setUserForm((prev) => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active" className="text-foreground font-medium flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-chart-1" />
                        مستخدم نشط
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="email_verified"
                        checked={userForm.email_verified}
                        onCheckedChange={(checked) => setUserForm((prev) => ({ ...prev, email_verified: checked }))}
                      />
                      <Label htmlFor="email_verified" className="text-foreground font-medium flex items-center gap-2">
                        <Badge className="w-4 h-4 bg-chart-2" />
                        البريد الإلكتروني مؤكد
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={currentView === "create-user" ? handleCreateUser : handleUpdateUser}
                      disabled={loading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      {currentView === "create-user" ? "إنشاء المستخدم" : "حفظ التغييرات"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Creators */}
          {currentView === "creators" && (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                      <Star className="w-6 h-6" />
                      منشئي المحتوى
                    </h2>
                    <Button
                      onClick={loadCreators}
                      disabled={loading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <TrendingUp className="w-4 h-4 ml-2" />
                      تحديث القائمة
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creators.map((creator, index) => {
                  const chartColors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]
                  const colorClass = chartColors[index % chartColors.length]
                  return (
                    <Card key={creator.id} className="border-0 shadow-lg bg-card overflow-hidden">
                      <div className={`h-1 bg-${colorClass}`}></div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-foreground">
                            {creator.first_name} {creator.last_name}
                          </CardTitle>
                          {creator.is_active ? (
                            <div className="bg-chart-1/20 p-2 rounded-full">
                              <UserCheck className="w-5 h-5 text-chart-1" />
                            </div>
                          ) : (
                            <div className="bg-destructive/20 p-2 rounded-full">
                              <UserX className="w-5 h-5 text-destructive" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-muted-foreground">{creator.email}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            {creator.role}
                          </Badge>
                          <Badge
                            variant={creator.email_verified ? "default" : "secondary"}
                            className={
                              creator.email_verified
                                ? "bg-chart-1/20 text-chart-1 border-chart-1/30"
                                : "bg-muted text-muted-foreground border-border"
                            }
                          >
                            {creator.email_verified ? "مؤكد" : "غير مؤكد"}
                          </Badge>
                        </div>

                        {creator.profile && (
                          <div className="space-y-2 text-sm">
                            {creator.profile.phone_number && (
                              <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded border border-border">
                                <Phone className="w-4 h-4 text-chart-2" />
                                {creator.profile.phone_number}
                              </div>
                            )}
                            {creator.profile.city && (
                              <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded border border-border">
                                <MapPin className="w-4 h-4 text-chart-3" />
                                {creator.profile.city}, {creator.profile.country}
                              </div>
                            )}
                            {creator.profile.occupation && (
                              <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded border border-border">
                                <Briefcase className="w-4 h-4 text-chart-4" />
                                {creator.profile.occupation}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded border border-border">
                          <Calendar className="w-4 h-4 text-chart-5" />
                          انضم في {new Date(creator.date_joined).toLocaleDateString("ar-SA")}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditUser(creator)}
                            className="bg-muted/50 text-foreground border-border hover:bg-muted flex-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserActive(creator.id)}
                            disabled={loading}
                            className={
                              creator.is_active
                                ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 flex-1"
                                : "bg-chart-1/10 text-chart-1 border-chart-1/20 hover:bg-chart-1/20 flex-1"
                            }
                          >
                            {creator.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
