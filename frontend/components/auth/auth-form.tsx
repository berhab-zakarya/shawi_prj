"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff,  Mail, Lock, UserCheck } from "lucide-react"
import { useAuthForm } from "@/hooks/use-auth-form"

interface AuthFormProps {
  isLogin: boolean
  onToggleMode: () => void
}

export function AuthForm({ isLogin, onToggleMode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { formData, errors, isLoading, handleInputChange, handleSubmit, resetForm, isSuccess, successMessage, user } = useAuthForm(isLogin)

  // Effect to switch to login mode after successful registration
  useEffect(() => {
    if (!isLogin && isSuccess && successMessage) {
      const timer = setTimeout(() => {
        resetForm()
        onToggleMode()
      }, 2000) // Delay of 2 seconds to show success message
      return () => clearTimeout(timer) // Cleanup timer on unmount
    }
  }, [isSuccess, isLogin, successMessage, resetForm, onToggleMode])

  const handleModeToggle = () => {
    resetForm()
    onToggleMode()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <p className="text-gray-600">{isLogin ? "أهلاً بك مرة أخرى!" : "انضم إلينا اليوم"}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="first_name" className="text-right block text-gray-700 font-medium">
                  الاسم الأول
                </Label>
                <div className="relative">
                  <Input
                    id="first_name"
                    type="text"
                    value={formData.first_name || ""}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className={`pl-4 pr-4 h-12 text-right ${errors.first_name ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    placeholder="أدخل اسمك الأول"
                    dir="rtl"
                  />
                </div>
                {errors.first_name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-right">
                    {errors.first_name}
                  </motion.p>
                )}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="last_name" className="text-right block text-gray-700 font-medium">
                  الاسم الأخير
                </Label>
                <div className="relative">
                  <Input
                    id="last_name"
                    type="text"
                    value={formData.last_name || ""}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className={`pl-4 pr-4 h-12 text-right ${errors.last_name ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    placeholder="أدخل اسمك الأخير"
                    dir="rtl"
                  />
                </div>
                {errors.last_name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-right">
                    {errors.last_name}
                  </motion.p>
                )}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block text-gray-700 font-medium">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 pr-4 h-12 text-right ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="rtl"
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-right">
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block text-gray-700 font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-12 h-12 text-right ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                  placeholder="أدخل كلمة المرور"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-right">
                  {errors.password}
                </motion.p>
              )}
              {!isLogin && !errors.password && (
                <p className="text-gray-500 text-sm text-right">
                  استخدم 8 أحرف أو أكثر مع مزيج من الأحرف والأرقام والرموز
                </p>
              )}
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword" className="text-right block text-gray-700 font-medium">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword || ""}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-12 h-12 text-right ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                    placeholder="أعد إدخال كلمة المرور"
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-right"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="role" className="text-right block text-gray-700 font-medium">
                  نوع الحساب
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Select
                    value={formData.role?.toString()}
                    onValueChange={(value) => handleInputChange("role", parseInt(value))}
                  >
                    <SelectTrigger
                      className={`h-12 text-right pl-10 pr-4 ${errors.role ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200`}
                      dir="rtl"
                    >
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3" className="text-right">
                        محامي
                      </SelectItem>
                      <SelectItem value="2" className="text-right">
                        عميل
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.role && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-right">
                    {errors.role}
                  </motion.p>
                )}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-right text-sm text-gray-600"
              >
                بإنشاء حساب، فإنك توافق على{" "}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  شروط الاستخدام
                </a>{" "}
                و{" "}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  سياسة الخصوصية
                </a>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-br from-[#F5D76E] via-[#D4AF37] to-[#7B6314] hover:from-[#7B6314] hover:to-[#7B6314] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
              <button
                onClick={handleModeToggle}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
              </button>
            </p>
          </div>
        </CardContent>

        {/* FOR ERRORS */}
        {errors.general && (
          <div className="px-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-right"
            >
              {errors.general}
            </motion.div>
          </div>
        )}

        {isSuccess && (
          <div className="px-6 pb-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-right"
            >
              {successMessage}
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}