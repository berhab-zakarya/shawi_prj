"use client"

import { useState } from "react"
import type { AdminUser, UpdateAdminUserData } from "@/types/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Save, User, Phone, Briefcase, Globe } from "lucide-react"

interface UserDetailsProps {
  user: AdminUser
  loading: boolean
  onUpdateUser: (id: number, data: UpdateAdminUserData) => Promise<AdminUser>
  onBack: () => void
}

export default function UserDetails({ user, loading, onUpdateUser, onBack }: UserDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateAdminUserData>({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    bio: "",
    time_zone: "",
    role: undefined,
    profile: {},
  })

  const handleInputChange = (field: keyof UpdateAdminUserData, value: any) => {
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

  const handleSave = async () => {
    try {
      await onUpdateUser(user.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error("خطأ في تحديث المستخدم:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">تفاصيل المستخدم</h2>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg">{user.full_name}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">الحالة:</span>
                <Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? "نشط" : "غير نشط"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">البريد مؤكد:</span>
                <Badge variant={user.email_verified ? "default" : "destructive"}>
                  {user.email_verified ? "نعم" : "لا"}
                </Badge>
              </div>
              {user.role && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">الدور:</span>
                  <span className="text-sm">{user.role}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium">تاريخ الانضمام:</span>
                <span className="text-sm">{new Date(user.date_joined).toLocaleDateString("ar-SA")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isEditing ? "تعديل المعلومات" : "معلومات المستخدم"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">الاسم الأول</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">الاسم الأخير</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">النبذة الشخصية</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="time_zone">المنطقة الزمنية</Label>
                  <Input
                    id="time_zone"
                    value={formData.time_zone}
                    onChange={(e) => handleInputChange("time_zone", e.target.value)}
                    placeholder="مثال: Asia/Riyadh"
                  />
                </div>

                {/* Profile Info */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    معلومات الاتصال
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone_number">رقم الهاتف</Label>
                      <Input
                        id="phone_number"
                        value={formData.profile?.phone_number || ""}
                        onChange={(e) => handleProfileChange("phone_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={formData.profile?.address || ""}
                        onChange={(e) => handleProfileChange("address", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">المدينة</Label>
                      <Input
                        id="city"
                        value={formData.profile?.city || ""}
                        onChange={(e) => handleProfileChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">البلد</Label>
                      <Input
                        id="country"
                        value={formData.profile?.country || ""}
                        onChange={(e) => handleProfileChange("country", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    المعلومات المهنية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="occupation">المهنة</Label>
                      <Input
                        id="occupation"
                        value={formData.profile?.occupation || ""}
                        onChange={(e) => handleProfileChange("occupation", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name">اسم الشركة</Label>
                      <Input
                        id="company_name"
                        value={formData.profile?.company_name || ""}
                        onChange={(e) => handleProfileChange("company_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="education">التعليم</Label>
                      <Input
                        id="education"
                        value={formData.profile?.education || ""}
                        onChange={(e) => handleProfileChange("education", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="languages">اللغات</Label>
                      <Input
                        id="languages"
                        value={formData.profile?.languages || ""}
                        onChange={(e) => handleProfileChange("languages", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    الروابط الاجتماعية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin_url">LinkedIn</Label>
                      <Input
                        id="linkedin_url"
                        value={formData.profile?.linkedin_url || ""}
                        onChange={(e) => handleProfileChange("linkedin_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter_url">Twitter</Label>
                      <Input
                        id="twitter_url"
                        value={formData.profile?.twitter_url || ""}
                        onChange={(e) => handleProfileChange("twitter_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">الموقع الشخصي</Label>
                      <Input
                        id="website"
                        value={formData.profile?.website || ""}
                        onChange={(e) => handleProfileChange("website", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>اضغط على "تعديل" لتحرير معلومات المستخدم</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
