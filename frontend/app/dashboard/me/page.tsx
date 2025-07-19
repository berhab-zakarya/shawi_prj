"use client"

import type React from "react"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import type { UpdateProfileData } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Camera,
  MapPin,
  Globe,
  Calendar,
  Users,
  GraduationCap,
  Building,
  Scale,

  Link,
  Languages,
  Flag,
  Heart,
  Twitter,
  Linkedin,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ProfileUpdatePage() {
  const { user, loading, errorMessage, updateProfile } = useProfile()
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof UpdateProfileData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProfileChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }))
      const reader = new FileReader()
      reader.onload = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateProfile(formData)
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث ملفك الشخصي بنجاح",
      })
      setFormData({})
      setAvatarPreview("")
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث ملفك الشخصي",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeZones = [
    { value: "Asia/Riyadh", label: "الرياض (GMT+3)" },
    { value: "Asia/Dubai", label: "دبي (GMT+4)" },
    { value: "Africa/Cairo", label: "القاهرة (GMT+2)" },
    { value: "Asia/Baghdad", label: "بغداد (GMT+3)" },
    { value: "Asia/Beirut", label: "بيروت (GMT+2)" },
    { value: "Africa/Casablanca", label: "الدار البيضاء (GMT+1)" },
  ]

  // const roles = [
  //   { value: 1, label: "محامي" },
  //   { value: 2, label: "مستشار قانوني" },
  //   { value: 3, label: "قاضي" },
  //   { value: 4, label: "مدعي عام" },
  //   { value: 5, label: "كاتب عدل" },
  // ]

  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ]

  const countries = [
    { value: "SA", label: "المملكة العربية السعودية" },
    { value: "AE", label: "الإمارات العربية المتحدة" },
    { value: "EG", label: "مصر" },
    { value: "IQ", label: "العراق" },
    { value: "LB", label: "لبنان" },
    { value: "MA", label: "المغرب" },
    { value: "JO", label: "الأردن" },
    { value: "KW", label: "الكويت" },
    { value: "QA", label: "قطر" },
    { value: "BH", label: "البحرين" },
    { value: "OM", label: "عمان" },
  ]

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center"
        dir="rtl"
      >
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
          جاري التحميل...
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(139, 92, 246, 0.1) 2px, transparent 0)
          `,
            backgroundSize: "100px 100px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(139, 92, 246, 0.05) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.05) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(139, 92, 246, 0.05) 75%)
          `,
            backgroundSize: "60px 60px",
            backgroundPosition: "0 0, 0 30px, 30px -30px, -30px 0px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">تحديث الملف الشخصي</h1>
            <p className="text-slate-600 dark:text-slate-400">قم بتحديث معلوماتك الشخصية والمهنية</p>
          </div>

          {errorMessage && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertDescription className="text-red-800 dark:text-red-200">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5" />
                  الصورة الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-slate-200 dark:border-slate-700">
                      <AvatarImage src={avatarPreview || user.avatar || ""} alt="الصورة الشخصية" />
                      <AvatarFallback className="text-2xl">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">انقر لتغيير الصورة الشخصية</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    المعلومات الأساسية
                  </CardTitle>
                  <CardDescription>المعلومات الشخصية الأساسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        الاسم الأول
                      </Label>
                      <Input
                        id="firstName"
                        placeholder={user.first_name || "أدخل الاسم الأول"}
                        value={formData.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        الاسم الأخير
                      </Label>
                      <Input
                        id="lastName"
                        placeholder={user.last_name || "أدخل الاسم الأخير"}
                        value={formData.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      البريد الإلكتروني
                    </Label>
                    <Input value={user.email} disabled className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed" />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      نبذة شخصية
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder={user.bio || "اكتب نبذة مختصرة عنك..."}
                      value={formData.bio || ""}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="bg-white/50 dark:bg-slate-900/50 resize-none"
                    />
                  </div>

            
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    المعلومات الشخصية
                  </CardTitle>
                  <CardDescription>التفاصيل الشخصية الإضافية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date of Birth and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        تاريخ الميلاد
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.profile?.date_of_birth || ""}
                        onChange={(e) => handleProfileChange("date_of_birth", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        الجنس
                      </Label>
                      <Select
                        value={formData.profile?.gender || ""}
                        onValueChange={(value) => handleProfileChange("gender", value)}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                          <SelectValue placeholder={user.gender || "اختر الجنس"} />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Nationality and Languages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        الجنسية
                      </Label>
                      <Select
                        value={formData.profile?.nationality || ""}
                        onValueChange={(value) => handleProfileChange("nationality", value)}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                          <SelectValue placeholder={user.nationality || "اختر الجنسية"} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="languages" className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        اللغات
                      </Label>
                      <Input
                        id="languages"
                        placeholder={user.languages || "العربية، الإنجليزية"}
                        value={formData.profile?.languages || ""}
                        onChange={(e) => handleProfileChange("languages", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    معلومات الاتصال
                  </CardTitle>
                  <CardDescription>طرق التواصل والعنوان</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={user.phone_number || "أدخل رقم الهاتف"}
                      value={formData.profile?.phone_number || ""}
                      onChange={(e) => handleProfileChange("phone_number", e.target.value)}
                      className="bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      العنوان
                    </Label>
                    <Input
                      id="address"
                      placeholder={user.address || "أدخل العنوان"}
                      value={formData.profile?.address || ""}
                      onChange={(e) => handleProfileChange("address", e.target.value)}
                      className="bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>

                  {/* City and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        المدينة
                      </Label>
                      <Input
                        id="city"
                        placeholder={user.city || "أدخل المدينة"}
                        value={formData.profile?.city || ""}
                        onChange={(e) => handleProfileChange("city", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        الدولة
                      </Label>
                      <Select
                        value={formData.profile?.country || ""}
                        onValueChange={(value) => handleProfileChange("country", value)}
                      >
                        <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                          <SelectValue placeholder={user.country || "اختر الدولة"} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    المعلومات المهنية
                  </CardTitle>
                  <CardDescription>التفاصيل المهنية والتعليمية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Occupation and Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        المهنة
                      </Label>
                      <Input
                        id="occupation"
                        placeholder={user.occupation || "أدخل المهنة"}
                        value={formData.profile?.occupation || ""}
                        onChange={(e) => handleProfileChange("occupation", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        اسم الشركة
                      </Label>
                      <Input
                        id="companyName"
                        placeholder={user.company_name || "أدخل اسم الشركة"}
                        value={formData.profile?.company_name || ""}
                        onChange={(e) => handleProfileChange("company_name", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <Label htmlFor="education" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      التعليم
                    </Label>
                    <Input
                      id="education"
                      placeholder={user.education || "أدخل المؤهل التعليمي"}
                      value={formData.profile?.education || ""}
                      onChange={(e) => handleProfileChange("education", e.target.value)}
                      className="bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>

                  {/* License and Bar Association */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        رقم الترخيص
                      </Label>
                      <Input
                        id="licenseNumber"
                        placeholder={user.license_number || "أدخل رقم الترخيص"}
                        value={formData.profile?.license_number || ""}
                        onChange={(e) => handleProfileChange("license_number", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barAssociation" className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        نقابة المحامين
                      </Label>
                      <Input
                        id="barAssociation"
                        placeholder={user.bar_association || "أدخل نقابة المحامين"}
                        value={formData.profile?.bar_association || ""}
                        onChange={(e) => handleProfileChange("bar_association", e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Media Links */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  روابط التواصل الاجتماعي
                </CardTitle>
                <CardDescription>روابط ملفاتك الشخصية على وسائل التواصل الاجتماعي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder={user.linkedin_url || "https://linkedin.com/in/username"}
                      value={formData.profile?.linkedin_url || ""}
                      onChange={(e) => handleProfileChange("linkedin_url", e.target.value)}
                      className="bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>

                  {/* Twitter */}
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      type="url"
                      placeholder={user.twitter_url || "https://twitter.com/username"}
                      value={formData.profile?.twitter_url || ""}
                      onChange={(e) => handleProfileChange("twitter_url", e.target.value)}
                      className="bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      الموقع الشخصي
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder={user.website || "https://example.com"}
                      value={formData.profile?.website || ""}
                      onChange={(e) => handleProfileChange("website", e.target.value)}
                      className="bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
